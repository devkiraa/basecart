import { Hono } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import { getControlDb, getTenantDb } from "../lib/db";
import { authService } from "../services/auth";
import { authenticateMerchant } from "../middleware/auth";

const app = new Hono();

function getAdminCookieOptions(c: any, maxAge: number) {
  const domain = (c.env && c.env.COOKIE_DOMAIN_ADMIN) || undefined;
  const isProdOrStaging = c.env && (c.env.NODE_ENV === "production" || c.env.NODE_ENV === "staging");
  return {
    path: "/",
    httpOnly: true,
    secure: isProdOrStaging,
    sameSite: isProdOrStaging ? ("None" as const) : ("Lax" as const),
    maxAge,
    domain,
  };
}

function getAdminDeleteOptions(c: any) {
  const domain = (c.env && c.env.COOKIE_DOMAIN_ADMIN) || undefined;
  return {
    path: "/",
    domain,
  };
}

// Pre-handler middleware to authenticate super admins in Hono
export async function authenticateAdmin(c: any, next: () => Promise<void>) {
  try {
    let token = getCookie(c, "basecart_admin_token");
    if (!token) {
      const authHeader = c.req.header("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return c.json({ error: "Unauthorized: Missing token" }, 401);
    }

    const payload = await authService.verifyAccessToken(token);

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
    controlDb
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

  const lowerEmail = email.toLowerCase();
  const controlDb = getControlDb(c.env);

  const admin = await controlDb
    .prepare("SELECT * FROM admins WHERE email = ?")
    .bind(lowerEmail)
    .first<any>();

  if (!admin) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const match = await authService.comparePassword(password, admin.hashedPassword);
  if (!match) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const tokens = await authService.generateTokens(
    {
      userId: admin.userId,
      email: lowerEmail,
      role: "admin",
      tenantId: "PLATFORM",
      type: "admin" as any,
    },
    controlDb
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
      gstin: store.gstin || "",
      registeredBusinessName: store.registeredBusinessName || "",
      registeredBusinessAddress: store.registeredBusinessAddress || "",
      registeredState: store.registeredState || "",
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
 * Platform KPIs & metrics
 */
app.get("/admin/metrics", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);

  // 1. Fetch count of all merchants
  const tenantsResult = await controlDb.prepare("SELECT tenantId, plan FROM tenants").all<any>();
  const tenants = tenantsResult.results || [];
  const totalMerchants = tenants.length;

  // 2. MRR estimate: starter = 299, growth = 899, pro = 1999
  let estimatedMRR = 0;
  for (const m of tenants) {
    const plan = m.plan || "starter";
    if (plan === "starter") estimatedMRR += 299;
    else if (plan === "growth") estimatedMRR += 899;
    else if (plan === "pro") estimatedMRR += 1999;
  }

  // 3. Aggregate total GMV (completed orders) dynamically across all isolated DO databases
  let totalGMV = 0;
  for (const t of tenants) {
    try {
      const tenantDb = await getTenantDb(t.tenantId, c.env);
      const row = await tenantDb
        .prepare("SELECT SUM(total) as gmv FROM orders WHERE status != 'pending'")
        .first<{ gmv: number }>();
      totalGMV += row?.gmv || 0;
    } catch (err) {
      console.error(`Failed to aggregate GMV for tenant ${t.tenantId}:`, err);
    }
  }

  return c.json({
    totalMerchants,
    estimatedMRR,
    totalGMV,
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
 * Get all super admins
 */
app.get("/admin/admins", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);
  const result = await controlDb.prepare("SELECT email, userId, role, createdAt FROM admins ORDER BY createdAt DESC").all();
  return c.json(result.results || []);
});

/**
 * Admin Logout
 */
app.post("/admin/auth/logout", async (c) => {
  deleteCookie(c, "basecart_admin_token", getAdminDeleteOptions(c));
  deleteCookie(c, "basecart_admin_refresh_token", getAdminDeleteOptions(c));
  return c.json({ message: "Logged out successfully" });
});

export default app;
