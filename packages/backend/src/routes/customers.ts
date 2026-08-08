import { Hono } from "hono";
import { getTenantDb } from "../lib/db";
import { authenticateMerchant } from "../middleware/auth";
import { sendEmail } from "../services/email";
import { sanitizeLogPII } from "../lib/audit";

const app = new Hono<{ Bindings: any; Variables: any }>();

/**
 * GET /customers
 * Retrieve all unique customers from D1 database with aggregated transaction metrics
 */
app.get("/customers", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const tenantDb = await getTenantDb(tenantId, c.env);

  // Migration helper: Safely check existing columns before altering
  try {
    const tableInfo = await tenantDb.prepare("PRAGMA table_info(customers)").all();
    const existingCols = new Set((tableInfo.results || []).map((col: any) => col.name));
    if (!existingCols.has("firstName")) await tenantDb.prepare("ALTER TABLE customers ADD COLUMN firstName TEXT").run();
    if (!existingCols.has("lastName")) await tenantDb.prepare("ALTER TABLE customers ADD COLUMN lastName TEXT").run();
    if (!existingCols.has("acceptsEmailMarketing")) await tenantDb.prepare("ALTER TABLE customers ADD COLUMN acceptsEmailMarketing INTEGER DEFAULT 0").run();
    if (!existingCols.has("acceptsSmsMarketing")) await tenantDb.prepare("ALTER TABLE customers ADD COLUMN acceptsSmsMarketing INTEGER DEFAULT 0").run();
    if (!existingCols.has("acceptsWhatsAppMarketing")) await tenantDb.prepare("ALTER TABLE customers ADD COLUMN acceptsWhatsAppMarketing INTEGER DEFAULT 0").run();
    if (!existingCols.has("company")) await tenantDb.prepare("ALTER TABLE customers ADD COLUMN company TEXT").run();
    if (!existingCols.has("tags")) await tenantDb.prepare("ALTER TABLE customers ADD COLUMN tags TEXT").run();
    if (!existingCols.has("note")) await tenantDb.prepare("ALTER TABLE customers ADD COLUMN note TEXT").run();
    if (!existingCols.has("taxExempt")) await tenantDb.prepare("ALTER TABLE customers ADD COLUMN taxExempt INTEGER DEFAULT 0").run();
  } catch (e) {}

  const customersResult = await tenantDb.prepare("SELECT * FROM customers ORDER BY createdAt DESC").all();
  const registeredCustomers = customersResult.results || [];

  const ordersResult = await tenantDb.prepare("SELECT * FROM orders").all();
  const orders = ordersResult.results || [];

  const customerMap = new Map<string, any>();

  for (const rc of registeredCustomers) {
    const email = (rc.email || "").toLowerCase().trim();
    if (!email) continue;
    customerMap.set(email, {
      customerId: rc.customerId,
      name: rc.name || `${rc.firstName || ""} ${rc.lastName || ""}`.trim() || email,
      firstName: rc.firstName || "",
      lastName: rc.lastName || "",
      email,
      phone: rc.phone || "",
      acceptsEmailMarketing: rc.acceptsEmailMarketing === 1,
      acceptsSmsMarketing: rc.acceptsSmsMarketing === 1,
      acceptsWhatsAppMarketing: rc.acceptsWhatsAppMarketing === 1,
      company: rc.company || "",
      shippingAddress: rc.shippingAddress || "",
      tags: rc.tags || "",
      note: rc.note || "",
      taxExempt: rc.taxExempt === 1,
      location: rc.shippingAddress || "-",
      registered: true,
      ordersCount: 0,
      totalSpent: 0,
      lastOrderDate: null as string | null,
      createdAt: rc.createdAt || new Date().toISOString(),
    });
  }

  for (const order of orders) {
    const email = order.customerEmail?.toLowerCase()?.trim();
    if (!email) continue;

    let entry = customerMap.get(email);
    if (!entry) {
      entry = {
        customerId: order.customerId || `cust-${Date.now()}`,
        name: order.customerName || "Guest Customer",
        firstName: "",
        lastName: "",
        email,
        phone: order.customerPhone || "",
        acceptsEmailMarketing: false,
        acceptsSmsMarketing: false,
        acceptsWhatsAppMarketing: false,
        company: "",
        shippingAddress: "-",
        tags: "",
        note: "",
        taxExempt: false,
        location: "-",
        registered: false,
        ordersCount: 0,
        totalSpent: 0,
        lastOrderDate: null,
        createdAt: order.createdAt || new Date().toISOString(),
      };
      customerMap.set(email, entry);
    }

    entry.ordersCount++;
    const isPaid = ["paid", "shipped", "delivered"].includes(order.status);
    if (isPaid) {
      entry.totalSpent += order.total || 0;
    }

    if (!entry.lastOrderDate || new Date(order.createdAt) > new Date(entry.lastOrderDate)) {
      entry.lastOrderDate = order.createdAt;
    }
  }

  return c.json(Array.from(customerMap.values()));
});

/**
 * POST /customers
 * Create or update a customer record in isolated tenant database
 */
app.post("/customers", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const tenantDb = await getTenantDb(tenantId, c.env);
  const body = await c.req.json().catch(() => ({}));

  const {
    firstName, lastName, email, phone,
    acceptsEmailMarketing, acceptsSmsMarketing, acceptsWhatsAppMarketing,
    company, address1, address2, city, provinceCode, countryCode, zip,
    tags, note, taxExempt
  } = body;

  if (!email) {
    return c.json({ error: "Customer email is required" }, 400);
  }

  const customerId = body.customerId || `cust-${Date.now()}`;
  const name = `${firstName || ""} ${lastName || ""}`.trim() || email;
  const location = city ? `${city}, ${countryCode || "IN"}` : (address1 || "-");
  const createdAt = new Date().toISOString();

  await tenantDb
    .prepare(
      `INSERT INTO customers (
        customerId, name, email, phone, firstName, lastName,
        acceptsEmailMarketing, acceptsSmsMarketing, acceptsWhatsAppMarketing,
        company, shippingAddress, tags, note, taxExempt, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        name = excluded.name,
        phone = excluded.phone,
        firstName = excluded.firstName,
        lastName = excluded.lastName,
        acceptsEmailMarketing = excluded.acceptsEmailMarketing,
        acceptsSmsMarketing = excluded.acceptsSmsMarketing,
        acceptsWhatsAppMarketing = excluded.acceptsWhatsAppMarketing,
        company = excluded.company,
        shippingAddress = excluded.shippingAddress,
        tags = excluded.tags,
        note = excluded.note,
        taxExempt = excluded.taxExempt`
    )
    .bind(
      customerId, name, email.toLowerCase().trim(), phone || "", firstName || "", lastName || "",
      acceptsEmailMarketing ? 1 : 0, acceptsSmsMarketing ? 1 : 0, acceptsWhatsAppMarketing ? 1 : 0,
      company || "", location, tags || "", note || "", taxExempt ? 1 : 0, createdAt
    )
    .run();

  return c.json({ success: true, customerId });
});

/**
 * POST /customers/bulk
 * Bulk insert customer records from CSV import into tenant database
 */
app.post("/customers/bulk", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const tenantDb = await getTenantDb(tenantId, c.env);
  const body = await c.req.json().catch(() => ({}));
  const customersList = body.customers || [];

  if (!Array.isArray(customersList) || customersList.length === 0) {
    return c.json({ error: "No customer records provided" }, 400);
  }

  let importedCount = 0;
  for (const item of customersList) {
    const email = (item.email || "").toLowerCase().trim();
    if (!email) continue;
    const customerId = item.customerId || `cust-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const name = `${item.firstName || ""} ${item.lastName || ""}`.trim() || email;
    const location = item.city ? `${item.city}, ${item.countryCode || "IN"}` : (item.address1 || "-");
    const createdAt = item.createdAt || new Date().toISOString();

    try {
      await tenantDb
        .prepare(
          `INSERT INTO customers (
            customerId, name, email, phone, firstName, lastName,
            acceptsEmailMarketing, acceptsSmsMarketing, acceptsWhatsAppMarketing,
            company, shippingAddress, tags, note, taxExempt, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(email) DO UPDATE SET
            name = excluded.name,
            phone = excluded.phone,
            firstName = excluded.firstName,
            lastName = excluded.lastName,
            acceptsEmailMarketing = excluded.acceptsEmailMarketing,
            acceptsSmsMarketing = excluded.acceptsSmsMarketing,
            acceptsWhatsAppMarketing = excluded.acceptsWhatsAppMarketing,
            company = excluded.company,
            shippingAddress = excluded.shippingAddress,
            tags = excluded.tags,
            note = excluded.note,
            taxExempt = excluded.taxExempt`
        )
        .bind(
          customerId, name, email, item.phone || "", item.firstName || "", item.lastName || "",
          item.acceptsEmailMarketing ? 1 : 0, item.acceptsSmsMarketing ? 1 : 0, item.acceptsWhatsAppMarketing ? 1 : 0,
          item.company || "", location, item.tags || "", item.note || "", item.taxExempt ? 1 : 0, createdAt
        )
        .run();
      importedCount++;
    } catch (err) {
      console.error(`Failed inserting customer ${sanitizeLogPII(email)}:`, err);
    }
  }

  return c.json({ success: true, count: importedCount });
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
      console.error(`Failed to send broadcast email to ${sanitizeLogPII(recipient)}:`, err);
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
