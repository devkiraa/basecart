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

describe("Part 3: Multi-Tenant Data Isolation Verification", () => {
  const app = buildApp();
  const controlDb = getControlDb(env);

  let tokenA = "";
  let tenantIdA = "";
  let subdomainA = "";

  let tokenB = "";
  let tenantIdB = "";
  let subdomainB = "";

  beforeAll(async () => {
    await migrateDatabase(controlDb, controlSchema);

    // 1. Sign up Tenant A
    const randA = Math.floor(Math.random() * 1000000);
    subdomainA = `store-a-${randA}`;
    const signupResA = await app.request(
      "/auth/merchant/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `owner-${randA}@tenant-a.com`,
          password: "securepassword123",
          storeName: "Tenant A Store",
          subdomain: subdomainA,
        }),
      },
      env
    );
    const bodyA = (await signupResA.json()) as any;
    tokenA = bodyA.accessToken;
    tenantIdA = bodyA.tenantId;

    // 2. Sign up Tenant B
    const randB = Math.floor(Math.random() * 1000000);
    subdomainB = `store-b-${randB}`;
    const signupResB = await app.request(
      "/auth/merchant/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `owner-${randB}@tenant-b.com`,
          password: "securepassword123",
          storeName: "Tenant B Store",
          subdomain: subdomainB,
        }),
      },
      env
    );
    const bodyB = (await signupResB.json()) as any;
    tokenB = bodyB.accessToken;
    tenantIdB = bodyB.tenantId;

    // Upgrade Tenant A to growth and configure Razorpay for checkouts
    await controlDb.prepare("UPDATE tenants SET plan = 'growth' WHERE tenantId = ?").bind(tenantIdA).run();
    const encKey = await encrypt("mock-key-id", env.ENCRYPTION_SECRET);
    const encSecret = await encrypt("mock-secret-val", env.ENCRYPTION_SECRET);
    await controlDb
      .prepare("UPDATE tenants SET razorpayKeyId = ?, razorpaySecret = ? WHERE tenantId = ?")
      .bind(encKey, encSecret, tenantIdA)
      .run();

    // 3. Seed Tenant A database with a product, customer, and order
    const dbA = await getTenantDb(tenantIdA, env);
    
    // Add product to Tenant A
    await dbA
      .prepare(
        "INSERT INTO products (productId, name, price, stockQuantity, status, images, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind("prod-a", "Tenant A Product", 100.0, 5, "active", "[]", new Date().toISOString(), new Date().toISOString())
      .run();

    // Add order/customer to Tenant A
    await dbA
      .prepare(
        "INSERT INTO orders (orderId, orderNumber, customerId, customerName, customerEmail, shippingAddress, status, subtotal, taxAmount, total, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(
        "order-a",
        1001,
        "GUEST",
        "Alice Tenant A",
        "alice@tenant-a.com",
        "123 Street, Bangalore",
        "paid",
        100.0,
        0,
        100.0,
        new Date().toISOString(),
        new Date().toISOString()
      )
      .run();
  });

  it("should prevent Tenant B from reading or leaking Tenant A's products", async () => {
    // Tenant B queries products: should not see prod-a
    const getRes = await app.request(
      "/products",
      {
        method: "GET",
        headers: { "Authorization": `Bearer ${tokenB}` },
      },
      env
    );

    expect(getRes.status).toBe(200);
    const products = (await getRes.json()) as any[];
    expect(products.some(p => p.productId === "prod-a")).toBe(false);
  });

  it("should prevent Tenant B from reading or leaking Tenant A's orders & customers", async () => {
    // Tenant B queries customers list: should be empty (should not see alice@tenant-a.com)
    const custRes = await app.request(
      "/customers",
      {
        method: "GET",
        headers: { "Authorization": `Bearer ${tokenB}` },
      },
      env
    );

    expect(custRes.status).toBe(200);
    const customers = (await custRes.json()) as any[];
    expect(customers.some(c => c.email === "alice@tenant-a.com")).toBe(false);

    // Tenant B queries customer orders: should be empty
    const orderRes = await app.request(
      "/customers/alice@tenant-a.com/orders",
      {
        method: "GET",
        headers: { "Authorization": `Bearer ${tokenB}` },
      },
      env
    );

    expect(orderRes.status).toBe(200);
    const orders = (await orderRes.json()) as any[];
    expect(orders.length).toBe(0);
  });

  it("should isolate merchant dashboard summaries between tenants", async () => {
    // Tenant B queries dashboard summary: revenue and order count must be 0
    const dashRes = await app.request(
      "/dashboard/summary",
      {
        method: "GET",
        headers: { "Authorization": `Bearer ${tokenB}` },
      },
      env
    );

    expect(dashRes.status).toBe(200);
    const summary = (await dashRes.json()) as any;
    expect(summary.totalRevenue).toBe(0);
    expect(summary.totalOrders).toBe(0);
    expect(summary.paidOrders).toBe(0);
  });
});
