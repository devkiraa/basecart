declare module "*.sql?raw" {
  const content: string;
  export default content;
}

import { beforeAll, describe, expect, it } from "vitest";
import { env } from "cloudflare:test";
import { buildApp } from "../app";
import { getControlDb, getTenantDb, migrateDatabase } from "../lib/db";
import { encrypt } from "../lib/crypto";

import controlSchema from "../lib/control_schema.sql?raw";

describe("Part 3: Orders & Discounts Routes", () => {
  const app = buildApp();
  const controlDb = getControlDb(env);

  let merchantToken = "";
  let tenantId = "";
  let razorpayOrderId = "";
  let orderId = "";
  let subdomain = "";

  beforeAll(async () => {
    // Run migrations on control registry
    await migrateDatabase(controlDb, controlSchema);

    // Randomize subdomain to prevent test environment pollution
    const rand = Math.floor(Math.random() * 1000000);
    subdomain = `mystore-ord-${rand}`;

    const signupPayload = {
      email: `owner-${rand}@orderstore.com`,
      password: "securepassword123",
      storeName: "Order Test Store",
      subdomain,
    };

    const signupRes = await app.request(
      "/auth/merchant/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupPayload),
      },
      env
    );

    const body = (await signupRes.json()) as any;
    merchantToken = body.accessToken;
    tenantId = body.tenantId;

    // 1. Upgrade store to growth plan so discounts and orders are enabled
    await controlDb
      .prepare("UPDATE tenants SET plan = 'growth' WHERE tenantId = ?")
      .bind(tenantId)
      .run();

    // 2. Encrypt Razorpay credentials and update control store row
    const encKey = await encrypt("mock-key-id", env.ENCRYPTION_SECRET);
    const encSecret = await encrypt("mock-secret-val", env.ENCRYPTION_SECRET);

    await controlDb
      .prepare("UPDATE tenants SET razorpayKeyId = ?, razorpaySecret = ? WHERE tenantId = ?")
      .bind(encKey, encSecret, tenantId)
      .run();

    const tenantDb = await getTenantDb(tenantId, env);

    // 3. Create a test product inside isolated database
    await tenantDb
      .prepare(
        "INSERT INTO products (productId, name, price, stockQuantity, status, images, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind("prod-1", "Premium Watch", 200.0, 10, "active", "[]", new Date().toISOString(), new Date().toISOString())
      .run();

    // 4. Create a test discount code inside isolated database
    await tenantDb
      .prepare(
        "INSERT INTO discount_codes (code, type, value, minOrderAmount, usageLimit, expiry, active, usageCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind("SAVE20", "percentage", 20.0, 100.0, 5, null, 1, 0)
      .run();
  });

  it("should validate the cart totals storefront-side", async () => {
    const validateRes = await app.request(
      `/store/${subdomain}/cart/validate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineItems: [{ productId: "prod-1", quantity: 2 }],
          discountCode: "SAVE20",
        }),
      },
      env
    );

    expect(validateRes.status).toBe(200);
    const result = (await validateRes.json()) as any;
    expect(result.subtotal).toBe(400); // 200 * 2
    expect(result.discountApplied).toBe(80); // 20% of 400
    expect(result.total).toBe(320); // 400 - 80
  });

  it("should process checkout and enforce idempotency key locking", async () => {
    const checkoutPayload = {
      customerName: "Alice Customer",
      customerEmail: "alice@gmail.com",
      shippingAddress: {
        addressLine1: "123 Street Road",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "India",
      },
      lineItems: [{ productId: "prod-1", quantity: 2 }],
      discountCode: "SAVE20",
      idempotencyKey: "key-unique-checkout-id-123",
    };

    // First checkout call
    const checkoutRes = await app.request(
      `/store/${subdomain}/checkout`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutPayload),
      },
      env
    );

    if (checkoutRes.status !== 200) {
      console.log("Checkout Failed Body:", await checkoutRes.text());
    }

    expect(checkoutRes.status).toBe(200);
    const body = (await checkoutRes.json()) as any;
    expect(body.orderId).toBeDefined();
    expect(body.razorpayOrderId).toBeDefined();
    expect(body.amount).toBe(320);

    orderId = body.orderId;
    razorpayOrderId = body.razorpayOrderId;

    // Secondary duplicate call (enforce idempotency return)
    const duplicateRes = await app.request(
      `/store/${subdomain}/checkout`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutPayload),
      },
      env
    );

    if (duplicateRes.status !== 200) {
      console.log("Duplicate Checkout Failed Body:", await duplicateRes.text());
    }

    expect(duplicateRes.status).toBe(200);
    const dupBody = (await duplicateRes.json()) as any;
    expect(dupBody.orderId).toBe(orderId);
    expect(dupBody.amount).toBe(320);
  });

  it("should process Razorpay webhook, decrement stock, and increment usage counts", async () => {
    const webhookPayload = {
      event: "order.paid",
      payload: {
        payment: {
          entity: {
            id: "pay_captured_123",
            order_id: razorpayOrderId,
          },
        },
      },
    };

    const webhookRes = await app.request(
      `/store/${subdomain}/webhooks/razorpay`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": "mock-signature-bypass",
        },
        body: JSON.stringify(webhookPayload),
      },
      { ...env, NODE_ENV: "test" }
    );

    if (webhookRes.status !== 200) {
      console.log("Webhook Failed Body:", await webhookRes.text());
    }

    expect(webhookRes.status).toBe(200);
    const body = (await webhookRes.json()) as any;
    expect(body.received).toBe(true);

    const tenantDb = await getTenantDb(tenantId, env);

    // Verify stock is decremented (10 -> 8)
    const product = await tenantDb
      .prepare("SELECT stockQuantity FROM products WHERE productId = 'prod-1'")
      .first<any>();
    expect(product.stockQuantity).toBe(8);

    // Verify discount code usage is incremented (0 -> 1)
    const discount = await tenantDb
      .prepare("SELECT usageCount FROM discount_codes WHERE code = 'SAVE20'")
      .first<any>();
    expect(discount.usageCount).toBe(1);

    // Verify order status is marked as paid
    const order = await tenantDb
      .prepare("SELECT status FROM orders WHERE orderId = ?")
      .bind(orderId)
      .first<any>();
    expect(order.status).toBe("paid");
  });
});
