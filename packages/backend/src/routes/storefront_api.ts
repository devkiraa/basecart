import { Hono } from "hono";
import { getControlDb } from "../lib/db";

function getTenantDoStub(env: any, tenantId: string) {
  if (env.TENANT_DO && typeof env.TENANT_DO.idFromName === "function") {
    const id = env.TENANT_DO.idFromName(tenantId);
    return env.TENANT_DO.get(id);
  }
  return null;
}

const app = new Hono<{ Bindings: any; Variables: any }>();

// Middleware: Validate Storefront API Key or Tenant (B1 requirement)
app.use("*", async (c, next) => {
  const apiKey = c.req.header("x-api-key") || c.req.header("authorization")?.replace("Bearer ", "");
  const merchantId = c.req.header("x-merchant-id");
  const storeId = c.req.header("x-store-id") || c.req.header("x-subdomain");

  const identifier = apiKey || storeId || merchantId;
  if (!identifier) {
    return c.json({ error: "Unauthorized: Missing required Storefront API key or Store identifier (x-api-key or Authorization)" }, 401);
  }

  const db = getControlDb(c.env);
  const tenant = await db
    .prepare("SELECT tenantId, status FROM tenants WHERE tenantId = ? OR subdomain = ? OR customDomain = ?")
    .bind(identifier, identifier, identifier)
    .first<any>();

  if (!tenant) {
    return c.json({ error: "Unauthorized: Invalid Storefront API key or store identifier" }, 401);
  }

  if (tenant.status === "suspended") {
    return c.json({ error: "Store Suspended: Store access has been suspended" }, 403);
  }

  c.set("tenantId", tenant.tenantId);
  c.set("tenant", tenant);
  await next();
});

// 1. Store Info
app.get("/store/info", async (c) => {
  const tenantId = c.get("tenantId");
  const db = getControlDb(c.env);
  const tenant = await db.prepare("SELECT tenantId, storeName, subdomain, plan, customDomain FROM tenants WHERE tenantId = ? OR subdomain = ?").bind(tenantId, tenantId).first<any>();

  if (!tenant) {
    return c.json({ error: "Store not found" }, 404);
  }

  return c.json({
    id: tenant.tenantId,
    name: tenant.storeName,
    domain: tenant.customDomain || `${tenant.subdomain}.basecart.app`,
    currency: "INR",
    description: "Welcome to our store powered by Basecart Theme SDK.",
  });
});

// 2. Theme Settings
app.get("/theme/settings", async (c) => {
  const tenantId = c.get("tenantId");
  const db = getControlDb(c.env);

  const activeInstallation = await db
    .prepare("SELECT * FROM merchant_theme_installations WHERE tenantId = ? AND active = 1")
    .bind(tenantId)
    .first<any>();

  let settings = {
    colorPrimary: "#010101",
    colorSecondary: "#F2F0EA",
    colorAccent: "#EDCF5D",
    colorBg: "#FFFFFF",
    colorText: "#010101",
    fontHeading: "sans",
    fontBody: "sans",
    buttonRadius: "9999px",
    containerWidth: "max-w-7xl",
    enableAnnouncement: true,
    announcementText: "Free shipping on orders over ₹999!",
    stickyHeader: true,
    enableSearch: true,
    enableWishlist: true,
    enableQuickView: true,
  };

  if (activeInstallation && activeInstallation.customSettingsJson) {
    try {
      const custom = JSON.parse(activeInstallation.customSettingsJson);
      settings = { ...settings, ...custom };
    } catch {}
  }

  return c.json(settings);
});

// 3. Products
app.get("/products", async (c) => {
  const tenantId = c.get("tenantId");
  const tenantDo = getTenantDoStub(c.env, tenantId);

  const category = c.req.query("category");
  const q = c.req.query("q");
  const limit = parseInt(c.req.query("limit") || "20");

  let rows: any[] = [];
  if (tenantDo && typeof tenantDo.exec === "function") {
    let sql = "SELECT * FROM products WHERE status = 'active'";
    const params: any[] = [];

    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }

    if (q) {
      sql += " AND (name LIKE ? OR description LIKE ?)";
      params.push(`%${q}%`, `%${q}%`);
    }

    sql += " ORDER BY id DESC LIMIT ?";
    params.push(limit);

    rows = await tenantDo.exec(sql, params);
  }

  const products = rows.map((p: any) => ({
    id: p.id,
    name: p.name,
    handle: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: p.description || "",
    price: p.price,
    compareAtPrice: p.compareAtPrice || null,
    stockQuantity: p.stockQuantity,
    status: p.status,
    images: p.images ? JSON.parse(p.images) : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"],
    category: p.category || "Clothing",
    rating: 4.8,
    reviewCount: 24,
  }));

  return c.json({ products, total: products.length });
});

app.get("/products/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const id = c.req.param("id");
  const tenantDo = getTenantDoStub(c.env, tenantId);

  let row: any = null;
  if (tenantDo && typeof tenantDo.first === "function") {
    row = await tenantDo.first("SELECT * FROM products WHERE id = ? OR name LIKE ?", [id, `%${id}%`]);
  }
  if (!row) {
    return c.json({ error: "Product not found" }, 404);
  }

  return c.json({
    id: row.id,
    name: row.name,
    handle: row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: row.description || "",
    price: row.price,
    compareAtPrice: row.compareAtPrice || null,
    stockQuantity: row.stockQuantity,
    status: row.status,
    images: row.images ? JSON.parse(row.images) : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"],
    category: row.category || "Clothing",
    rating: 4.8,
    reviewCount: 24,
  });
});

// 4. Collections
app.get("/collections", async (c) => {
  return c.json([
    { id: "col-1", title: "Footwear & Sneakers", handle: "footwear", description: "High-performance energy return shoes.", productsCount: 12 },
    { id: "col-2", title: "Apparel & Activewear", handle: "apparel", description: "Premium training gear.", productsCount: 24 },
    { id: "col-3", title: "Accessories", handle: "accessories", description: "Bags, caps, and lifestyle gear.", productsCount: 8 },
  ]);
});

// 5. Cart Endpoints
app.get("/cart", async (c) => {
  return c.json({
    id: "cart_session_1",
    items: [],
    itemCount: 0,
    subtotal: 0,
    discountTotal: 0,
    total: 0,
  });
});

app.post("/cart/add", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json({
    id: "cart_session_1",
    items: [
      {
        id: "line_1",
        productId: body.productId || "prod-1",
        quantity: body.quantity || 1,
        lineTotal: 199,
        product: {
          id: body.productId || "prod-1",
          name: "Shoes Reebok Zig Kinetica 3",
          price: 199,
          images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"],
        },
      },
    ],
    itemCount: body.quantity || 1,
    subtotal: 199,
    discountTotal: 0,
    total: 199,
  });
});

// 6. Checkout Initiate
app.post("/checkout/initiate", async (c) => {
  const tenantId = c.get("tenantId");
  return c.json({
    checkoutUrl: `https://${tenantId}.basecart.app/checkout`,
    orderId: `ord_${Date.now()}`,
  });
});

// 7. Navigation Menus
app.get("/menus/:handle", async (c) => {
  const handle = c.req.param("handle");
  return c.json({
    id: `menu_${handle}`,
    handle,
    title: handle === "main" ? "Main Navigation" : "Footer Menu",
    items: [
      { id: "m1", title: "Women", url: "/collections/women", type: "collection" },
      { id: "m2", title: "Men", url: "/collections/men", type: "collection" },
      { id: "m3", title: "Kids", url: "/collections/kids", type: "collection" },
      { id: "m4", title: "Sale", url: "/collections/sale", type: "collection" },
    ],
  });
});

export default app;
