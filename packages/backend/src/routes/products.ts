import { Hono } from "hono";
import { getControlDb, getTenantDb } from "../lib/db";
import { authenticateMerchant, resolveStorefrontTenant } from "../middleware/auth";
import { ProductSchema } from "@basecart/shared";
import { ImageService } from "../services/image";

const app = new Hono<{ Bindings: any; Variables: any }>();

/**
 * Validates SKU uniqueness across all products and variants in the tenant database
 */
async function validateSkuUniqueness(
  currentProductId: string | null,
  payload: any,
  db: any
): Promise<string | null> {
  const result = await db.prepare("SELECT productId, sku, variants FROM products").all();
  const existingProducts = result.results || [];
  const usedSkus = new Set<string>();

  for (const prod of existingProducts) {
    if (currentProductId && prod.productId === currentProductId) {
      continue;
    }

    if (prod.sku && prod.sku.trim() !== "") {
      usedSkus.add(prod.sku.trim().toLowerCase());
    }

    let variants: any[] = [];
    if (prod.variants) {
      try {
        variants = typeof prod.variants === "string" ? JSON.parse(prod.variants) : prod.variants;
      } catch (e) {}
    }

    if (Array.isArray(variants)) {
      for (const variant of variants) {
        if (variant.sku && variant.sku.trim() !== "") {
          usedSkus.add(variant.sku.trim().toLowerCase());
        }
      }
    }
  }

  const payloadSkus = new Set<string>();

  if (payload.sku && payload.sku.trim() !== "") {
    const s = payload.sku.trim().toLowerCase();
    if (usedSkus.has(s)) {
      return `SKU "${payload.sku}" is already in use by another product.`;
    }
    payloadSkus.add(s);
  }

  if (Array.isArray(payload.variants)) {
    for (const variant of payload.variants) {
      if (variant.sku && variant.sku.trim() !== "") {
        const s = variant.sku.trim().toLowerCase();
        if (usedSkus.has(s)) {
          return `SKU "${variant.sku}" is already in use by another variant or product.`;
        }
        if (payloadSkus.has(s)) {
          return `Duplicate SKU "${variant.sku}" specified within the same product configuration.`;
        }
        payloadSkus.add(s);
      }
    }
  }

  return null;
}

/**
 * Format database product row to payload array types
 */
function formatProduct(prod: any) {
  if (!prod) return prod;
  const copy = { ...prod };
  if (copy.images && typeof copy.images === "string") {
    try {
      copy.images = JSON.parse(copy.images);
    } catch (e) {
      copy.images = [];
    }
  }
  if (copy.variants && typeof copy.variants === "string") {
    try {
      copy.variants = JSON.parse(copy.variants);
    } catch (e) {
      copy.variants = [];
    }
  }
  return copy;
}

// -------------------------------------------------------------
// 1. Merchant Products CRUD Endpoints (Writes go straight to DO)
// -------------------------------------------------------------

/**
 * Create Product
 */
app.post("/products", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const body = await c.req.json().catch(() => ({}));
  const parseResult = ProductSchema.safeParse(body);

  if (!parseResult.success) {
    return c.json({
      error: "Validation failed",
      issues: parseResult.error.format(),
    }, 400);
  }

  const productData = parseResult.data;
  const tenantDb = await getTenantDb(tenantId, c.env);

  // 1. Validate SKU uniqueness
  const skuError = await validateSkuUniqueness(null, productData, tenantDb);
  if (skuError) {
    return c.json({ error: skuError }, 400);
  }

  // 2. Enforce plan limits from control DB
  const controlDb = getControlDb(c.env);
  const tenantRow = await controlDb
    .prepare("SELECT plan FROM tenants WHERE tenantId = ?")
    .bind(tenantId)
    .first<{ plan: string }>();

  const plan = tenantRow?.plan || "starter";

  const countRow = await tenantDb
    .prepare("SELECT COUNT(*) as total FROM products")
    .first<{ total: number }>();
  const count = countRow?.total || 0;

  if (plan === "starter" && count >= 50) {
    return c.json({
      error: "Plan limit reached: Starter tier allows a maximum of 50 products. Please upgrade your plan.",
    }, 403);
  }
  if (plan === "growth" && count >= 500) {
    return c.json({
      error: "Plan limit reached: Growth tier allows a maximum of 500 products. Please upgrade your plan.",
    }, 403);
  }

  const productId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await tenantDb
    .prepare(
      "INSERT INTO products (productId, name, description, price, stockQuantity, status, images, compareAtPrice, costPerItem, sku, barcode, category, productType, vendor, weight, seoTitle, seoDescription, continueSellingOutOfStock, variants, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      productId,
      productData.name,
      productData.description || null,
      productData.price,
      productData.stockQuantity,
      productData.status || "active",
      JSON.stringify(productData.images || []),
      productData.compareAtPrice || null,
      productData.costPerItem || null,
      productData.sku || null,
      productData.barcode || null,
      productData.category || null,
      productData.productType || null,
      productData.vendor || null,
      productData.weight || null,
      productData.seoTitle || null,
      productData.seoDescription || null,
      productData.continueSellingOutOfStock ? 1 : 0,
      JSON.stringify(productData.variants || []),
      createdAt,
      createdAt
    )
    .run();

  const saved = await tenantDb
    .prepare("SELECT * FROM products WHERE productId = ?")
    .bind(productId)
    .first();

  return c.json(formatProduct(saved), 201);
});

/**
 * List Products
 */
app.get("/products", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const tenantDb = await getTenantDb(tenantId, c.env);
  const result = await tenantDb.prepare("SELECT * FROM products ORDER BY createdAt DESC").all();
  const products = (result.results || []).map(formatProduct);
  return c.json(products);
});

/**
 * Get Product
 */
app.get("/products/:id", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const productId = c.req.param("id");
  const tenantDb = await getTenantDb(tenantId, c.env);

  const product = await tenantDb
    .prepare("SELECT * FROM products WHERE productId = ?")
    .bind(productId)
    .first();

  if (!product) {
    return c.json({ error: "Product not found" }, 404);
  }

  return c.json(formatProduct(product));
});

/**
 * Update Product
 */
app.patch("/products/:id", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const productId = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const parseResult = ProductSchema.safeParse(body);

  if (!parseResult.success) {
    return c.json({
      error: "Validation failed",
      issues: parseResult.error.format(),
    }, 400);
  }

  const productData = parseResult.data;
  const tenantDb = await getTenantDb(tenantId, c.env);

  // 1. Verify the product exists
  const existing = await tenantDb
    .prepare("SELECT productId, images FROM products WHERE productId = ?")
    .bind(productId as string)
    .first<{ productId: string; images: string }>();

  if (!existing) {
    return c.json({ error: "Product not found" }, 404);
  }

  // 2. Validate SKU uniqueness
  const skuError = await validateSkuUniqueness(productId || null, productData, tenantDb);
  if (skuError) {
    return c.json({ error: skuError }, 400);
  }

  const updatedAt = new Date().toISOString();

  await tenantDb
    .prepare(
      "UPDATE products SET name = ?, description = ?, price = ?, stockQuantity = ?, status = ?, images = ?, compareAtPrice = ?, costPerItem = ?, sku = ?, barcode = ?, category = ?, productType = ?, vendor = ?, weight = ?, seoTitle = ?, seoDescription = ?, continueSellingOutOfStock = ?, variants = ?, updatedAt = ? WHERE productId = ?"
    )
    .bind(
      productData.name,
      productData.description || null,
      productData.price,
      productData.stockQuantity,
      productData.status || "active",
      JSON.stringify(productData.images || []),
      productData.compareAtPrice || null,
      productData.costPerItem || null,
      productData.sku || null,
      productData.barcode || null,
      productData.category || null,
      productData.productType || null,
      productData.vendor || null,
      productData.weight || null,
      productData.seoTitle || null,
      productData.seoDescription || null,
      productData.continueSellingOutOfStock ? 1 : 0,
      JSON.stringify(productData.variants || []),
      updatedAt,
      productId
    )
    .run();

  // Replacement logic: delete orphaned old images from R2 after successful database update
  try {
    const oldImages: string[] = JSON.parse(existing.images || "[]");
    const newImages: string[] = productData.images || [];
    const deletedImages = oldImages.filter((img) => !newImages.includes(img));
    for (const imgKey of deletedImages) {
      if (imgKey.startsWith("tenants/")) {
        await ImageService.deleteImage(c.env, imgKey);
      }
    }
  } catch (err) {
    console.error("Failed to clean up orphaned product images:", err);
  }

  return c.json({ message: "Product updated successfully" });
});

/**
 * Delete Product
 */
app.delete("/products/:id", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const productId = c.req.param("id");
  const tenantDb = await getTenantDb(tenantId, c.env);

  const existing = await tenantDb
    .prepare("SELECT productId, images FROM products WHERE productId = ?")
    .bind(productId as string)
    .first<{ productId: string; images: string }>();

  if (!existing) {
    return c.json({ error: "Product not found" }, 404);
  }

  // Delete product images from R2
  try {
    const imageKeys: string[] = JSON.parse(existing.images || "[]");
    for (const key of imageKeys) {
      if (key.startsWith("tenants/")) {
        await ImageService.deleteImage(c.env, key);
      }
    }
  } catch (err) {
    console.error("Failed to delete product images from R2 on delete:", err);
  }

  await tenantDb
    .prepare("DELETE FROM products WHERE productId = ?")
    .bind(productId as string)
    .run();

  return c.json({ message: "Product deleted successfully" });
});

/**
 * Generate Presigned Upload URL for Image Storage
 */
app.post("/products/:id/upload-image", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const productId = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));

  const { fileName, contentType, fileSize, headerHex } = body;

  if (!fileName || !contentType || !fileSize || !headerHex) {
    return c.json({
      error: "Missing parameters: fileName, contentType, fileSize, headerHex are required",
    }, 400);
  }

  try {
    const { uploadUrl, key } = await ImageService.generateUploadUrl(
      c.env,
      tenantId,
      "products",
      productId,
      fileName as string,
      contentType as string,
      fileSize as number,
      headerHex as string
    );

    return c.json({ uploadUrl, imageUrl: key });
  } catch (err: any) {
    console.error("Failed to generate presigned upload credentials:", err);
    return c.json({ error: err.message || "Failed to generate upload credentials" }, 400);
  }
});

// -------------------------------------------------------------
// 2. Storefront Public Endpoints (Reads: Marked Future-Cacheable)
// -------------------------------------------------------------

/**
 * List Active Products (Storefront public)
 * FUTURE-CACHEABLE: Public catalog reads can be served from edge KV cache
 */
app.get("/store/:subdomain/products", resolveStorefrontTenant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const tenantDb = await getTenantDb(tenantId, c.env);
  
  const result = await tenantDb
    .prepare("SELECT * FROM products WHERE status = 'active' ORDER BY createdAt DESC")
    .all();

  const products = (result.results || []).map(formatProduct);
  return c.json(products);
});

/**
 * Get Product detail (Storefront public)
 * FUTURE-CACHEABLE: Product detail page reads can be served from edge KV cache
 */
app.get("/store/:subdomain/products/:id", resolveStorefrontTenant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const productId = c.req.param("id");
  const tenantDb = await getTenantDb(tenantId, c.env);

  const product = await tenantDb
    .prepare("SELECT * FROM products WHERE productId = ? AND status = 'active'")
    .bind(productId)
    .first();

  if (!product) {
    return c.json({ error: "Product not found or unavailable" }, 404);
  }

  return c.json(formatProduct(product));
});

export default app;
