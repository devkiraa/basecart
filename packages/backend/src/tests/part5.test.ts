declare module "*.sql?raw" {
  const content: string;
  export default content;
}

import { beforeAll, describe, expect, it } from "vitest";
import { env } from "cloudflare:test";
import { buildApp } from "../app";
import { getControlDb, getTenantDb, migrateDatabase } from "../lib/db";
import { handleQueueBatch } from "../queue";

import controlSchema from "../lib/control_schema.sql?raw";

describe("Part 5: Worker-to-Worker Queue & Background Jobs", () => {
  const app = buildApp();
  const controlDb = getControlDb(env);

  let tenantId = "";
  let orderId = "order-queue-test-123";
  let subdomain = "";

  beforeAll(async () => {
    // Run migrations on control registry
    await migrateDatabase(controlDb, controlSchema);

    // Register a mock store
    const rand = Math.floor(Math.random() * 1000000);
    subdomain = `mystore-q-${rand}`;
    tenantId = `tenant-q-${rand}`;

    // Enable growth plan and gst_invoice add-on to test invoice PDF generation
    await controlDb
      .prepare(
        "INSERT INTO tenants (tenantId, storeName, subdomain, plan, status, createdAt, addOns, registeredBusinessName, gstin, registeredBusinessAddress, registeredState) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(
        tenantId,
        "Queue Test Store",
        subdomain,
        "growth",
        "active",
        new Date().toISOString(),
        JSON.stringify(["gst_invoice"]),
        "Queue Test Ltd",
        "29AAACB1234F1Z1",
        "100 Queue Tower",
        "Karnataka"
      )
      .run();

    const tenantDb = await getTenantDb(tenantId, env);

    // Setup tables in tenant database
    const tenantSchema = (await import("../lib/tenant_schema.sql?raw")).default;
    await migrateDatabase(tenantDb, tenantSchema);

    // Seed test product
    await tenantDb
      .prepare(
        "INSERT INTO products (productId, name, price, stockQuantity, status, images, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind("prod-q-1", "Queue Item", 100.0, 10, "active", "[]", new Date().toISOString(), new Date().toISOString())
      .run();

    // Create a pending order
    await tenantDb
      .prepare(
        "INSERT INTO orders (orderId, orderNumber, customerId, customerName, customerEmail, customerPhone, shippingAddress, status, subtotal, taxAmount, total, discountCode, discountAmount, paymentId, paymentStatus, idempotencyKey, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(
        orderId,
        1001,
        "GUEST",
        "John Queue",
        "john.queue@gmail.com",
        "9999999999",
        JSON.stringify({ addressLine1: "Queue St", city: "Bangalore", state: "Karnataka", postalCode: "560001" }),
        "paid",
        100.0,
        0,
        100.0,
        null,
        0,
        "pay_123",
        "paid",
        "idemp-123",
        new Date().toISOString(),
        new Date().toISOString()
      )
      .run();

    // Add order line item
    await tenantDb
      .prepare(
        "INSERT INTO order_items (itemId, orderId, productId, name, price, quantity) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .bind("item-q-1", orderId, "prod-q-1", "Queue Item", 100.0, 1)
      .run();
  });

  it("should process ORDER_CONFIRMATION background job, generate GST PDF, upload to R2, and update D1 status", async () => {
    // Construct a mock Cloudflare Queue message batch
    const batch = {
      messages: [
        {
          body: {
            type: "ORDER_CONFIRMATION",
            tenantId,
            orderId,
            email: "john.queue@gmail.com",
            total: 100.0,
          },
          ack: () => {
            (batch.messages[0] as any).acknowledged = true;
          },
          acknowledged: false,
        },
      ],
    };

    // Run the queue consumer
    await handleQueueBatch(batch, env, {});

    // Verify enqueued message was acknowledged
    expect((batch.messages[0] as any).acknowledged).toBe(true);

    const tenantDb = await getTenantDb(tenantId, env);

    // Verify order was updated with invoiceNumber and invoiceUrl in D1
    const order = await tenantDb
      .prepare("SELECT invoiceNumber, invoiceUrl FROM orders WHERE orderId = ?")
      .bind(orderId)
      .first<any>();

    expect(order.invoiceNumber).toBeDefined();
    expect(order.invoiceNumber).toContain("INV-2026-");
    expect(order.invoiceUrl).toBeDefined();

    // Verify PDF was written to the R2 bucket binding
    const r2Key = `tenants/${tenantId}/invoices/${orderId}-invoice.pdf`;
    const r2File = await env.MEDIA_BUCKET.get(r2Key);
    expect(r2File).not.toBeNull();
    expect(r2File.size).toBeGreaterThan(0);
  });
});
