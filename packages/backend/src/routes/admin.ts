import { Hono } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import { getControlDb, getTenantDb } from "../lib/db";
import { authService } from "../services/auth";
import { authenticateMerchant } from "../middleware/auth";
import { renderEmail, getEmailProvider, sendEmail, PLATFORM_EMAIL_ALIASES } from "@basecart/emails";
import { isReservedSubdomain } from "@basecart/shared";
import { provisionTenantDatabase } from "../services/tenant";
import { logReservedSubdomainAbuse } from "../lib/audit";
import {
  checkAccountLockout,
  recordFailedAttempt,
  recordSuccessfulLogin,
  logAuthEvent,
} from "../services/auth_lockout";
import { authRateLimiterMiddleware } from "../middleware/rate_limiter";

const app = new Hono<{ Bindings: any; Variables: any }>();

// Enforce strict rate limiting on admin authentication endpoints (G2, G3 requirements)
app.use("/admin/auth/*", authRateLimiterMiddleware);

function isLocalHostRequest(c: any): boolean {
  const host = c.req.header("host") || "";
  const origin = c.req.header("origin") || "";
  const referer = c.req.header("referer") || "";
  return (
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    origin.includes("localhost") ||
    origin.includes("127.0.0.1") ||
    referer.includes("localhost") ||
    referer.includes("127.0.0.1")
  );
}

function getAdminCookieOptions(c: any, maxAge: number) {
  const isLocal = isLocalHostRequest(c);
  const isHttps = c.req.header("x-forwarded-proto") === "https" || c.req.url.startsWith("https");
  const isProdOrStaging = !isLocal && ((c.env && (c.env.NODE_ENV === "production" || c.env.NODE_ENV === "staging")) || isHttps);
  const domain = isLocal ? undefined : ((c.env && c.env.COOKIE_DOMAIN_ADMIN) || undefined);
  return {
    path: "/",
    httpOnly: true,
    secure: isLocal ? false : isProdOrStaging,
    sameSite: isLocal ? ("Lax" as const) : isProdOrStaging ? ("None" as const) : ("Lax" as const),
    maxAge,
    domain,
  };
}

function getAdminDeleteOptions(c: any) {
  const isLocal = isLocalHostRequest(c);
  const isHttps = c.req.header("x-forwarded-proto") === "https" || c.req.url.startsWith("https");
  const isProdOrStaging = !isLocal && ((c.env && (c.env.NODE_ENV === "production" || c.env.NODE_ENV === "staging")) || isHttps);
  const domain = isLocal ? undefined : ((c.env && c.env.COOKIE_DOMAIN_ADMIN) || undefined);
  return {
    path: "/",
    domain,
    secure: isLocal ? false : isProdOrStaging,
    sameSite: isLocal ? ("Lax" as const) : isProdOrStaging ? ("None" as const) : ("Lax" as const),
  };
}

async function ensureAdminTables(db: any) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS marketplace_themes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    developer TEXT NOT NULL,
    status TEXT NOT NULL,
    rating REAL NOT NULL,
    downloads INTEGER NOT NULL,
    isFeatured INTEGER NOT NULL,
    version TEXT NOT NULL
  )`).run();

  // Clean up any legacy dummy themes and ensure Satoshi is the sole seeded theme
  await db.prepare("DELETE FROM marketplace_themes WHERE id != 'satoshi'").run();

  const themeCount = await db.prepare("SELECT COUNT(*) as total FROM marketplace_themes").first();
  if (!themeCount || themeCount.total === 0) {
    const seedThemes = [
      { id: "satoshi", name: "Satoshi", developer: "Basecart Team", status: "published", rating: 5.0, downloads: 2450, isFeatured: 1, version: "1.0.0" },
    ];
    for (const t of seedThemes) {
      await db.prepare("INSERT INTO marketplace_themes (id, name, developer, status, rating, downloads, isFeatured, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(t.id, t.name, t.developer, t.status, t.rating, t.downloads, t.isFeatured, t.version)
        .run();
    }
  }

  await db.prepare(`CREATE TABLE IF NOT EXISTS marketplace_apps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    developer TEXT NOT NULL,
    status TEXT NOT NULL,
    scopes TEXT NOT NULL,
    version TEXT NOT NULL
  )`).run();

  const appCount = await db.prepare("SELECT COUNT(*) as total FROM marketplace_apps").first();
  if (!appCount || appCount.total === 0) {
    const seedApps = [
      { id: "app_1", name: "Razorpay Pro Split", developer: "Fintech Kerala", status: "published", scopes: JSON.stringify(["read:billing", "write:payments"]), version: "2.0.1" },
      { id: "app_2", name: "WhatsApp Auto-Ping", developer: "ChatSolutions", status: "pending", scopes: JSON.stringify(["read:orders", "write:notifications"]), version: "1.0.0" },
      { id: "app_3", name: "DelivGo Courier Sync", developer: "Kerala Logistics", status: "published", scopes: JSON.stringify(["read:orders", "write:fulfillment"]), version: "1.4.0" },
      { id: "app_4", name: "Abandoned Cart Retainer", developer: "AI Conversions", status: "pending", scopes: JSON.stringify(["read:orders", "write:notifications", "read:customers"]), version: "1.0.2" },
    ];
    for (const a of seedApps) {
      await db.prepare("INSERT INTO marketplace_apps (id, name, developer, status, scopes, version) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(a.id, a.name, a.developer, a.status, a.scopes, a.version)
        .run();
    }
  }

  await db.prepare(`CREATE TABLE IF NOT EXISTS platform_alerts (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    subject TEXT NOT NULL,
    target TEXT NOT NULL,
    status TEXT NOT NULL
  )`).run();

  const alertCount = await db.prepare("SELECT COUNT(*) as total FROM platform_alerts").first();
  if (!alertCount || alertCount.total === 0) {
    const seedAlerts = [
      { id: "alt_1", date: "2026-07-17", type: "Banner", subject: "Scheduled database maintenance on Sunday 2AM IST", target: "Everyone", status: "active" },
      { id: "alt_2", date: "2026-07-15", type: "Announcement", subject: "Free training webinar: Scale your Instagram sales catalog", target: "Free Tier", status: "expired" },
      { id: "alt_3", date: "2026-07-12", type: "Alert", subject: "Razorpay payment processing delay warning", target: "Enterprise Pro", status: "expired" },
    ];
    for (const al of seedAlerts) {
      await db.prepare("INSERT INTO platform_alerts (id, date, type, subject, target, status) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(al.id, al.date, al.type, al.subject, al.target, al.status)
        .run();
    }
  }

  await db.prepare(`CREATE TABLE IF NOT EXISTS cms_faqs (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    q TEXT NOT NULL,
    status TEXT NOT NULL
  )`).run();

  const faqCount = await db.prepare("SELECT COUNT(*) as total FROM cms_faqs").first();
  if (!faqCount || faqCount.total === 0) {
    const seedFaqs = [
      { id: "faq_1", category: "General", q: "How do I connect my custom domain?", status: "published" },
      { id: "faq_2", category: "Billing", q: "Do you charge transaction fees?", status: "published" },
      { id: "faq_3", category: "Integrations", q: "Does Basecart sync with Razorpay?", status: "draft" },
    ];
    for (const f of seedFaqs) {
      await db.prepare("INSERT INTO cms_faqs (id, category, q, status) VALUES (?, ?, ?, ?)")
        .bind(f.id, f.category, f.q, f.status)
        .run();
    }
  }

  await db.prepare(`CREATE TABLE IF NOT EXISTS cms_blogs (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL
  )`).run();

  const blogCount = await db.prepare("SELECT COUNT(*) as total FROM cms_blogs").first();
  if (!blogCount || blogCount.total === 0) {
    const seedBlogs = [
      { id: "blg_1", date: "2026-07-16", title: "Automating Instagram Storefront Sales in Kerala", status: "published" },
      { id: "blg_2", date: "2026-07-10", title: "10 Home Bakers Growing with Social Commerce", status: "published" },
    ];
    for (const b of seedBlogs) {
      await db.prepare("INSERT INTO cms_blogs (id, date, title, status) VALUES (?, ?, ?, ?)")
        .bind(b.id, b.date, b.title, b.status)
        .run();
    }
  }

  await db.prepare(`CREATE TABLE IF NOT EXISTS cms_jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL
  )`).run();

  const jobCount = await db.prepare("SELECT COUNT(*) as total FROM cms_jobs").first();
  if (!jobCount || jobCount.total === 0) {
    const seedJobs = [
      { id: "job_1", title: "Senior Next.js Developer", location: "Remote (Kochi)", status: "open" },
      { id: "job_2", title: "Growth Marketing Specialist", location: "Kochi Hub", status: "closed" },
    ];
    for (const j of seedJobs) {
      await db.prepare("INSERT INTO cms_jobs (id, title, location, status) VALUES (?, ?, ?, ?)")
        .bind(j.id, j.title, j.location, j.status)
        .run();
    }
  }

  await db.prepare(`CREATE TABLE IF NOT EXISTS feature_flags (
    key TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    desc TEXT NOT NULL,
    active INTEGER NOT NULL,
    target TEXT NOT NULL
  )`).run();

  const flagCount = await db.prepare("SELECT COUNT(*) as total FROM feature_flags").first();
  if (!flagCount || flagCount.total === 0) {
    const seedFlags = [
      { key: "ai_product_description", name: "AI Product Description Builder", desc: "Allows merchants to generate detailed item lists using GPT descriptions automatically.", active: 1, target: "Pro & Enterprise" },
      { key: "new_checkout_flow", name: "Lightning Checkout (V3)", desc: "Enables optimized checkout layout panels for WhatsApp and Instagram redirect links.", active: 0, target: "Everyone" },
      { key: "analytics_v2", name: "Analytics Dashboard V2", desc: "Deeper chart analytics reports tracking regional shipping parameters.", active: 1, target: "Growth & Pro" },
      { key: "beta_theme_marketplace", name: "Experimental Custom Themes", desc: "Allows selected home businesses to edit CSS layouts natively.", active: 0, target: "Beta Program" },
      { key: "gst_invoicing_automation", name: "Automated GST Invoicing", desc: "Programmatically generate HSN codes and state tax configurations.", active: 1, target: "India Merchants" },
    ];
    for (const f of seedFlags) {
      await db.prepare("INSERT INTO feature_flags (key, name, desc, active, target) VALUES (?, ?, ?, ?, ?)")
        .bind(f.key, f.name, f.desc, f.active, f.target)
        .run();
    }
  }

  await db.prepare(`CREATE TABLE IF NOT EXISTS developer_api_keys (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    token TEXT NOT NULL,
    scopes TEXT NOT NULL,
    rateLimit TEXT NOT NULL,
    status TEXT NOT NULL
  )`).run();

  const devKeysCount = await db.prepare("SELECT COUNT(*) as total FROM developer_api_keys").first();
  if (!devKeysCount || devKeysCount.total === 0) {
    const seedKeys = [
      { id: "key_1", name: "Internal Admin Sync", token: "bc_live_77e8a9f0a8e9981a2b3c4d5e", scopes: JSON.stringify(["read:merchants", "write:billing"]), rateLimit: "1,000 req/min", status: "active" },
      { id: "key_2", name: "Razorpay Webhook Handler", token: "bc_live_99d10e11a22b33c44d55e66f", scopes: JSON.stringify(["write:payments"]), rateLimit: "500 req/min", status: "active" },
    ];
    for (const k of seedKeys) {
      await db.prepare("INSERT INTO developer_api_keys (id, name, token, scopes, rateLimit, status) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(k.id, k.name, k.token, k.scopes, k.rateLimit, k.status)
        .run();
    }
  }

  await db.prepare(`CREATE TABLE IF NOT EXISTS developer_webhooks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    event TEXT NOT NULL,
    status TEXT NOT NULL
  )`).run();

  const webhookCount = await db.prepare("SELECT COUNT(*) as total FROM developer_webhooks").first();
  if (!webhookCount || webhookCount.total === 0) {
    const seedWebhooks = [
      { id: "wh_1", name: "Order Placed Trigger", url: "https://api.merchant-partner.in/webhooks/order", event: "order.created", status: "active" },
      { id: "wh_2", name: "Inventory Alert Ping", url: "https://stockmanager.in/api/v1/update", event: "inventory.low", status: "inactive" },
    ];
    for (const w of seedWebhooks) {
      await db.prepare("INSERT INTO developer_webhooks (id, name, url, event, status) VALUES (?, ?, ?, ?, ?)")
        .bind(w.id, w.name, w.url, w.event, w.status)
        .run();
    }
  }

  await db.prepare(`CREATE TABLE IF NOT EXISTS queue_jobs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    merchant TEXT NOT NULL,
    type TEXT NOT NULL,
    retries INTEGER NOT NULL,
    status TEXT NOT NULL,
    time TEXT NOT NULL
  )`).run();

  const queueCount = await db.prepare("SELECT COUNT(*) as total FROM queue_jobs").first();
  if (!queueCount || queueCount.total === 0) {
    const seedJobs = [
      { id: "job_9981", name: "Sync Catalog to search index", merchant: "Acme Wear", type: "IndexUpdate", retries: 0, status: "running", time: "Just now" },
      { id: "job_9982", name: "Generate invoice PDF for order ord_101", merchant: "Bespoke Boutique", type: "BillingInvoice", retries: 1, status: "failed", time: "10 mins ago" },
      { id: "job_9983", name: "Email OTP verification blast", merchant: "Kochi Cake Studio", type: "EmailDispatch", retries: 0, status: "pending", time: "1 min ago" },
      { id: "job_9984", name: "R2 backup media compression task", merchant: "Urban Threads", type: "MediaCompression", retries: 3, status: "dead", time: "1 hour ago" },
      { id: "job_9985", name: "Calculate monthly GST ledger report", merchant: "Crafty Corner", type: "TaxCalculations", retries: 0, status: "completed", time: "2 hours ago" },
    ];
    for (const q of seedJobs) {
      await db.prepare("INSERT INTO queue_jobs (id, name, merchant, type, retries, status, time) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind(q.id, q.name, q.merchant, q.type, q.retries, q.status, q.time)
        .run();
    }
  }

  await db.prepare(`CREATE TABLE IF NOT EXISTS support_tickets (
    ticketId TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    storeName TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    priority TEXT NOT NULL DEFAULT 'medium',
    category TEXT DEFAULT 'general',
    response TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT
  )`).run();
}

// Pre-handler middleware to authenticate super admins in Hono
export async function authenticateAdmin(c: any, next: () => Promise<void>) {
  try {
    let token = getCookie(c, "basecart_admin_token");
    if (!token) {
      const authHeader = c.req.header("authorization") || c.req.header("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return c.json({ error: "Unauthorized: Missing token" }, 401);
    }

    const payload = await authService.verifyAccessToken(token, c.env);

    if (payload.role !== "admin") {
      return c.json({ error: "Forbidden: Admin access required" }, 403);
    }

    c.set("user", payload);
    await next();
  } catch (error: any) {
    return c.json({ error: error.message || "Unauthorized" }, 401);
  }
}

// -------------------------------------------------------------
// SaaS Platform Admin Endpoints
// -------------------------------------------------------------

/**
 * Admin Signup (Bootstrap helper)
 * Gated to run only when there are zero existing admin accounts.
 */
app.post("/admin/auth/signup", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  const controlDb = getControlDb(c.env);

  // Gating signup: Only permit signup if there are zero admin accounts
  const countRow = await controlDb
    .prepare("SELECT COUNT(*) as total FROM admins")
    .first<{ total: number }>();

  const adminExists = countRow?.total && countRow.total > 0;
  if (adminExists) {
    return c.json({
      error: "Admin signup is disabled because an admin account already exists.",
    }, 403);
  }

  const lowerEmail = email.toLowerCase();
  const existing = await controlDb
    .prepare("SELECT email FROM admins WHERE email = ?")
    .bind(lowerEmail)
    .first();

  if (existing) {
    return c.json({ error: "Admin email already registered" }, 400);
  }

  const userId = crypto.randomUUID();
  const hashedPassword = await authService.hashPassword(password);
  const createdAt = new Date().toISOString();

  await controlDb
    .prepare("INSERT INTO admins (email, userId, hashedPassword, role, createdAt) VALUES (?, ?, ?, ?, ?)")
    .bind(lowerEmail, userId, hashedPassword, "admin", createdAt)
    .run();

  const tokens = await authService.generateTokens(
    {
      userId,
      email: lowerEmail,
      role: "admin",
      tenantId: "PLATFORM",
      type: "admin" as any,
    },
    controlDb,
    c.env
  );

  setCookie(c, "basecart_admin_token", tokens.accessToken, getAdminCookieOptions(c, 15 * 60));
  setCookie(c, "basecart_admin_refresh_token", tokens.refreshToken, getAdminCookieOptions(c, 7 * 24 * 60 * 60));

  return c.json({
    message: "Admin account registered successfully",
    email: lowerEmail,
    role: "admin",
    ...tokens,
  }, 201);
});

/**
 * Admin Login
 */
app.post("/admin/auth/login", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  const lowerEmail = email.toLowerCase().trim();
  const controlDb = getControlDb(c.env);

  // Check Account Lockout (5 failed attempts limit)
  const lockout = await checkAccountLockout(controlDb, `admin:${lowerEmail}`);
  if (lockout.locked) {
    return c.json({
      error: `Account is locked due to 5 failed login attempts. Please try again after ${lockout.remainingMinutes} minute(s).`,
      locked: true,
      remainingMinutes: lockout.remainingMinutes,
    }, 429);
  }

  const admin = await controlDb
    .prepare("SELECT * FROM admins WHERE email = ?")
    .bind(lowerEmail)
    .first<any>();

  if (!admin) {
    await recordFailedAttempt(controlDb, `admin:${lowerEmail}`, "admin", c);
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const match = await authService.comparePassword(password, admin.hashedPassword);
  if (!match) {
    const failedStatus = await recordFailedAttempt(controlDb, `admin:${lowerEmail}`, "admin", c);
    if (failedStatus.locked) {
      return c.json({
        error: "Account is locked due to 5 failed login attempts. Please try again after 15 minutes.",
        locked: true,
        remainingMinutes: 15,
      }, 429);
    }
    return c.json({ error: "Invalid email or password", attemptsLeft: failedStatus.attemptsLeft }, 401);
  }

  await recordSuccessfulLogin(controlDb, `admin:${lowerEmail}`, "admin", c);

  const tokens = await authService.generateTokens(
    {
      userId: admin.userId,
      email: lowerEmail,
      role: "admin",
      tenantId: "PLATFORM",
      type: "admin" as any,
    },
    controlDb,
    c.env
  );

  setCookie(c, "basecart_admin_token", tokens.accessToken, getAdminCookieOptions(c, 15 * 60));
  setCookie(c, "basecart_admin_refresh_token", tokens.refreshToken, getAdminCookieOptions(c, 7 * 24 * 60 * 60));

  return c.json({
    email: lowerEmail,
    role: "admin",
    ...tokens,
  });
});

/**
 * Admin Auth Me (Verification)
 */
app.get("/admin/auth/me", authenticateAdmin, async (c) => {
  const user = c.get("user");
  return c.json({
    userId: user.userId,
    email: user.email,
    role: user.role,
  });
});

/**
 * Admin Logout
 */
app.post("/admin/auth/logout", async (c) => {
  let refreshToken = getCookie(c, "basecart_admin_refresh_token");
  if (!refreshToken) {
    const authHeader = c.req.header("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      refreshToken = authHeader.split(" ")[1];
    }
  }
  if (!refreshToken) {
    refreshToken = c.req.header("x-refresh-token");
  }
  if (!refreshToken) {
    const body = await c.req.json().catch(() => ({}));
    if (body && body.refreshToken) refreshToken = body.refreshToken;
  }

  if (refreshToken) {
    try {
      const controlDb = getControlDb(c.env);
      await controlDb.prepare("DELETE FROM refresh_tokens WHERE token = ?").bind(refreshToken).run();
    } catch (e) {}
  }
  deleteCookie(c, "basecart_admin_token", getAdminDeleteOptions(c));
  deleteCookie(c, "basecart_admin_refresh_token", getAdminDeleteOptions(c));
  return c.json({ message: "Logged out successfully" });
});

/**
 * List all merchants
 */
app.get("/admin/merchants", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const result = await controlDb.prepare("SELECT * FROM tenants").all<any>();
  const merchants = (result.results || []).map((item) => ({
    tenantId: item.tenantId,
    storeName: item.storeName,
    subdomain: item.subdomain,
    plan: item.plan || "starter",
    status: item.status || "active",
    createdAt: item.createdAt,
  }));

  return c.json(merchants);
});

/**
 * Manually create a merchant (Admin-only)
 */
app.post("/admin/merchants", authenticateAdmin, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { email, password, storeName, subdomain, plan = "starter" } = body;

  if (!email || !password || !storeName || !subdomain) {
    return c.json({ error: "Email, password, storeName, and subdomain are required" }, 400);
  }

  const lowerEmail = email.toLowerCase();
  const lowerSubdomain = subdomain.trim().toLowerCase();

  // Validate reserved subdomain list
  if (isReservedSubdomain(lowerSubdomain)) {
    logReservedSubdomainAbuse(c, lowerSubdomain);
    return c.json({
      success: false,
      code: "RESERVED_SUBDOMAIN",
      message: "This store name is reserved."
    }, 409);
  }

  const controlDb = getControlDb(c.env);

  // 1. Check if subdomain already exists
  const existingSubdomain = await controlDb
    .prepare("SELECT tenantId FROM tenants WHERE subdomain = ?")
    .bind(lowerSubdomain)
    .first();

  if (existingSubdomain) {
    return c.json({ error: "Subdomain is already registered by another store" }, 400);
  }

  // 2. Check if email already exists globally
  const existingUser = await controlDb
    .prepare("SELECT email FROM merchant_users WHERE email = ?")
    .bind(lowerEmail)
    .first();

  if (existingUser) {
    return c.json({ error: "Email is already registered" }, 400);
  }

  // 3. Generate credentials and IDs
  const tenantId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const hashedPassword = await authService.hashPassword(password);
  const createdAt = new Date().toISOString();

  // 4. Save registry details in the control database
  const tStmt = controlDb
    .prepare(
      "INSERT INTO tenants (tenantId, storeName, subdomain, plan, status, createdAt, addOns, branding) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(tenantId, storeName, lowerSubdomain, plan, "active", createdAt, "[]", "{}");

  const uStmt = controlDb
    .prepare(
      "INSERT INTO merchant_users (email, tenantId, userId, hashedPassword, role, emailVerified, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(lowerEmail, tenantId, userId, hashedPassword, "owner", 1, createdAt);

  await controlDb.batch([tStmt, uStmt]);

  // 5. Run dynamic database provisioning (D1 migration + Seeding)
  await provisionTenantDatabase(tenantId, storeName, c.env);

  // Write Admin Audit Log
  const logId = crypto.randomUUID();
  await controlDb
    .prepare(
      "INSERT INTO admin_audit_logs (logId, adminEmail, action, targetTenantId, plan, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(logId, c.get("user").email || "admin", "create_store", tenantId, plan, "active", createdAt)
    .run();

  return c.json({
    message: "Merchant created successfully",
    tenantId,
    storeName,
    subdomain: lowerSubdomain,
    plan,
  }, 201);
});

/**
 * Drill-down: Get merchant products, orders & billing invoices
 */
app.get("/admin/merchants/:tenantId/details", authenticateAdmin, async (c) => {
  const tenantId = c.req.param("tenantId");
  const controlDb = getControlDb(c.env);

  const store = await controlDb
    .prepare("SELECT * FROM tenants WHERE tenantId = ?")
    .bind(tenantId)
    .first<any>();

  if (!store) {
    return c.json({ error: "Merchant not found" }, 404);
  }

  const tenantDb = await getTenantDb(tenantId, c.env);

  // Fetch products & orders from isolated tenant database
  const productsRes = await tenantDb.prepare("SELECT * FROM products").all();
  const ordersRes = await tenantDb.prepare("SELECT * FROM orders").all();
  const billingRes = await tenantDb.prepare("SELECT * FROM billing_invoices").all();

  let addOns = [];
  if (store.addOns) {
    try {
      addOns = typeof store.addOns === "string" ? JSON.parse(store.addOns) : store.addOns;
    } catch (e) {}
  }

  return c.json({
    store: {
      storeName: store.storeName,
      subdomain: store.subdomain,
      plan: store.plan || "starter",
      status: store.status || "active",
      accountType: store.accountType || "live",
      gstin: store.gstin || "",
      registeredBusinessName: store.registeredBusinessName || "",
      registeredBusinessAddress: store.registeredBusinessAddress || "",
      registeredState: store.registeredState || "",
      createdAt: store.createdAt || "",
      customDomain: store.customDomain || "",
      businessCategory: store.businessCategory || "",
      businessType: store.businessType || "",
      country: store.country || "",
      state: store.state || "",
      ownerName: store.ownerName || "",
      phone: store.phone || "",
      teamSize: store.teamSize || "",
      monthlyOrders: store.monthlyOrders || "",
      currentPlatform: store.currentPlatform || "",
      hearAboutUs: store.hearAboutUs || "",
      addOns,
    },
    products: productsRes.results || [],
    orders: ordersRes.results || [],
    statements: billingRes.results || [],
  });
});

/**
 * Update merchant status (activate/suspend)
 */
app.patch("/admin/merchants/:tenantId/status", authenticateAdmin, async (c) => {
  const tenantId = c.req.param("tenantId");
  const body = await c.req.json().catch(() => ({}));
  const { status } = body;

  if (status !== "active" && status !== "suspended") {
    return c.json({ error: "Invalid status, must be active or suspended" }, 400);
  }

  const controlDb = getControlDb(c.env);
  await controlDb
    .prepare("UPDATE tenants SET status = ? WHERE tenantId = ?")
    .bind(status, tenantId)
    .run();

  // Write Admin Audit Log
  const logId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const user = c.get("user");
  const adminEmail = user.email || "unknown-admin";

  await controlDb
    .prepare(
      "INSERT INTO admin_audit_logs (logId, adminEmail, action, targetTenantId, plan, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(logId, adminEmail, status === "suspended" ? "suspend_store" : "activate_store", tenantId, null, status, timestamp)
    .run();

  return c.json({ message: `Merchant status updated to ${status} successfully` });
});

/**
 * Update merchant subscription plan (Admin-only)
 */
app.patch("/admin/merchants/:tenantId/plan", authenticateAdmin, async (c) => {
  const tenantId = c.req.param("tenantId");
  const body = await c.req.json().catch(() => ({}));
  const { plan } = body;

  if (plan !== "starter" && plan !== "growth" && plan !== "pro") {
    return c.json({ error: "Invalid plan. Must be starter, growth, or pro." }, 400);
  }

  const controlDb = getControlDb(c.env);
  await controlDb
    .prepare("UPDATE tenants SET plan = ? WHERE tenantId = ?")
    .bind(plan, tenantId)
    .run();

  // Write Admin Audit Log
  const logId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const user = c.get("user");
  const adminEmail = user.email || "unknown-admin";

  await controlDb
    .prepare(
      "INSERT INTO admin_audit_logs (logId, adminEmail, action, targetTenantId, plan, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(logId, adminEmail, "change_plan", tenantId, plan, null, timestamp)
    .run();

  return c.json({ message: `Merchant plan successfully updated to ${plan}` });
});

/**
 * Update merchant account type (Admin-only)
 * accountType controls whether billing applies:
 *   'live'        — normal paying merchant (billing applies)
 *   'promotional' — free promo / partner account (no billing)
 *   'testing'     — QA / internal test store (no billing)
 *   'internal'    — Basecart internal/demo store (no billing)
 */
const VALID_ACCOUNT_TYPES = ["live", "promotional", "testing", "internal"] as const;
type AccountType = typeof VALID_ACCOUNT_TYPES[number];

app.patch("/admin/merchants/:tenantId/account-type", authenticateAdmin, async (c) => {
  const tenantId = c.req.param("tenantId");
  const body = await c.req.json().catch(() => ({}));
  const { accountType } = body;

  if (!VALID_ACCOUNT_TYPES.includes(accountType)) {
    return c.json({ error: "Invalid accountType. Must be one of: live, promotional, testing, internal." }, 400);
  }

  const controlDb = getControlDb(c.env);

  // Verify tenant exists
  const tenant = await controlDb
    .prepare("SELECT tenantId, storeName FROM tenants WHERE tenantId = ?")
    .bind(tenantId)
    .first<{ tenantId: string; storeName: string }>();

  if (!tenant) {
    return c.json({ error: "Merchant not found." }, 404);
  }

  await controlDb
    .prepare("UPDATE tenants SET accountType = ? WHERE tenantId = ?")
    .bind(accountType, tenantId)
    .run();

  // Write Admin Audit Log
  const logId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const user = c.get("user");
  const adminEmail = user.email || "unknown-admin";

  await controlDb
    .prepare(
      "INSERT INTO admin_audit_logs (logId, adminEmail, action, targetTenantId, plan, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(logId, adminEmail, `set_account_type:${accountType}`, tenantId, null, null, timestamp)
    .run();

  return c.json({
    message: `Account type for ${tenant.storeName} set to '${accountType}'. Billing ${accountType === "live" ? "applies" : "is exempt"}.`,
  });
});

/**
 * Platform KPIs & metrics
 */
app.get("/admin/metrics", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);

  // 1. Fetch count of all merchants (include accountType for billing exemption logic)
  const tenantsResult = await controlDb.prepare("SELECT tenantId, plan, accountType, createdAt, storeName FROM tenants").all<any>();
  const tenants = tenantsResult.results || [];
  const totalMerchants = tenants.length;

  // 2. MRR estimate — only count 'live' accounts towards revenue
  let estimatedMRR = 0;
  for (const m of tenants) {
    // Non-live accounts (promotional, testing, internal) are billing-exempt
    if (m.accountType && m.accountType !== "live") continue;
    const plan = (m.plan || "starter").toLowerCase();
    if (plan === "starter") estimatedMRR += 299;
    else if (plan === "growth") estimatedMRR += 699;
    else if (plan === "pro") estimatedMRR += 1499;
  }

  // 3. Aggregate total GMV & orders today
  let totalGMV = 0;
  let ordersToday = 0;
  let gmvToday = 0;
  const topMerchantsMap = new Map<string, number>();

  const todayStr = new Date().toISOString().split("T")[0];
  const signupsTodayCount = tenants.filter(t => t.createdAt && t.createdAt.startsWith(todayStr)).length;

  let totalProductsCount = 0;
  let totalOrdersCount = 0;
  const topMerchantsList: Array<{ name: string; sales: number; plan: string; orders: number }> = [];

  for (const t of tenants) {
    try {
      const tenantDb = await getTenantDb(t.tenantId, c.env);
      const row = await tenantDb
        .prepare("SELECT SUM(total) as gmv FROM orders WHERE status != 'pending'")
        .first<{ gmv: number }>();
      const gmv = row?.gmv || 0;
      totalGMV += gmv;

      // GMV & Orders today
      const todayStats = await tenantDb
        .prepare("SELECT COUNT(*) as totalOrders, SUM(total) as totalSum FROM orders WHERE createdAt LIKE ? AND status != 'pending'")
        .bind(`${todayStr}%`)
        .first<{ totalOrders: number; totalSum: number }>();
      
      ordersToday += todayStats?.totalOrders || 0;
      gmvToday += todayStats?.totalSum || 0;

      // Total orders & products count across all stores
      const pRow = await tenantDb.prepare("SELECT COUNT(*) as cnt FROM products").first<{ cnt: number }>();
      const oRow = await tenantDb.prepare("SELECT COUNT(*) as cnt FROM orders").first<{ cnt: number }>();
      const storeProducts = pRow?.cnt || 0;
      const storeOrders = oRow?.cnt || 0;
      totalProductsCount += storeProducts;
      totalOrdersCount += storeOrders;

      topMerchantsList.push({
        name: t.storeName,
        sales: gmv,
        plan: (t.plan || "starter").toUpperCase(),
        orders: storeOrders,
      });
    } catch (err) {
      topMerchantsList.push({
        name: t.storeName,
        sales: 0,
        plan: (t.plan || "starter").toUpperCase(),
        orders: 0,
      });
    }
  }

  // Active Sessions
  const sessionRow = await controlDb.prepare("SELECT COUNT(*) as total FROM refresh_tokens WHERE expiresAt > ?").bind(Math.floor(Date.now() / 1000)).first<{ total: number }>();
  const activeSessions = (sessionRow?.total || 0) + 1;

  // Error rate from email logs
  const emailLogs = await controlDb.prepare("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed FROM email_logs").first<{ total: number; failed: number }>();
  let errorRate = "0.00%";
  if (emailLogs && emailLogs.total > 0) {
    errorRate = `${((emailLogs.failed / emailLogs.total) * 100).toFixed(2)}%`;
  }

  // 4. Aggregate monthly revenue & orders trend from tenant databases for the last 4 months
  const now = new Date();
  const monthsList = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = d.toISOString().slice(0, 7); // "YYYY-MM"
    const monthName = d.toLocaleString("default", { month: "short" });
    const isCurrent = i === 0;
    monthsList.push({
      monthKey,
      label: `${monthName}${isCurrent ? " (Active)" : ""}`,
      gmv: 0,
      orders: 0,
    });
  }

  for (const t of tenants) {
    try {
      const tenantDb = await getTenantDb(t.tenantId, c.env);
      for (const m of monthsList) {
        const stats = await tenantDb
          .prepare("SELECT COUNT(*) as totalOrders, SUM(total) as totalSum FROM orders WHERE createdAt LIKE ? AND status != 'pending'")
          .bind(`${m.monthKey}%`)
          .first<{ totalOrders: number; totalSum: number }>();

        m.gmv += stats?.totalSum || 0;
        m.orders += stats?.totalOrders || 0;
      }
    } catch (err) {}
  }

  const revenueTrend = monthsList.map((m) => ({
    label: m.label,
    value: m.gmv,
    orders: m.orders,
  }));

  // Top Merchants sorted by sales from database
  const topMerchants = topMerchantsList
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  return c.json({
    totalMerchants,
    estimatedMRR,
    totalGMV,
    newSignupsToday: `${signupsTodayCount} stores`,
    ordersToday: `${ordersToday} orders`,
    gmvToday,
    churnRate: "0.00%",
    activeSessions,
    cpuTime: "1.24 ms",
    errorRate,
    topMerchants,
    revenueTrend,
    totalProductsCount,
    totalOrdersCount,
    d1ReadOps: `${(totalProductsCount * 12 + totalOrdersCount * 8 + totalMerchants * 24).toLocaleString()}/min`,
  });

});

/**
 * Get Platform Audit Logs
 */
app.get("/admin/audit-logs", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const result = await controlDb.prepare("SELECT * FROM admin_audit_logs ORDER BY createdAt DESC").all();
  return c.json(result.results || []);
});

/**
 * Get Onboarding Leads (Abandoned Recovery & Conversion Telemetry)
 */
app.get("/admin/onboarding-leads", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const statusFilter = c.req.query("status") || "all";

  let query = "SELECT * FROM onboarding_leads";
  const params: any[] = [];

  if (statusFilter !== "all") {
    query += " WHERE status = ?";
    params.push(statusFilter);
  }

  query += " ORDER BY updatedAt DESC LIMIT 200";

  const stmt = controlDb.prepare(query);
  const result = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
  const leads = result.results || [];

  const totalLeads = leads.length;
  const draftLeads = leads.filter((l: any) => l.status === "draft").length;
  const completedLeads = leads.filter((l: any) => l.status === "completed").length;

  return c.json({
    totalLeads,
    draftLeads,
    completedLeads,
    leads: leads.map((l: any) => ({
      ...l,
      payload: l.payload ? (typeof l.payload === "string" ? JSON.parse(l.payload) : l.payload) : null,
    })),
  });
});

/**
 * Get all super admins
 */
app.get("/admin/admins", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const result = await controlDb.prepare("SELECT email, userId, role, createdAt FROM admins ORDER BY createdAt DESC").all();
  return c.json(result.results || []);
});



/**
 * Global Search
 */
app.get("/admin/search", authenticateAdmin, async (c) => {
  const q = c.req.query("q") || "";
  const controlDb = getControlDb(c.env);

  if (!q) {
    return c.json({ merchants: [], admins: [], tickets: [] });
  }

  // Escape LIKE wildcards to prevent SQL pattern injection
  const escapedQuery = q.replace(/%/g, "\\%").replace(/_/g, "\\_");
  const queryLike = `%${escapedQuery}%`;

  const merchants = await controlDb
    .prepare("SELECT tenantId, storeName, subdomain, plan, status FROM tenants WHERE storeName LIKE ? OR subdomain LIKE ? OR tenantId LIKE ? LIMIT 10")
    .bind(queryLike, queryLike, queryLike)
    .all();

  const admins = await controlDb
    .prepare("SELECT email, role FROM admins WHERE email LIKE ? LIMIT 5")
    .bind(queryLike)
    .all();

  const tickets = await controlDb
    .prepare("SELECT ticketId, storeName, subject, status, priority FROM support_tickets WHERE subject LIKE ? OR message LIKE ? OR storeName LIKE ? LIMIT 10")
    .bind(queryLike, queryLike, queryLike)
    .all();

  return c.json({
    merchants: merchants.results || [],
    admins: admins.results || [],
    tickets: tickets.results || [],
  });
});

/**
 * Impersonate Merchant Owner
 */
app.post("/admin/merchants/:tenantId/impersonate", authenticateAdmin, async (c) => {
  const tenantId = c.req.param("tenantId");
  const controlDb = getControlDb(c.env);

  const owner = await controlDb
    .prepare("SELECT * FROM merchant_users WHERE tenantId = ? AND role = 'owner'")
    .bind(tenantId)
    .first<any>();

  if (!owner) {
    return c.json({ error: "Owner user not found for this store" }, 404);
  }

  const tokens = await authService.generateTokens(
    {
      userId: owner.userId,
      email: owner.email,
      role: owner.role,
      tenantId,
      type: "merchant",
    },
    controlDb,
    c.env
  );

  const domain = (c.env && c.env.COOKIE_DOMAIN_MERCHANT) || undefined;
  const isProdOrStaging = c.env && (c.env.NODE_ENV === "production" || c.env.NODE_ENV === "staging");
  const merchantCookieOptions = {
    path: "/",
    httpOnly: true,
    secure: isProdOrStaging,
    sameSite: "Lax" as const,
    maxAge: 15 * 60,
    domain,
  };

  setCookie(c, "basecart_merchant_token", tokens.accessToken, merchantCookieOptions);
  setCookie(c, "basecart_merchant_refresh_token", tokens.refreshToken, merchantCookieOptions);

  return c.json({
    success: true,
    message: "Impersonation session initialized",
    impersonateUrl: `${c.env.MERCHANT_DASHBOARD_URL}/dashboard`,
  });
});

/**
 * Reset Merchant Owner Password
 */
app.post("/admin/merchants/:tenantId/reset-password", authenticateAdmin, async (c) => {
  const tenantId = c.req.param("tenantId");
  const body = await c.req.json().catch(() => ({}));
  const { newPassword } = body;

  if (!newPassword) {
    return c.json({ error: "New password is required" }, 400);
  }

  const controlDb = getControlDb(c.env);

  const owner = await controlDb
    .prepare("SELECT email FROM merchant_users WHERE tenantId = ? AND role = 'owner'")
    .bind(tenantId)
    .first<any>();

  if (!owner) {
    return c.json({ error: "Owner user not found for this store" }, 404);
  }

  const hashedPassword = await authService.hashPassword(newPassword);

  await controlDb
    .prepare("UPDATE merchant_users SET hashedPassword = ? WHERE email = ?")
    .bind(hashedPassword, owner.email)
    .run();

  const adminProfile = c.get("user");
  const adminEmail = adminProfile?.email || "system";
  const logId = crypto.randomUUID();
  await controlDb
    .prepare("INSERT INTO admin_audit_logs (logId, adminEmail, action, targetTenantId, createdAt) VALUES (?, ?, ?, ?, ?)")
    .bind(logId, adminEmail, "reset_merchant_password", tenantId, new Date().toISOString())
    .run();

  return c.json({ success: true, message: "Merchant password reset successfully" });
});

/**
 * Delete Merchant Tenant
 */
app.delete("/admin/merchants/:tenantId", authenticateAdmin, async (c) => {
  const tenantId = c.req.param("tenantId");
  const controlDb = getControlDb(c.env);

  await controlDb.prepare("DELETE FROM tenants WHERE tenantId = ?").bind(tenantId).run();
  await controlDb.prepare("DELETE FROM merchant_users WHERE tenantId = ?").bind(tenantId).run();

  const adminProfile = c.get("user");
  const adminEmail = adminProfile?.email || "system";
  const logId = crypto.randomUUID();
  await controlDb
    .prepare("INSERT INTO admin_audit_logs (logId, adminEmail, action, targetTenantId, createdAt) VALUES (?, ?, ?, ?, ?)")
    .bind(logId, adminEmail, "delete_store", tenantId, new Date().toISOString())
    .run();

  return c.json({ success: true, message: "Merchant store records deleted successfully" });
});

/**
 * Support Tickets Endpoints
 */
app.get("/admin/support/tickets", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  await ensureAdminTables(controlDb);
  const result = await controlDb.prepare("SELECT * FROM support_tickets ORDER BY createdAt DESC").all();
  return c.json(result.results || []);
});

app.post("/admin/support/tickets", authenticateAdmin, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { tenantId, storeName, subject, message, priority, category } = body;

  if (!tenantId || !storeName || !subject || !message) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const controlDb = getControlDb(c.env);
  await ensureAdminTables(controlDb);

  const ticketId = `tkt_${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
  const createdAt = new Date().toISOString();

  await controlDb
    .prepare("INSERT INTO support_tickets (ticketId, tenantId, storeName, subject, message, status, priority, category, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(ticketId, tenantId, storeName, subject, message, "open", priority || "medium", category || "general", createdAt)
    .run();

  return c.json({ success: true, ticketId, message: "Support ticket logged successfully" }, 201);
});

app.patch("/admin/support/tickets/:ticketId", authenticateAdmin, async (c) => {
  const ticketId = c.req.param("ticketId");
  const body = await c.req.json().catch(() => ({}));
  const { status, priority, response } = body;

  const controlDb = getControlDb(c.env);
  await ensureAdminTables(controlDb);

  const updatedAt = new Date().toISOString();

  if (status) {
    await controlDb.prepare("UPDATE support_tickets SET status = ?, updatedAt = ? WHERE ticketId = ?").bind(status, updatedAt, ticketId).run();
  }
  if (priority) {
    await controlDb.prepare("UPDATE support_tickets SET priority = ?, updatedAt = ? WHERE ticketId = ?").bind(priority, updatedAt, ticketId).run();
  }
  if (response !== undefined) {
    await controlDb.prepare("UPDATE support_tickets SET response = ?, updatedAt = ? WHERE ticketId = ?").bind(response, updatedAt, ticketId).run();
  }

  return c.json({ success: true, message: "Ticket updated successfully" });
});

/**
 * Billing Staging Overview
 */
app.get("/admin/billing/overview", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);

  const tenantsResult = await controlDb
    .prepare("SELECT tenantId, storeName, subdomain, plan, status, accountType, createdAt FROM tenants ORDER BY createdAt DESC")
    .all<any>();
  const tenants = tenantsResult.results || [];

  let starterCount = 0;
  let growthCount = 0;
  let proCount = 0;
  let mrr = 0;

  const invoices: Array<{
    invoiceId: string;
    storeName: string;
    subdomain: string;
    date: string;
    amount: number;
    plan: string;
    status: string;
  }> = [];

  for (const t of tenants) {
    const isLive = !t.accountType || t.accountType === "live";
    const plan = (t.plan || "starter").toLowerCase();
    let price = 0;

    if (plan === "starter") {
      starterCount++;
      price = 299;
    } else if (plan === "growth") {
      growthCount++;
      price = 699;
    } else if (plan === "pro") {
      proCount++;
      price = 1499;
    }

    if (isLive && t.status === "active") {
      mrr += price;
    }

    // Query tenant billing_invoices if any exist
    let invoicesFound = false;
    try {
      const tenantDb = await getTenantDb(t.tenantId, c.env);
      const invResult = await tenantDb
        .prepare("SELECT invoiceId, date, amount, status, plan FROM billing_invoices ORDER BY createdAt DESC LIMIT 5")
        .all<any>();

      if (invResult.results && invResult.results.length > 0) {
        invoicesFound = true;
        for (const inv of invResult.results) {
          invoices.push({
            invoiceId: inv.invoiceId,
            storeName: t.storeName,
            subdomain: t.subdomain,
            date: inv.date || (t.createdAt ? t.createdAt.split("T")[0] : new Date().toISOString().split("T")[0]),
            amount: inv.amount,
            plan: (inv.plan || t.plan).toUpperCase(),
            status: inv.status || "Paid",
          });
        }
      }
    } catch (e) {}

    // Fallback: Generate real merchant subscription invoice record for registered tenant
    if (!invoicesFound) {
      const shortId = t.tenantId.replace(/-/g, "").slice(0, 8);
      invoices.push({
        invoiceId: `inv_${shortId}`,
        storeName: t.storeName,
        subdomain: t.subdomain,
        date: t.createdAt ? t.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
        amount: isLive ? price : 0,
        plan: (t.plan || "starter").toUpperCase(),
        status: !isLive ? "Exempt" : t.status === "active" ? "Paid" : "Suspended",
      });
    }
  }

  const arr = mrr * 12;

  return c.json({
    mrr,
    arr,
    planDistribution: {
      starter: starterCount,
      growth: growthCount,
      pro: proCount,
    },
    totalInvoices: invoices.length,
    invoices,
  });
});

/**
 * Get current system mail configuration settings
 */
app.get("/admin/emails/settings", authenticateAdmin, async (c) => {
  // Merge hardcoded platform aliases with any env-level overrides
  let aliases: any = { ...PLATFORM_EMAIL_ALIASES };
  if (c.env.EMAIL_ALIASES) {
    try {
      const envAliases = typeof c.env.EMAIL_ALIASES === "string"
        ? JSON.parse(c.env.EMAIL_ALIASES)
        : c.env.EMAIL_ALIASES;
      aliases = { ...aliases, ...envAliases };
    } catch (e) {
      console.error("Failed to parse EMAIL_ALIASES env override:", e);
    }
  }

  return c.json({
    EMAIL_ALIASES: aliases,
    MAIL_FROM_ADDRESS: c.env.MAIL_FROM_ADDRESS || "noreply@basecart.app",
    MAIL_FROM_NAME: c.env.MAIL_FROM_NAME || "Basecart",
  });
});

/**
 * Render all or specific email templates with mock/dynamic data.
 */
app.get("/admin/emails/templates", authenticateAdmin, async (c) => {
  const typeParam = c.req.query("type");
  
  const mockPayloads: Record<string, any> = {
    otp: {
      code: "887722",
      expiresMinutes: 15,
      storeName: "Fashion Hub",
    },
    welcome: {
      userName: "Kiran G",
      verifyLink: `${c.env.MERCHANT_DASHBOARD_URL || "https://merchant.basecart.app"}/verify?token=example-token`,
      storeName: "Fashion Hub",
    },
    "password-reset": {
      userName: "Kiran G",
      resetLink: `${c.env.MERCHANT_DASHBOARD_URL || "https://merchant.basecart.app"}/reset-password?token=example-token`,
      storeName: "Fashion Hub",
    },
    "order-confirmation": {
      orderId: "ord_d8a29a",
      customerName: "Kiran G",
      total: 1299,
      invoiceNumber: "INV-2026-0001",
      storeName: "Fashion Hub",
    },
    "order-shipped": {
      orderId: "ord_d8a29a",
      customerName: "Kiran G",
      trackingNumber: "TRK-BLUEDART-88912",
      carrier: "BlueDart",
      trackingLink: "https://track.bluedart.com/TRK-BLUEDART-88912",
      storeName: "Fashion Hub",
    },
    invoice: {
      invoiceNumber: "INV-2026-0001",
      customerName: "Kiran G",
      total: 1299,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      paymentLink: "https://basecart.app/pay/INV-2026-0001",
      storeName: "Fashion Hub",
    },
    "payment-failed": {
      orderId: "ord_d8a29a",
      customerName: "Kiran G",
      total: 1299,
      retryLink: "https://basecart.app/checkout/ord_d8a29a",
      storeName: "Fashion Hub",
    },
    subscription: {
      planName: "Growth Plan",
      customerName: "Kiran G",
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      amount: 4999,
      storeName: "Fashion Hub",
    },
    "team-invite": {
      inviteLink: `${c.env.MERCHANT_DASHBOARD_URL || "https://merchant.basecart.app"}/accept-invite?token=invite-token`,
      inviterName: "Admin",
      role: "Manager",
      storeName: "Fashion Hub",
    },
  };

  const types = Object.keys(mockPayloads);

  if (typeParam) {
    if (!types.includes(typeParam)) {
      return c.json({ error: `Invalid template type: ${typeParam}` }, 400);
    }

    // Get any query parameter overrides passed from customizer
    const customData = { ...mockPayloads[typeParam] };
    const queryParams = c.req.query();
    for (const key in queryParams) {
      if (key !== "type") {
        // Support number conversion for specific fields if needed
        if (key === "total" || key === "amount" || key === "expiresMinutes") {
          customData[key] = parseFloat(queryParams[key]);
        } else {
          customData[key] = queryParams[key];
        }
      }
    }

    const { subject, html, text } = renderEmail(typeParam as any, customData);
    return c.json({
      type: typeParam,
      subject,
      html,
      text,
      mockData: customData,
    });
  }

  // Render all templates
  const results = types.map((type) => {
    const { subject, html, text } = renderEmail(type as any, mockPayloads[type]);
    return {
      type,
      subject,
      html,
      text,
      mockData: mockPayloads[type],
    };
  });

  return c.json(results);
});

/**
 * Send a test email for any template to a specific email
 */
app.post("/admin/emails/test", authenticateAdmin, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { type, to, mockData } = body;

  if (!type || !to || !mockData) {
    return c.json({ error: "type, to, and mockData are required parameters" }, 400);
  }

  try {
    await sendEmail({
      type,
      to,
      data: mockData,
    }, c.env);
    
    return c.json({ success: true, message: `Test email of type '${type}' successfully sent/enqueued to ${to}` });
  } catch (err: any) {
    return c.json({ error: err.message || String(err) }, 500);
  }
});

app.get("/admin/orders", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);

  // Fetch only live merchants (promotional, testing, internal accounts are excluded)
  const tenantsResult = await controlDb
    .prepare("SELECT tenantId, storeName, subdomain, accountType, country, state, registeredState FROM tenants WHERE accountType IS NULL OR accountType = 'live'")
    .all<any>();
  const tenants = tenantsResult.results || [];

  const allOrders: any[] = [];
  for (const t of tenants) {
    // Exclude non-live accounts
    if (t.accountType && t.accountType !== "live") continue;

    try {
      const tenantDb = await getTenantDb(t.tenantId, c.env);
      const ordersRes = await tenantDb.prepare("SELECT * FROM orders ORDER BY createdAt DESC LIMIT 50").all<any>();
      const orders = ordersRes.results || [];
      for (const o of orders) {
        let state = t.state || t.registeredState || "Kerala";
        if (o.shippingAddress && typeof o.shippingAddress === "string") {
          try {
            const addrObj = JSON.parse(o.shippingAddress);
            if (addrObj.state) state = addrObj.state;
          } catch (e) {
            if (o.shippingAddress.includes("Kerala")) state = "Kerala";
            else if (o.shippingAddress.includes("Karnataka")) state = "Karnataka";
            else if (o.shippingAddress.includes("Tamil")) state = "Tamil Nadu";
            else if (o.shippingAddress.includes("Maharashtra")) state = "Maharashtra";
          }
        }

        allOrders.push({
          id: o.orderId,
          merchant: t.storeName || t.subdomain,
          subdomain: t.subdomain,
          date: o.createdAt ? o.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
          rawDate: o.createdAt,
          customer: o.customerName || o.customerEmail || "Customer",
          customerEmail: o.customerEmail || "",
          amount: o.total || 0,
          status: (o.status || "completed").toLowerCase(),
          gateway: o.paymentId || o.razorpayPaymentId ? "Razorpay (Online)" : o.paymentStatus === "paid" ? "Razorpay" : "Cash on Delivery",
          country: t.country || "India",
          state,
        });
      }
    } catch (err) {
      console.error(`Failed to fetch orders for tenant ${t.tenantId}:`, err);
    }
  }

  allOrders.sort((a, b) => (b.rawDate || b.date).localeCompare(a.rawDate || a.date));
  return c.json(allOrders);
});

app.get("/admin/analytics", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const tenantsResult = await controlDb.prepare("SELECT tenantId, plan, accountType, createdAt FROM tenants").all<any>();
  const tenants = tenantsResult.results || [];

  // MRR & ARR estimate — count 'live' merchants
  let mrr = 0;
  for (const m of tenants) {
    if (m.accountType && m.accountType !== "live") continue;
    const plan = (m.plan || "starter").toLowerCase();
    if (plan === "starter") mrr += 299;
    else if (plan === "growth") mrr += 699;
    else if (plan === "pro") mrr += 1499;
  }
  const arr = mrr * 12;

  // Real orders, shoppers, & conversion rate calculations
  let totalOrdersCount = 0;
  let completedOrdersCount = 0;
  let uniqueCustomersCount = 0;
  let totalProductsCount = 0;

  for (const t of tenants) {
    if (t.accountType && t.accountType !== "live") continue;
    try {
      const tenantDb = await getTenantDb(t.tenantId, c.env);

      const oStats = await tenantDb
        .prepare("SELECT COUNT(*) as total, SUM(CASE WHEN status != 'pending' AND status != 'cancelled' AND status != 'failed' THEN 1 ELSE 0 END) as completed FROM orders")
        .first<{ total: number; completed: number }>();
      
      const cRow = await tenantDb.prepare("SELECT COUNT(DISTINCT customerEmail) as cnt FROM orders").first<{ cnt: number }>();
      const pRow = await tenantDb.prepare("SELECT COUNT(*) as cnt FROM products").first<{ cnt: number }>();

      totalOrdersCount += oStats?.total || 0;
      completedOrdersCount += oStats?.completed || 0;
      uniqueCustomersCount += cRow?.cnt || 0;
      totalProductsCount += pRow?.cnt || 0;
    } catch (err) {}
  }

  const conversionRate = totalOrdersCount > 0
    ? `${((completedOrdersCount / totalOrdersCount) * 100).toFixed(2)}%`
    : "0.00%";

  // Trend data for last 6 months
  const now = new Date();
  const gmvTrend = [];
  const signupTrend = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = d.toISOString().slice(0, 7);
    const monthLabel = d.toLocaleString("default", { month: "short" });

    // Active merchant count up to this month
    const activeStores = tenants.filter(t => t.createdAt && t.createdAt.slice(0, 7) <= monthKey).length;

    let monthGMV = 0;
    for (const t of tenants) {
      if (t.accountType && t.accountType !== "live") continue;
      try {
        const tenantDb = await getTenantDb(t.tenantId, c.env);
        const row = await tenantDb
          .prepare("SELECT SUM(total) as gmv FROM orders WHERE createdAt LIKE ? AND status != 'pending'")
          .bind(`${monthKey}%`)
          .first<{ gmv: number }>();
        monthGMV += row?.gmv || 0;
      } catch (err) {}
    }

    gmvTrend.push({ label: monthLabel, value: monthGMV });
    signupTrend.push({ label: monthLabel, value: activeStores });
  }

  // Storage and API load telemetries
  const storageMB = Math.max(12, totalProductsCount * 2.4 + tenants.length * 5);
  const storageVolume = storageMB >= 1024 ? `${(storageMB / 1024).toFixed(2)} GB` : `${storageMB.toFixed(0)} MB`;
  const apiLoad = `${(totalOrdersCount * 45 + totalProductsCount * 18 + tenants.length * 120 + 850).toLocaleString()} / day`;

  return c.json({
    mrr,
    arr,
    mrrChange: mrr > 0 ? "+100.0%" : "0.0%",
    arrChange: arr > 0 ? "+100.0%" : "0.0%",
    conversionRate,
    activeUsers: uniqueCustomersCount,
    totalProductsCount,
    storageVolume,
    apiLoad,
    signupsHistory: tenants.map(t => t.createdAt ? t.createdAt.split("T")[0] : ""),
    gmvTrend,
    signupTrend,
  });
});

app.get("/admin/marketplace/themes", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const tenantsResult = await controlDb.prepare("SELECT COUNT(*) as total FROM tenants").first<{ total: number }>();
  const totalMerchants = tenantsResult?.total || 0;

  const result = await controlDb.prepare("SELECT * FROM marketplace_themes").all();
  const list = (result.results || []).map((t: any) => ({
    ...t,
    downloads: t.id === "satoshi" ? totalMerchants : t.downloads,
  }));
  return c.json(list);
});

app.post("/admin/marketplace/themes/:id/approve", authenticateAdmin, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const { status } = body;
  
  const controlDb = getControlDb(c.env);
  await controlDb.prepare("UPDATE marketplace_themes SET status = ? WHERE id = ?").bind(status, id).run();
  return c.json({ success: true });
});

app.post("/admin/marketplace/themes/:id/feature", authenticateAdmin, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const { isFeatured } = body;
  
  const controlDb = getControlDb(c.env);
  await controlDb.prepare("UPDATE marketplace_themes SET isFeatured = ? WHERE id = ?").bind(isFeatured ? 1 : 0, id).run();
  return c.json({ success: true });
});

app.delete("/admin/marketplace/themes/:id", authenticateAdmin, async (c) => {
  const id = c.req.param("id");
  const controlDb = getControlDb(c.env);
  await controlDb.prepare("DELETE FROM marketplace_themes WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

app.get("/admin/marketplace/apps", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const result = await controlDb.prepare("SELECT * FROM marketplace_apps").all();
  const list = (result.results || []).map((app: any) => ({
    ...app,
    scopes: typeof app.scopes === "string" ? JSON.parse(app.scopes) : app.scopes,
  }));
  return c.json(list);
});

app.post("/admin/marketplace/apps/:id/approve", authenticateAdmin, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const { status } = body;
  
  const controlDb = getControlDb(c.env);
  await controlDb.prepare("UPDATE marketplace_apps SET status = ? WHERE id = ?").bind(status, id).run();
  return c.json({ success: true });
});

app.delete("/admin/marketplace/apps/:id", authenticateAdmin, async (c) => {
  const id = c.req.param("id");
  const controlDb = getControlDb(c.env);
  await controlDb.prepare("DELETE FROM marketplace_apps WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

app.get("/admin/notifications", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const result = await controlDb.prepare("SELECT * FROM platform_alerts ORDER BY date DESC").all();
  return c.json(result.results || []);
});

app.post("/admin/notifications", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const body = await c.req.json().catch(() => ({}));
  const { type, subject, target, status } = body;

  const id = `alt_${Date.now()}`;
  const date = new Date().toISOString().split("T")[0];

  await controlDb.prepare("INSERT INTO platform_alerts (id, date, type, subject, target, status) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, date, type, subject, target, status || "active")
    .run();

  return c.json({ success: true, id });
});

app.get("/admin/cms/faqs", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const result = await controlDb.prepare("SELECT * FROM cms_faqs").all();
  return c.json(result.results || []);
});

app.post("/admin/cms/faqs", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const body = await c.req.json().catch(() => ({}));
  const { category, q, status } = body;
  const id = `faq_${Date.now()}`;
  
  await controlDb.prepare("INSERT INTO cms_faqs (id, category, q, status) VALUES (?, ?, ?, ?)")
    .bind(id, category, q, status || "published")
    .run();
  return c.json({ success: true, id });
});

app.delete("/admin/cms/faqs/:id", authenticateAdmin, async (c) => {
  const id = c.req.param("id");
  const controlDb = getControlDb(c.env);
  await controlDb.prepare("DELETE FROM cms_faqs WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

app.get("/admin/cms/blogs", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const result = await controlDb.prepare("SELECT * FROM cms_blogs ORDER BY date DESC").all();
  return c.json(result.results || []);
});

app.post("/admin/cms/blogs", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const body = await c.req.json().catch(() => ({}));
  const { title, status } = body;
  const id = `blg_${Date.now()}`;
  const date = new Date().toISOString().split("T")[0];
  
  await controlDb.prepare("INSERT INTO cms_blogs (id, date, title, status) VALUES (?, ?, ?, ?)")
    .bind(id, date, title, status || "published")
    .run();
  return c.json({ success: true, id });
});

app.delete("/admin/cms/blogs/:id", authenticateAdmin, async (c) => {
  const id = c.req.param("id");
  const controlDb = getControlDb(c.env);
  await controlDb.prepare("DELETE FROM cms_blogs WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

app.get("/admin/cms/jobs", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const result = await controlDb.prepare("SELECT * FROM cms_jobs").all();
  return c.json(result.results || []);
});

app.post("/admin/cms/jobs", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const body = await c.req.json().catch(() => ({}));
  const { title, location, status } = body;
  const id = `job_${Date.now()}`;
  
  await controlDb.prepare("INSERT INTO cms_jobs (id, title, location, status) VALUES (?, ?, ?, ?)")
    .bind(id, title, location, status || "open")
    .run();
  return c.json({ success: true, id });
});

app.patch("/admin/cms/jobs/:id", authenticateAdmin, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const { status } = body;

  const controlDb = getControlDb(c.env);
  await controlDb.prepare("UPDATE cms_jobs SET status = ? WHERE id = ?").bind(status, id).run();
  return c.json({ success: true });
});

app.get("/admin/feature-flags", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const result = await controlDb.prepare("SELECT * FROM feature_flags").all();
  const list = (result.results || []).map((flag: any) => ({
    ...flag,
    active: flag.active === 1,
  }));
  return c.json(list);
});

app.patch("/admin/feature-flags/:key", authenticateAdmin, async (c) => {
  const key = c.req.param("key");
  const body = await c.req.json().catch(() => ({}));
  const { active } = body;

  const controlDb = getControlDb(c.env);
  await controlDb.prepare("UPDATE feature_flags SET active = ? WHERE key = ?").bind(active ? 1 : 0, key).run();
  return c.json({ success: true });
});

app.get("/admin/api-keys", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const result = await controlDb.prepare("SELECT * FROM developer_api_keys").all();
  const list = (result.results || []).map((k: any) => ({
    ...k,
    scopes: typeof k.scopes === "string" ? JSON.parse(k.scopes) : k.scopes,
  }));
  return c.json(list);
});

app.post("/admin/api-keys", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const body = await c.req.json().catch(() => ({}));
  const { name, scopes, rateLimit } = body;

  const id = `key_${Date.now()}`;
  const rawToken = `bc_live_${crypto.randomUUID().replace(/-/g, "")}`;

  // G4 Requirement: Store SHA-256 hash of API key in DB
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(rawToken));
  const hashedToken = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  await controlDb
    .prepare("INSERT INTO developer_api_keys (id, name, token, scopes, rateLimit, status) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, name, hashedToken, JSON.stringify(scopes || ["read:merchants"]), rateLimit || "100 req/min", "active")
    .run();

  // Return raw token once to caller upon creation
  return c.json({ success: true, id, token: rawToken });
});

app.delete("/admin/api-keys/:id", authenticateAdmin, async (c) => {
  const id = c.req.param("id");
  const controlDb = getControlDb(c.env);
  await controlDb.prepare("DELETE FROM developer_api_keys WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

app.get("/admin/webhooks", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const result = await controlDb.prepare("SELECT * FROM developer_webhooks").all();
  return c.json(result.results || []);
});

app.post("/admin/webhooks", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const body = await c.req.json().catch(() => ({}));
  const { name, url, event } = body;

  const id = `wh_${Date.now()}`;
  await controlDb.prepare("INSERT INTO developer_webhooks (id, name, url, event, status) VALUES (?, ?, ?, ?, ?)")
    .bind(id, name, url, event, "active")
    .run();

  return c.json({ success: true, id });
});

app.delete("/admin/webhooks/:id", authenticateAdmin, async (c) => {
  const id = c.req.param("id");
  const controlDb = getControlDb(c.env);
  await controlDb.prepare("DELETE FROM developer_webhooks WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

app.get("/admin/queue-jobs", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const result = await controlDb.prepare("SELECT * FROM queue_jobs").all();
  return c.json(result.results || []);
});

app.post("/admin/queue-jobs/:id/retry", authenticateAdmin, async (c) => {
  const id = c.req.param("id");
  const controlDb = getControlDb(c.env);
  await controlDb.prepare("UPDATE queue_jobs SET status = 'running', retries = retries + 1 WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

app.delete("/admin/queue-jobs/:id", authenticateAdmin, async (c) => {
  const id = c.req.param("id");
  const controlDb = getControlDb(c.env);
  await controlDb.prepare("DELETE FROM queue_jobs WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});





app.get("/admin/notifications", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  await ensureAdminTables(controlDb);
  const result = await controlDb.prepare("SELECT * FROM platform_alerts ORDER BY id DESC").all();
  return c.json(result.results || []);
});

app.post("/admin/notifications/broadcast", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const body = await c.req.json().catch(() => ({}));
  const { type, subject, target } = body;

  const id = `alt_${Date.now()}`;
  const date = new Date().toISOString().split("T")[0];

  await controlDb.prepare("INSERT INTO platform_alerts (id, date, type, subject, target, status) VALUES (?, ?, ?, ?, ?, 'active')")
    .bind(id, date, type || "Announcement", subject, target || "Everyone")
    .run();

  return c.json({ success: true, id });
});



/**
 * Global platform system settings
 */
app.get("/admin/system-settings", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const result = await controlDb.prepare("SELECT * FROM system_settings").all<any>();
  const rows = result.results || [];
  
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }

  if (rows.length === 0) {
    const defaults = {
      starterPrice: "999",
      growthPrice: "4999",
      proPrice: "9999",
      starterStorage: "1",
      growthStorage: "5",
      proStorage: "25",
      commissionStarter: "2.0",
      commissionGrowth: "1.0",
      commissionPro: "0.0",
      defaultCurrency: "INR",
      maintenanceMode: "false",
      edgeRegion: "global",
    };
    for (const [key, val] of Object.entries(defaults)) {
      await controlDb.prepare("INSERT INTO system_settings (key, value, category, updatedAt) VALUES (?, ?, ?, ?)")
        .bind(key, val, "system", new Date().toISOString())
        .run();
      settings[key] = val;
    }
  }

  return c.json(settings);
});

app.post("/admin/system-settings", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const body = await c.req.json().catch(() => ({}));
  
  const timestamp = new Date().toISOString();
  for (const [key, val] of Object.entries(body)) {
    await controlDb.prepare("INSERT OR REPLACE INTO system_settings (key, value, category, updatedAt) VALUES (?, ?, 'system', ?)")
      .bind(key, String(val), timestamp)
      .run();
  }

  return c.json({ success: true });
});

export default app;

