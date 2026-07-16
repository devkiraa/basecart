import { Hono } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import { getControlDb, getTenantDb } from "../lib/db";
import { authService } from "../services/auth";
import { authenticateMerchant } from "../middleware/auth";
import { renderEmail, getEmailProvider, sendEmail } from "@basecart/emails";

const app = new Hono<{ Bindings: any; Variables: any }>();

function getAdminCookieOptions(c: any, maxAge: number) {
  const isProdOrStaging = c.env && (c.env.NODE_ENV === "production" || c.env.NODE_ENV === "staging");
  return {
    path: "/",
    httpOnly: true,
    secure: isProdOrStaging,
    sameSite: isProdOrStaging ? ("None" as const) : ("Lax" as const),
    maxAge,
  };
}

function getAdminDeleteOptions(c: any) {
  return {
    path: "/",
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

/**
 * Global Search
 */
app.get("/admin/search", authenticateAdmin, async (c) => {
  const q = c.req.query("q") || "";
  const controlDb = getControlDb(c.env);

  if (!q) {
    return c.json({ merchants: [], admins: [], tickets: [] });
  }

  const queryLike = `%${q}%`;

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
    controlDb
  );

  const domain = (c.env && c.env.COOKIE_DOMAIN_MERCHANT) || undefined;
  const isProdOrStaging = c.env && (c.env.NODE_ENV === "production" || c.env.NODE_ENV === "staging");
  const merchantCookieOptions = {
    path: "/",
    httpOnly: true,
    secure: isProdOrStaging,
    sameSite: isProdOrStaging ? ("None" as const) : ("Lax" as const),
    maxAge: 15 * 60,
    domain,
  };

  setCookie(c, "basecart_merchant_token", tokens.accessToken, merchantCookieOptions);
  setCookie(c, "basecart_merchant_refresh_token", tokens.refreshToken, merchantCookieOptions);

  return c.json({
    success: true,
    message: "Impersonation session initialized",
    impersonateUrl: "https://basecart.app/dashboard",
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

  const adminProfile = c.get("admin");
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

  const adminProfile = c.get("admin");
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
  const result = await controlDb.prepare("SELECT * FROM support_tickets ORDER BY createdAt DESC").all();
  return c.json(result.results || []);
});

app.post("/admin/support/tickets", authenticateAdmin, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { tenantId, storeName, subject, message, priority } = body;

  if (!tenantId || !storeName || !subject || !message) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const controlDb = getControlDb(c.env);
  const ticketId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await controlDb
    .prepare("INSERT INTO support_tickets (ticketId, tenantId, storeName, subject, message, status, priority, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(ticketId, tenantId, storeName, subject, message, "open", priority || "medium", createdAt)
    .run();

  return c.json({ success: true, ticketId, message: "Ticket created successfully" }, 201);
});

app.patch("/admin/support/tickets/:ticketId", authenticateAdmin, async (c) => {
  const ticketId = c.req.param("ticketId");
  const body = await c.req.json().catch(() => ({}));
  const { status, priority } = body;

  const controlDb = getControlDb(c.env);

  if (status) {
    await controlDb.prepare("UPDATE support_tickets SET status = ? WHERE ticketId = ?").bind(status, ticketId).run();
  }
  if (priority) {
    await controlDb.prepare("UPDATE support_tickets SET priority = ? WHERE ticketId = ?").bind(priority, ticketId).run();
  }

  return c.json({ success: true, message: "Ticket updated successfully" });
});

/**
 * Billing Staging Overview
 */
app.get("/admin/billing/overview", authenticateAdmin, async (c) => {
  const controlDb = getControlDb(c.env);

  const tenants = await controlDb.prepare("SELECT plan, status FROM tenants").all<any>();
  let starterCount = 0;
  let growthCount = 0;
  let proCount = 0;

  tenants.results?.forEach((t) => {
    if (t.status === "active") {
      if (t.plan === "starter") starterCount++;
      else if (t.plan === "growth") growthCount++;
      else if (t.plan === "pro") proCount++;
    }
  });

  const mrr = starterCount * 999 + growthCount * 4999 + proCount * 9999;
  const arr = mrr * 12;

  return c.json({
    mrr,
    arr,
    planDistribution: {
      starter: starterCount,
      growth: growthCount,
      pro: proCount,
    },
    totalInvoices: tenants.results?.length || 0,
  });
});

/**
 * Get current system mail configuration settings
 */
app.get("/admin/emails/settings", authenticateAdmin, async (c) => {
  return c.json({
    EMAIL_ALIASES: c.env.EMAIL_ALIASES || null,
    MAIL_FROM_ADDRESS: c.env.MAIL_FROM_ADDRESS || null,
    MAIL_FROM_NAME: c.env.MAIL_FROM_NAME || null,
    MAIL_FROM_OTP: c.env.MAIL_FROM_OTP || null,
    MAIL_FROM_WELCOME: c.env.MAIL_FROM_WELCOME || null,
    MAIL_FROM_SECURITY: c.env.MAIL_FROM_SECURITY || null,
    MAIL_FROM_ORDERS: c.env.MAIL_FROM_ORDERS || null,
    MAIL_FROM_BILLING: c.env.MAIL_FROM_BILLING || null,
    MAIL_FROM_NOREPLY: c.env.MAIL_FROM_NOREPLY || null,
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
      verifyLink: "https://basecart.app/verify?token=example-token",
      storeName: "Fashion Hub",
    },
    "password-reset": {
      userName: "Kiran G",
      resetLink: "https://basecart.app/reset-password?token=example-token",
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
      inviteLink: "https://basecart.app/accept-invite?token=invite-token",
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

export default app;
