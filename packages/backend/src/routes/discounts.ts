import { Hono } from "hono";
import { getControlDb, getTenantDb } from "../lib/db";
import { authenticateMerchant, resolveStorefrontTenant } from "../middleware/auth";
import { DiscountCodeSchema } from "@basecart/shared";

const app = new Hono<{ Bindings: any; Variables: any }>();

/**
 * Validates a discount code against current rules and computes the discount amount.
 */
export async function validateDiscountCode(
  tenantId: string,
  code: string,
  cartTotal: number,
  env: any
): Promise<{
  valid: boolean;
  reason?: string;
  discountAmount?: number;
  code?: string;
  type?: "percentage" | "flat";
  value?: number;
}> {
  const tenantDb = await getTenantDb(tenantId, env);
  const discount = await tenantDb
    .prepare("SELECT * FROM discount_codes WHERE code = ?")
    .bind(code.toUpperCase())
    .first<any>();

  if (!discount || !discount.active) {
    return { valid: false, reason: "Discount code is invalid or inactive" };
  }

  // Check expiration
  if (discount.expiry) {
    const expiryDate = new Date(discount.expiry);
    if (expiryDate.getTime() < Date.now()) {
      return { valid: false, reason: "Discount code has expired" };
    }
  }

  // Check minimum order amount
  if (discount.minOrderAmount && cartTotal < discount.minOrderAmount) {
    return {
      valid: false,
      reason: `Minimum order amount of ₹${discount.minOrderAmount} is required`,
    };
  }

  // Check usage limit
  if (discount.usageLimit !== undefined && discount.usageLimit !== null) {
    const usageCount = discount.usageCount || 0;
    if (usageCount >= discount.usageLimit) {
      return { valid: false, reason: "Discount code usage limit reached" };
    }
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (discount.type === "percentage") {
    discountAmount = Math.floor((cartTotal * discount.value) / 100);
  } else if (discount.type === "flat") {
    discountAmount = discount.value;
  }

  // Discount amount cannot exceed cart total
  discountAmount = Math.min(discountAmount, cartTotal);

  return {
    valid: true,
    discountAmount,
    code: discount.code,
    type: discount.type,
    value: discount.value,
  };
}

// -------------------------------------------------------------
// 1. Merchant Admin Endpoints (Writes go straight to DO)
// -------------------------------------------------------------

/**
 * Create Discount Code
 */
app.post("/discounts", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const controlDb = getControlDb(c.env);

  // 1. Enforce store plan tier details
  const store = await controlDb
    .prepare("SELECT plan FROM tenants WHERE tenantId = ?")
    .bind(tenantId)
    .first<{ plan: string }>();

  const plan = store?.plan || "starter";
  if (plan === "starter") {
    return c.json({
      error: "Feature locked: Discount codes require the Growth or Pro tier. Please upgrade.",
    }, 403);
  }

  const body = await c.req.json().catch(() => ({}));
  const parseResult = DiscountCodeSchema.safeParse(body);

  if (!parseResult.success) {
    return c.json({
      error: "Validation failed",
      issues: parseResult.error.format(),
    }, 400);
  }

  const discountData = parseResult.data;
  const codeUpper = discountData.code.toUpperCase();
  const tenantDb = await getTenantDb(tenantId, c.env);

  // 2. Check if code already exists
  const existing = await tenantDb
    .prepare("SELECT code FROM discount_codes WHERE code = ?")
    .bind(codeUpper)
    .first();

  if (existing) {
    return c.json({ error: "Discount code already exists for this store" }, 400);
  }

  const createdAt = new Date().toISOString();

  await tenantDb
    .prepare(
      "INSERT INTO discount_codes (code, type, value, minOrderAmount, usageLimit, expiry, active, usageCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      codeUpper,
      discountData.type,
      discountData.value,
      discountData.minOrderAmount || 0,
      discountData.usageLimit !== undefined ? discountData.usageLimit : null,
      discountData.expiry || null,
      discountData.active ? 1 : 0,
      0
    )
    .run();

  const saved = await tenantDb
    .prepare("SELECT * FROM discount_codes WHERE code = ?")
    .bind(codeUpper)
    .first();

  return c.json(saved, 201);
});

/**
 * List Discount Codes
 */
app.get("/discounts", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const tenantDb = await getTenantDb(tenantId, c.env);
  const result = await tenantDb.prepare("SELECT * FROM discount_codes").all();
  return c.json(result.results || []);
});

/**
 * Update Discount Code
 */
app.patch("/discounts/:code", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const code = c.req.param("code").toUpperCase();

  const body = await c.req.json().catch(() => ({}));
  const parseResult = DiscountCodeSchema.safeParse(body);

  if (!parseResult.success) {
    return c.json({
      error: "Validation failed",
      issues: parseResult.error.format(),
    }, 400);
  }

  const discountData = parseResult.data;
  const tenantDb = await getTenantDb(tenantId, c.env);

  // Verify it exists
  const existing = await tenantDb
    .prepare("SELECT code FROM discount_codes WHERE code = ?")
    .bind(code)
    .first();

  if (!existing) {
    return c.json({ error: "Discount code not found" }, 404);
  }

  await tenantDb
    .prepare(
      "UPDATE discount_codes SET type = ?, value = ?, minOrderAmount = ?, usageLimit = ?, expiry = ?, active = ? WHERE code = ?"
    )
    .bind(
      discountData.type,
      discountData.value,
      discountData.minOrderAmount || 0,
      discountData.usageLimit !== undefined ? discountData.usageLimit : null,
      discountData.expiry || null,
      discountData.active ? 1 : 0,
      code
    )
    .run();

  return c.json({ message: "Discount code updated successfully" });
});

/**
 * Delete Discount Code
 */
app.delete("/discounts/:code", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const code = c.req.param("code").toUpperCase();
  const tenantDb = await getTenantDb(tenantId, c.env);

  const existing = await tenantDb
    .prepare("SELECT code FROM discount_codes WHERE code = ?")
    .bind(code)
    .first();

  if (!existing) {
    return c.json({ error: "Discount code not found" }, 404);
  }

  await tenantDb
    .prepare("DELETE FROM discount_codes WHERE code = ?")
    .bind(code)
    .run();

  return c.json({ message: "Discount code deleted successfully" });
});

// -------------------------------------------------------------
// 2. Storefront Public Endpoints (Reads: Marked Future-Cacheable)
// -------------------------------------------------------------

/**
 * Validate Discount Code (Storefront public)
 * FUTURE-CACHEABLE: Read-only check, safe to cache by code/cartTotal key.
 */
app.post("/store/:subdomain/discounts/validate", resolveStorefrontTenant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const body = await c.req.json().catch(() => ({}));
  const { code, cartTotal } = body;

  if (!code || cartTotal === undefined) {
    return c.json({ error: "code and cartTotal are required" }, 400);
  }

  const validation = await validateDiscountCode(
    tenantId,
    code,
    Number(cartTotal),
    c.env
  );

  return c.json(validation);
});

export default app;
