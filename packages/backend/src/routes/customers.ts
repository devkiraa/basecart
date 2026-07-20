import { Hono } from "hono";
import { getTenantDb } from "../lib/db";
import { authenticateMerchant } from "../middleware/auth";
import { sendEmail } from "../services/email";

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

/**
 * POST /customers/broadcast
 * Send a custom marketing email to all customers in the tenant database
 */
app.post("/customers/broadcast", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const body = await c.req.json().catch(() => ({}));
  const { subject, headline, bodyText, ctaText, ctaUrl } = body;

  if (!subject || !bodyText) {
    return c.json({ error: "Subject and body text are required" }, 400);
  }

  const targetAudience = body.targetAudience || "all"; // "all" | "registered" | "guest"
  const spendRange = body.spendRange || "all"; // "all" | "purchased" | "high_1000" | "high_5000"

  const tenantDb = await getTenantDb(tenantId, c.env);

  // 1. Fetch all customer accounts from isolated D1 DB
  const customersResult = await tenantDb.prepare("SELECT * FROM customers").all();
  const registeredCustomers = customersResult.results || [];

  // 2. Fetch all orders to compute transaction metrics from isolated D1 DB
  const ordersResult = await tenantDb.prepare("SELECT * FROM orders").all();
  const orders = ordersResult.results || [];

  // Map to track unique customers by email
  const customerMap = new Map<string, any>();

  // Initialize with registered customers
  for (const rc of registeredCustomers) {
    if (rc.email) {
      customerMap.set(rc.email.toLowerCase().trim(), {
        name: rc.name,
        email: rc.email.toLowerCase().trim(),
        registered: true,
        totalOrders: 0,
        totalSpend: 0,
      });
    }
  }

  // Aggregate orders for registered and guest checkout emails
  for (const order of orders) {
    const email = order.customerEmail?.toLowerCase()?.trim();
    if (!email) continue;

    let entry = customerMap.get(email);
    if (!entry) {
      entry = {
        name: order.customerName || "Guest Customer",
        email,
        registered: false,
        totalOrders: 0,
        totalSpend: 0,
      };
      customerMap.set(email, entry);
    }

    entry.totalOrders++;
    const isPaid = ["paid", "shipped", "delivered"].includes(order.status);
    if (isPaid) {
      entry.totalSpend += order.total || 0;
    }
  }

  // 3. Filter list of emails based on parameters
  const filteredEmails: string[] = [];
  for (const [email, stats] of customerMap.entries()) {
    // A. Target Audience Filter
    if (targetAudience === "registered" && !stats.registered) continue;
    if (targetAudience === "guest" && stats.registered) continue;

    // B. Spend Range Filter
    if (spendRange === "purchased" && stats.totalOrders === 0) continue;
    if (spendRange === "high_1000" && stats.totalSpend < 1000) continue;
    if (spendRange === "high_5000" && stats.totalSpend < 5000) continue;

    filteredEmails.push(email);
  }

  if (filteredEmails.length === 0) {
    return c.json({ message: "No customers match the selected filters", sentCount: 0 });
  }

  // 3. Get tenant plan and enforce marketing email quotas
  const controlDb = (c.env as any).CONTROL_DB;
  let storeName = "Basecart Store";
  let tenantPlan = "trial";

  if (controlDb) {
    try {
      const store = (await controlDb
        .prepare("SELECT storeName, plan FROM tenants WHERE tenantId = ?")
        .bind(tenantId)
        .first()) as any;
      if (store) {
        if (store.storeName) storeName = store.storeName;
        if (store.plan) tenantPlan = store.plan;
      }
    } catch (e) {}
  }

  // Fetch current sent counter from store_settings
  let currentSentCount = 0;
  try {
    const logRow = (await tenantDb
      .prepare("SELECT value FROM store_settings WHERE key = 'marketing_emails_sent'")
      .first()) as any;
    if (logRow?.value) {
      currentSentCount = parseInt(logRow.value, 10) || 0;
    }
  } catch (e) {}

  let maxLimit = 10; // Free trial cap
  if (tenantPlan === "starter") maxLimit = 100;
  else if (tenantPlan === "growth" || tenantPlan === "growth_paid") maxLimit = 5000;
  else if (tenantPlan === "business" || tenantPlan === "enterprise") maxLimit = 999999;

  if (currentSentCount >= maxLimit) {
    return c.json({
      error: `Marketing email quota reached (${currentSentCount}/${maxLimit}). Your plan (${tenantPlan}) allows up to ${maxLimit} promotional emails. Upgrade your subscription to send more.`,
      currentSent: currentSentCount,
      limit: maxLimit,
    }, 403);
  }

  // 4. Send emails asynchronously to each customer (up to remaining quota)
  let sentCount = 0;
  const remainingQuota = maxLimit - currentSentCount;
  const recipientsToSend = filteredEmails.slice(0, remainingQuota);

  for (const recipient of recipientsToSend) {
    try {
      await sendEmail(
        {
          type: "newsletter" as any,
          to: recipient,
          data: {
            subject,
            headline,
            bodyText,
            ctaText,
            ctaUrl,
            storeName,
          },
        },
        c.env
      );
      sentCount++;
    } catch (err) {
      console.error(`Failed to send broadcast email to ${recipient}:`, err);
    }
  }

  // 5. Update sent counter in store_settings
  if (sentCount > 0) {
    await tenantDb
      .prepare("INSERT OR REPLACE INTO store_settings (key, value) VALUES ('marketing_emails_sent', ?)")
      .bind(String(currentSentCount + sentCount))
      .run()
      .catch(() => {});
  }

  return c.json({
    message: `Newsletter broadcast triggered successfully to ${sentCount} recipients.`,
    sentCount,
    totalSent: currentSentCount + sentCount,
    limit: maxLimit,
  });
});

export default app;
