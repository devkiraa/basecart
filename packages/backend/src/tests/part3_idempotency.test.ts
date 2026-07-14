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

describe("Part 3: Checkout Idempotency Concurrency Verification", () => {
  const app = buildApp();
  const controlDb = getControlDb(env);

  let tenantId = "";
  let subdomain = "";

  beforeAll(async () => {
    await migrateDatabase(controlDb, controlSchema);

    const rand = Math.floor(Math.random() * 1000000);
    subdomain = `mystore-idemp-${rand}`;

    const signupRes = await app.request(
      "/auth/merchant/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `owner-${rand}@idemp.com`,
          password: "securepassword123",
          storeName: "Idempotency Store",
          subdomain,
        }),
      },
      env
    );

    const body = (await signupRes.json()) as any;
    tenantId = body.tenantId;

    await controlDb
      .prepare("UPDATE tenants SET plan = 'growth' WHERE tenantId = ?")
      .bind(tenantId)
      .run();

    // Encrypt and seed Razorpay credentials
    const encKey = await encrypt("mock-key-id", env.ENCRYPTION_SECRET);
    const encSecret = await encrypt("mock-secret-val", env.ENCRYPTION_SECRET);

    await controlDb
      .prepare("UPDATE tenants SET razorpayKeyId = ?, razorpaySecret = ? WHERE tenantId = ?")
      .bind(encKey, encSecret, tenantId)
      .run();

    const tenantDb = await getTenantDb(tenantId, env);

    await tenantDb
      .prepare(
        "INSERT INTO products (productId, name, price, stockQuantity, status, images, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind("prod-idemp-1", "Premium Watch", 200.0, 10, "active", "[]", new Date().toISOString(), new Date().toISOString())
      .run();
  });

  it("should block concurrent duplicate checkouts and return 409 conflict, and return original response on serial retry", async () => {
    const checkoutPayload = {
      customerName: "Bob Idempotent",
      customerEmail: "bob@idemp.com",
      shippingAddress: {
        addressLine1: "Idempotency Lane",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "India",
      },
      lineItems: [{ productId: "prod-idemp-1", quantity: 2 }],
      idempotencyKey: "key-concurrent-lock-check",
    };

    // Fire two requests concurrently
    const [res1, res2] = await Promise.all([
      app.request(
        `/store/${subdomain}/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(checkoutPayload),
        },
        env
      ),
      app.request(
        `/store/${subdomain}/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(checkoutPayload),
        },
        env
      ),
    ]);

    const statuses = [res1.status, res2.status];
    expect(statuses).toContain(200);
    expect(statuses).toContain(409);

    const conflictRes = res1.status === 409 ? res1 : res2;
    const conflictBody = (await conflictRes.json()) as any;
    expect(conflictBody.error).toBe("Checkout request is currently being processed");

    const successRes = res1.status === 200 ? res1 : res2;
    const successBody = (await successRes.json()) as any;
    expect(successBody.orderId).toBeDefined();
    const orderId = successBody.orderId;

    // A serial duplicate call afterwards must return the cached response (200)
    const serialRes = await app.request(
      `/store/${subdomain}/checkout`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutPayload),
      },
      env
    );

    expect(serialRes.status).toBe(200);
    const serialBody = (await serialRes.json()) as any;
    expect(serialBody.orderId).toBe(orderId);
  });
});
