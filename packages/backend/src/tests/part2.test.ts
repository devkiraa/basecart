declare module "*.sql?raw" {
  const content: string;
  export default content;
}

import { beforeAll, describe, expect, it } from "vitest";
import { env } from "cloudflare:test";
import { getControlDb, getTenantDb, migrateDatabase } from "../lib/db";
import { provisionTenantDatabase } from "../services/tenant";

import controlSchema from "../lib/control_schema.sql?raw";

describe("Part 2: D1 Per-Tenant Provisioning & Isolation", () => {
  const controlDb = getControlDb(env);

  beforeAll(async () => {
    // Run migrations on control registry database
    await migrateDatabase(controlDb, controlSchema);
  });

  it("should provision Tenant A and Tenant B database isolates independently", async () => {
    const tenantIdA = "tenant-a-id";
    const tenantIdB = "tenant-b-id";

    // 1. Register tenants inside the central control database
    await controlDb
      .prepare("INSERT OR REPLACE INTO tenants (tenantId, storeName, subdomain, plan, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(tenantIdA, "Store A", "store-a", "starter", "active", new Date().toISOString())
      .run();

    await controlDb
      .prepare("INSERT OR REPLACE INTO tenants (tenantId, storeName, subdomain, plan, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(tenantIdB, "Store B", "store-b", "starter", "active", new Date().toISOString())
      .run();

    // 2. Provision Tenant A D1 database
    await provisionTenantDatabase(tenantIdA, "Store A", env);

    // 3. Provision Tenant B D1 database
    await provisionTenantDatabase(tenantIdB, "Store B", env);

    // 4. Resolve isolated database clients
    const dbA = await getTenantDb(tenantIdA, env);
    const dbB = await getTenantDb(tenantIdB, env);

    // Verify independent store name settings exist in each D1 instance
    const settingA = await dbA
      .prepare("SELECT value FROM store_settings WHERE key = ?")
      .bind("storeName")
      .first<{ value: string }>();

    const settingB = await dbB
      .prepare("SELECT value FROM store_settings WHERE key = ?")
      .bind("storeName")
      .first<{ value: string }>();

    expect(settingA?.value).toBe("Store A");
    expect(settingB?.value).toBe("Store B");

    // 5. Test strict write/read data isolation
    const productId = "product-xyz-123";
    const now = new Date().toISOString();

    // Write a product into Tenant A's database
    await dbA
      .prepare(
        "INSERT INTO products (productId, name, price, stockQuantity, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(productId, "Product A Only", 499, 10, "active", now, now)
      .run();

    // Query Tenant B's database to verify Tenant A's product does not leak into it
    const productInB = await dbB
      .prepare("SELECT * FROM products WHERE productId = ?")
      .bind(productId)
      .first();

    // Query Tenant A's database to verify the product is correctly saved there
    const productInA = await dbA
      .prepare("SELECT * FROM products WHERE productId = ?")
      .bind(productId)
      .first<{ name: string }>();

    expect(productInB).toBeNull(); // Tenant B's database should have no knowledge of Product A
    expect(productInA?.name).toBe("Product A Only"); // Tenant A should have the product details
  });
});
