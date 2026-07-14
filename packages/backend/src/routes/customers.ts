import { Hono } from "hono";
import { getTenantDb } from "../lib/db";
import { authenticateMerchant } from "../middleware/auth";

const app = new Hono<{ Bindings: any; Variables: any }>();

/**
 * GET /customers
 * Retrieve all unique customers (registered and guest checkouts) with aggregated metrics
 */
app.get("/customers", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const tenantDb = await getTenantDb(tenantId, c.env);

  // 1. Fetch all customer accounts from isolated D1 DB
  const customersResult = await tenantDb.prepare("SELECT * FROM customers").all();
  const registeredCustomers = customersResult.results || [];

  // 2. Fetch all orders to compute transaction totals from isolated D1 DB
  const ordersResult = await tenantDb.prepare("SELECT * FROM orders").all();
  const orders = ordersResult.results || [];

  // Map to track unique customers by email
  const customerMap = new Map<string, any>();

  // Initialize with registered customers
  for (const rc of registeredCustomers) {
    customerMap.set(rc.email.toLowerCase(), {
      customerId: rc.customerId,
      name: rc.name,
      email: rc.email.toLowerCase(),
      registered: true,
      totalOrders: 0,
      totalSpend: 0,
      lastOrderDate: null as string | null,
    });
  }

  // Aggregate orders
  for (const order of orders) {
    const email = order.customerEmail?.toLowerCase();
    if (!email) continue;

    let entry = customerMap.get(email);
    if (!entry) {
      entry = {
        customerId: order.customerId || "GUEST",
        name: order.customerName || "Guest Customer",
        email,
        registered: false,
        totalOrders: 0,
        totalSpend: 0,
        lastOrderDate: null,
      };
      customerMap.set(email, entry);
    }

    entry.totalOrders++;

    // Include in spend if order is paid, shipped, or delivered
    const isPaid = ["paid", "shipped", "delivered"].includes(order.status);
    if (isPaid) {
      entry.totalSpend += order.total || 0;
    }

    // Keep track of the latest order date
    if (!entry.lastOrderDate || new Date(order.createdAt) > new Date(entry.lastOrderDate)) {
      entry.lastOrderDate = order.createdAt;
    }
  }

  return c.json(Array.from(customerMap.values()));
});

/**
 * GET /customers/:email/orders
 * Retrieve all orders placed by a specific email address
 */
app.get("/customers/:email/orders", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const email = c.req.param("email");

  if (!email) {
    return c.json({ error: "Customer email is required" }, 400);
  }

  const lowerEmail = email.toLowerCase();
  const tenantDb = await getTenantDb(tenantId, c.env);

  // Fetch all orders matching customer email
  const result = await tenantDb
    .prepare("SELECT * FROM orders WHERE customerEmail = ? ORDER BY createdAt DESC")
    .bind(lowerEmail)
    .all();

  const rows = result.results || [];
  const customerOrders = [];

  for (const row of rows) {
    const items = await tenantDb.prepare("SELECT * FROM order_items WHERE orderId = ?").bind(row.orderId).all();
    customerOrders.push({
      ...row,
      lineItems: items.results || [],
    });
  }

  return c.json(customerOrders);
});

export default app;
