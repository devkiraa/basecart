import { Hono } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import { getControlDb, getTenantDb } from "../lib/db";
import { authService } from "../services/auth";
import { getTenantBySubdomain, provisionTenantDatabase } from "../services/tenant";
import { sendEmail } from "../services/email";
import {
  MerchantSignupSchema,
  MerchantLoginSchema,
  CustomerSignupSchema,
  CustomerLoginSchema,
  isReservedSubdomain,
} from "@basecart/shared";
import { authenticateMerchant, authenticateCustomer, resolveStorefrontTenant } from "../middleware/auth";
import { logReservedSubdomainAbuse } from "../lib/audit";

const app = new Hono<{ Bindings: any; Variables: any }>();

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

function getMerchantCookieOptions(c: any, maxAge: number) {
  const isLocal = isLocalHostRequest(c);
  const isHttps = c.req.header("x-forwarded-proto") === "https" || c.req.url.startsWith("https");
  const isProdOrStaging = !isLocal && ((c.env && (c.env.NODE_ENV === "production" || c.env.NODE_ENV === "staging")) || isHttps);
  const domain = isLocal ? undefined : ((c.env && c.env.COOKIE_DOMAIN_MERCHANT) || undefined);
  return {
    path: "/",
    httpOnly: true,
    secure: isLocal ? false : isProdOrStaging,
    sameSite: isLocal ? ("Lax" as const) : isProdOrStaging ? ("None" as const) : ("Lax" as const),
    maxAge,
    domain,
  };
}

function getMerchantDeleteOptions(c: any) {
  const isLocal = isLocalHostRequest(c);
  const isHttps = c.req.header("x-forwarded-proto") === "https" || c.req.url.startsWith("https");
  const isProdOrStaging = !isLocal && ((c.env && (c.env.NODE_ENV === "production" || c.env.NODE_ENV === "staging")) || isHttps);
  const domain = isLocal ? undefined : ((c.env && c.env.COOKIE_DOMAIN_MERCHANT) || undefined);
  return {
    path: "/",
    domain,
    secure: isLocal ? false : isProdOrStaging,
    sameSite: isLocal ? ("Lax" as const) : isProdOrStaging ? ("None" as const) : ("Lax" as const),
  };
}

function getCustomerCookieOptions(c: any, maxAge: number) {
  const isLocal = isLocalHostRequest(c);
  const isHttps = c.req.header("x-forwarded-proto") === "https" || c.req.url.startsWith("https");
  const isProdOrStaging = !isLocal && ((c.env && (c.env.NODE_ENV === "production" || c.env.NODE_ENV === "staging")) || isHttps);
  const domain = isLocal ? undefined : ((c.env && c.env.COOKIE_DOMAIN_CUSTOMER) || undefined);
  return {
    path: "/",
    httpOnly: true,
    secure: isLocal ? false : isProdOrStaging,
    sameSite: isLocal ? ("Lax" as const) : isProdOrStaging ? ("None" as const) : ("Lax" as const),
    maxAge,
    domain,
  };
}

function getCustomerDeleteOptions(c: any) {
  const isLocal = isLocalHostRequest(c);
  const isHttps = c.req.header("x-forwarded-proto") === "https" || c.req.url.startsWith("https");
  const isProdOrStaging = !isLocal && ((c.env && (c.env.NODE_ENV === "production" || c.env.NODE_ENV === "staging")) || isHttps);
  const domain = isLocal ? undefined : ((c.env && c.env.COOKIE_DOMAIN_CUSTOMER) || undefined);
  return {
    path: "/",
    domain,
    secure: isLocal ? false : isProdOrStaging,
    sameSite: isLocal ? ("Lax" as const) : isProdOrStaging ? ("None" as const) : ("Lax" as const),
  };
}

// --- Helper: Send verification/reset emails safely ---
async function sendEmailSafely(payload: any, env: any) {
  try {
    await sendEmail(payload, env);
  } catch (error) {
    console.error(`Failed to send email to ${payload.to}:`, error);
  }
}

// -------------------------------------------------------------
// 1. Merchant Auth Endpoints
// -------------------------------------------------------------

/**
 * Check Subdomain Availability
 */
app.get("/auth/merchant/check-subdomain", async (c) => {
  const subdomain = c.req.query("subdomain")?.trim().toLowerCase() || "";
  if (!subdomain) {
    return c.json({ error: "Subdomain is required" }, 400);
  }

  if (isReservedSubdomain(subdomain)) {
    logReservedSubdomainAbuse(c, subdomain);
    return c.json({
      success: false,
      code: "RESERVED_SUBDOMAIN",
      message: "This store name is reserved."
    }, 409);
  }

  const controlDb = getControlDb(c.env);

  const existing = await controlDb
    .prepare("SELECT tenantId FROM tenants WHERE subdomain = ?")
    .bind(subdomain)
    .first();

  if (!existing) {
    return c.json({ available: true, alternates: [] });
  }

  // Generate 3 available alternates
  const suffixes = ["shop", "store", "official", "app", "online", "india", "outlet", "brands"];
  const alternates: string[] = [];

  for (const suffix of suffixes) {
    const candidate = `${subdomain}-${suffix}`;
    const candExisting = await controlDb
      .prepare("SELECT tenantId FROM tenants WHERE subdomain = ?")
      .bind(candidate)
      .first();

    if (!candExisting) {
      alternates.push(candidate);
      if (alternates.length >= 3) {
        break;
      }
    }
  }

  return c.json({
    available: false,
    alternates,
  });
});

/**
 * Merchant Signup
 * Creates a store (tenant) and the owner account atomically.
 */
app.post("/auth/merchant/signup", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parseResult = MerchantSignupSchema.safeParse(body);
  
  if (!parseResult.success) {
    return c.json({
      error: "Validation failed",
      issues: parseResult.error.format(),
    }, 400);
  }

  const {
    email,
    password,
    storeName,
    subdomain,
    businessCategory = null,
    businessType = null,
    country = "India",
    state = null,
    ownerName = null,
    phone = null,
    teamSize = null,
    monthlyOrders = null,
    currentPlatform = null,
    hearAboutUs = null,
    selectedPlan = "starter",
    receiveUpdates = false,
  } = parseResult.data;
  const lowerEmail = email.toLowerCase();
  const lowerSubdomain = subdomain.toLowerCase();

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

  // 2. Check if user already exists globally
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
      "INSERT INTO tenants (tenantId, storeName, subdomain, plan, status, createdAt, razorpayKeyId, razorpaySecret, customDomain, addOns, branding, businessCategory, businessType, country, state, ownerName, phone, teamSize, monthlyOrders, currentPlatform, hearAboutUs, receiveUpdates) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      tenantId,
      storeName,
      lowerSubdomain,
      selectedPlan,
      "active",
      createdAt,
      null,
      null,
      null,
      "[]",
      "{}",
      businessCategory,
      businessType,
      country,
      state,
      ownerName,
      phone,
      teamSize,
      monthlyOrders,
      currentPlatform,
      hearAboutUs,
      receiveUpdates ? 1 : 0
    );

  const uStmt = controlDb
    .prepare(
      "INSERT INTO merchant_users (email, tenantId, userId, hashedPassword, role, emailVerified, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(lowerEmail, tenantId, userId, hashedPassword, "owner", 0, createdAt);

  await controlDb.batch([tStmt, uStmt]);

  // 6. Run migrations & seed default configuration inside the tenant database
  await provisionTenantDatabase(tenantId, storeName, c.env);

  // 7. Create email verification token & 6-digit OTP code
  const verificationToken = crypto.randomUUID();
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const verificationTtl = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

  const insertToken = controlDb
    .prepare("INSERT INTO verification_tokens (token, email, tenantId, expiresAt, ttl) VALUES (?, ?, ?, ?, ?)")
    .bind(verificationToken, lowerEmail, tenantId, verificationExpiry, verificationTtl);

  const insertOtp = controlDb
    .prepare("INSERT INTO verification_tokens (token, email, tenantId, expiresAt, ttl) VALUES (?, ?, ?, ?, ?)")
    .bind(otpCode, lowerEmail, tenantId, verificationExpiry, verificationTtl);

  await controlDb.batch([insertToken, insertOtp]);

  const verifyLink = `${c.env.MERCHANT_DASHBOARD_URL}/verify?token=${verificationToken}`;
  await sendEmailSafely(
    {
      type: "welcome",
      to: lowerEmail,
      data: {
        userName: storeName,
        verifyLink,
        otpCode,
        storeName: "Basecart",
      },
    },
    c.env
  );

  // 8. Generate auth tokens
  const tokens = await authService.generateTokens(
    {
      userId,
      email: lowerEmail,
      role: "owner",
      tenantId,
      type: "merchant",
    },
    controlDb,
    c.env
  );

  setCookie(c, "basecart_merchant_token", tokens.accessToken, getMerchantCookieOptions(c, 15 * 60));
  setCookie(c, "basecart_merchant_refresh_token", tokens.refreshToken, getMerchantCookieOptions(c, 7 * 24 * 60 * 60));

  return c.json({
    message: "Merchant account and store created successfully",
    tenantId,
    store: {
      storeName,
      subdomain: lowerSubdomain,
    },
    ...tokens,
  }, 201);
});

/**
 * Merchant Login
 */
app.post("/auth/merchant/login", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parseResult = MerchantLoginSchema.safeParse(body);

  if (!parseResult.success) {
    return c.json({
      error: "Validation failed",
      issues: parseResult.error.format(),
    }, 400);
  }

  const { email, password } = parseResult.data;
  const lowerEmail = email.toLowerCase();

  const controlDb = getControlDb(c.env);

  const user = await controlDb
    .prepare("SELECT * FROM merchant_users WHERE email = ?")
    .bind(lowerEmail)
    .first<any>();

  if (!user) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const valid = await authService.comparePassword(password, user.hashedPassword);
  if (!valid) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const tokens = await authService.generateTokens(
    {
      userId: user.userId,
      email: lowerEmail,
      role: user.role,
      tenantId: user.tenantId,
      type: "merchant",
    },
    controlDb,
    c.env
  );

  setCookie(c, "basecart_merchant_token", tokens.accessToken, getMerchantCookieOptions(c, 15 * 60));
  setCookie(c, "basecart_merchant_refresh_token", tokens.refreshToken, getMerchantCookieOptions(c, 7 * 24 * 60 * 60));

  return c.json({
    tenantId: user.tenantId,
    email: lowerEmail,
    role: user.role,
    emailVerified: user.emailVerified === 1,
    ...tokens,
  });
});

/**
 * Merchant Refresh Token
 */
app.post("/auth/merchant/refresh", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  let refreshToken = getCookie(c, "basecart_merchant_refresh_token") || body.refreshToken;
  const tenantId = body.tenantId;

  if (!refreshToken || !tenantId) {
    return c.json({ error: "refreshToken and tenantId are required" }, 400);
  }

  try {
    const controlDb = getControlDb(c.env);
    const tokens = await authService.refreshSession(refreshToken, tenantId, controlDb, c.env);

    setCookie(c, "basecart_merchant_token", tokens.accessToken, getMerchantCookieOptions(c, 15 * 60));
    setCookie(c, "basecart_merchant_refresh_token", tokens.refreshToken, getMerchantCookieOptions(c, 7 * 24 * 60 * 60));

    return c.json(tokens);
  } catch (err: any) {
    return c.json({ error: err.message || "Invalid session" }, 401);
  }
});

/**
 * Get Current Merchant Profile (Future cacheable by session token)
 */
app.get("/auth/merchant/me", authenticateMerchant, async (c) => {
  const user = c.get("user");
  const tenantId = c.get("tenantId");

  const controlDb = getControlDb(c.env);
  const dbUser = await controlDb
    .prepare("SELECT emailVerified FROM merchant_users WHERE email = ? AND tenantId = ?")
    .bind(user.email, tenantId)
    .first<any>();

  const tokens = await authService.generateTokens(
    {
      userId: user.userId,
      email: user.email,
      role: user.role,
      tenantId: tenantId,
      type: "merchant",
    },
    controlDb,
    c.env
  );

  return c.json({
    tenantId,
    email: user.email,
    role: user.role,
    emailVerified: dbUser?.emailVerified === 1,
    accessToken: tokens.accessToken,
  });
});

/**
 * GET /auth/merchant/stores
 * Returns all stores the authenticated merchant owns (by email).
 */
app.get("/auth/merchant/stores", authenticateMerchant, async (c) => {
  const user = c.get("user");
  const controlDb = getControlDb(c.env);

  const rows = await controlDb
    .prepare(
      "SELECT t.tenantId, t.subdomain, t.storeName FROM tenants t INNER JOIN merchant_users mu ON mu.tenantId = t.tenantId WHERE mu.email = ?"
    )
    .bind(user.email)
    .all<{ tenantId: string; subdomain: string; storeName: string }>();

  return c.json(rows.results ?? []);
});

/**
 * Merchant Logout
 */
app.post("/auth/merchant/logout", async (c) => {
  const refreshToken = getCookie(c, "basecart_merchant_refresh_token");
  if (refreshToken) {
    try {
      const controlDb = getControlDb(c.env);
      await controlDb.prepare("DELETE FROM refresh_tokens WHERE token = ?").bind(refreshToken).run();
    } catch (e) {}
  }
  deleteCookie(c, "basecart_merchant_token", getMerchantDeleteOptions(c));
  deleteCookie(c, "basecart_merchant_refresh_token", getMerchantDeleteOptions(c));
  return c.json({ message: "Logged out successfully" });
});

/**
 * Merchant Forgot Password
 */
app.post("/auth/merchant/forgot-password", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { email } = body;
  
  if (!email) {
    return c.json({ error: "Email is required" }, 400);
  }
  const lowerEmail = email.toLowerCase();

  const controlDb = getControlDb(c.env);
  const user = await controlDb
    .prepare("SELECT tenantId FROM merchant_users WHERE email = ?")
    .bind(lowerEmail)
    .first<{ tenantId: string }>();

  if (user) {
    // Delete any existing reset tokens for this email first
    await controlDb
      .prepare("DELETE FROM reset_tokens WHERE email = ? AND tenantId = ?")
      .bind(lowerEmail, user.tenantId)
      .run();

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // Expire in 10 minutes
    const ttl = Math.floor(Date.now() / 1000) + 10 * 60;

    await controlDb
      .prepare(
        "INSERT INTO reset_tokens (token, email, tenantId, expiresAt, ttl) VALUES (?, ?, ?, ?, ?)"
      )
      .bind(token, lowerEmail, user.tenantId, expiresAt, ttl)
      .run();

    const resetLink = `${c.env.MERCHANT_DASHBOARD_URL}/reset-password?token=${token}`;
    await sendEmailSafely(
      {
        type: "password-reset",
        to: lowerEmail,
        data: {
          resetLink,
          expiresMinutes: 10,
          storeName: "Basecart",
        },
      },
      c.env
    );
  }

  return c.json({ message: "If the email is registered, a password reset link has been sent." });
});

/**
 * Verify Merchant Reset Password Token
 */
app.get("/auth/merchant/verify-reset-token", async (c) => {
  const token = c.req.query("token");
  if (!token) {
    return c.json({ valid: false, error: "Password reset token is missing. Please request a new link." }, 400);
  }

  const controlDb = getControlDb(c.env);
  const resetToken = await controlDb
    .prepare("SELECT * FROM reset_tokens WHERE token = ?")
    .bind(token)
    .first<any>();

  if (!resetToken) {
    return c.json({ valid: false, error: "Invalid or expired reset token" }, 400);
  }

  if (new Date(resetToken.expiresAt) < new Date()) {
    await controlDb
      .prepare("DELETE FROM reset_tokens WHERE token = ?")
      .bind(token)
      .run();
    return c.json({ valid: false, error: "Invalid or expired reset token" }, 400);
  }

  return c.json({ valid: true });
});

/**
 * Merchant Reset Password
 */
app.post("/auth/merchant/reset-password", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { token, newPassword } = body;

  if (!token || !newPassword || newPassword.length < 6) {
    return c.json({ error: "Token and password (min 6 chars) are required" }, 400);
  }

  const controlDb = getControlDb(c.env);
  const resetToken = await controlDb
    .prepare("SELECT * FROM reset_tokens WHERE token = ?")
    .bind(token)
    .first<any>();

  if (!resetToken) {
    return c.json({ error: "Invalid or expired reset token" }, 400);
  }

  if (new Date(resetToken.expiresAt) < new Date()) {
    // Immediately clean up expired token
    await controlDb
      .prepare("DELETE FROM reset_tokens WHERE token = ?")
      .bind(token)
      .run();
    return c.json({ error: "Reset token has expired (tokens are valid for 10 minutes)" }, 400);
  }

  // Prevent reusing previous password
  const currentUser = await controlDb
    .prepare("SELECT hashedPassword FROM merchant_users WHERE email = ? AND tenantId = ?")
    .bind(resetToken.email, resetToken.tenantId)
    .first<{ hashedPassword: string }>();

  if (currentUser?.hashedPassword) {
    const isSamePassword = await authService.comparePassword(newPassword, currentUser.hashedPassword);
    if (isSamePassword) {
      return c.json({ error: "New password cannot be the same as your previous password. Please choose a different password." }, 400);
    }
  }

  const hashedPassword = await authService.hashPassword(newPassword);

  // Update password and invalidate ALL reset tokens & active sessions for this email in control DB
  const updatePass = controlDb
    .prepare("UPDATE merchant_users SET hashedPassword = ? WHERE email = ? AND tenantId = ?")
    .bind(hashedPassword, resetToken.email, resetToken.tenantId);

  const deleteSession = controlDb
    .prepare("DELETE FROM refresh_tokens WHERE tenantId = ? AND email = ?")
    .bind(resetToken.tenantId, resetToken.email);

  const deleteToken = controlDb
    .prepare("DELETE FROM reset_tokens WHERE email = ? AND tenantId = ?")
    .bind(resetToken.email, resetToken.tenantId);

  await controlDb.batch([updatePass, deleteSession, deleteToken]);

  return c.json({ message: "Password has been successfully reset" });
});

/**
 * Resend Verification Email (Merchant-only)
 */
app.post("/auth/merchant/resend-verification", authenticateMerchant, async (c) => {
  const email = c.get("user").email;
  const tenantId = c.get("tenantId");

  const controlDb = getControlDb(c.env);
  const dbUser = await controlDb
    .prepare("SELECT emailVerified FROM merchant_users WHERE email = ? AND tenantId = ?")
    .bind(email, tenantId)
    .first<{ emailVerified: number }>();

  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  if (dbUser.emailVerified === 1) {
    return c.json({ error: "Email is already verified" }, 400);
  }

  const verificationToken = crypto.randomUUID();
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const verificationTtl = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

  const insertToken = controlDb
    .prepare("INSERT INTO verification_tokens (token, email, tenantId, expiresAt, ttl) VALUES (?, ?, ?, ?, ?)")
    .bind(verificationToken, email, tenantId, verificationExpiry, verificationTtl);

  const insertOtp = controlDb
    .prepare("INSERT INTO verification_tokens (token, email, tenantId, expiresAt, ttl) VALUES (?, ?, ?, ?, ?)")
    .bind(otpCode, email, tenantId, verificationExpiry, verificationTtl);

  await controlDb.batch([insertToken, insertOtp]);

  const verifyLink = `${c.env.MERCHANT_DASHBOARD_URL}/verify?token=${verificationToken}`;
  await sendEmailSafely(
    {
      type: "welcome",
      to: email,
      data: {
        verifyLink,
        otpCode,
        storeName: "Basecart",
      },
    },
    c.env
  );

  return c.json({ message: "Verification email resent successfully" });
});

/**
 * Verify Email
 */
app.get("/auth/merchant/verify-email", async (c) => {
  const token = c.req.query("token");
  const isJson = c.req.header("accept")?.includes("application/json");

  if (!token) {
    if (isJson) return c.json({ error: "Token is required" }, 400);
    return c.redirect(`${c.env.MERCHANT_DASHBOARD_URL}/verify?error=Token is required`);
  }

  const controlDb = getControlDb(c.env);
  const tokenItem = await controlDb
    .prepare("SELECT * FROM verification_tokens WHERE token = ?")
    .bind(token)
    .first<any>();

  if (!tokenItem) {
    if (isJson) return c.json({ error: "Invalid or expired token" }, 400);
    return c.redirect(`${c.env.MERCHANT_DASHBOARD_URL}/verify?error=Invalid or expired token`);
  }

  if (new Date(tokenItem.expiresAt) < new Date()) {
    if (isJson) return c.json({ error: "Token has expired" }, 400);
    return c.redirect(`${c.env.MERCHANT_DASHBOARD_URL}/verify?error=Token has expired`);
  }

  // Update merchant user emailVerified status and delete the verification token
  const updateVerify = controlDb
    .prepare("UPDATE merchant_users SET emailVerified = 1 WHERE email = ? AND tenantId = ?")
    .bind(tokenItem.email, tokenItem.tenantId);

  const deleteToken = controlDb
    .prepare("DELETE FROM verification_tokens WHERE token = ?")
    .bind(token);

  await controlDb.batch([updateVerify, deleteToken]);

  if (isJson) return c.json({ success: true });
  return c.redirect(`${c.env.MERCHANT_DASHBOARD_URL}/verify?verified=true`);
});

/**
 * Fetch Merchant Notifications (D1 + Smart System Triggers)
 */
app.get("/merchant/notifications", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const email = c.get("user")!.email;
  const controlDb = getControlDb(c.env);

  // 1. Fetch user & tenant details from control DB
  const user = await controlDb
    .prepare("SELECT emailVerified FROM merchant_users WHERE email = ? AND tenantId = ?")
    .bind(email, tenantId)
    .first<{ emailVerified: number }>();

  const tenant = await controlDb
    .prepare("SELECT plan, razorpayKeyId, createdAt FROM tenants WHERE tenantId = ?")
    .bind(tenantId)
    .first<{ plan: string; razorpayKeyId: string; createdAt: string }>();

  // 2. Fetch DB stored notifications
  const dbNotifs = await controlDb
    .prepare("SELECT * FROM merchant_notifications WHERE tenantId = ? ORDER BY createdAt DESC LIMIT 20")
    .bind(tenantId)
    .all<any>();

  const result: any[] = (dbNotifs.results || []).map((n) => ({
    id: n.id,
    title: n.title,
    desc: n.desc,
    type: n.type || "info",
    actionUrl: n.actionUrl || null,
    read: n.read === 1,
    createdAt: n.createdAt,
  }));

  // 3. Auto-generate smart system notifications if missing
  const isEmailVerified = user?.emailVerified === 1;
  const nowStr = new Date().toISOString();

  if (!isEmailVerified && !result.some((n) => n.id === "sys-verify")) {
    result.unshift({
      id: "sys-verify",
      title: "Email Verification Required ⚠️",
      desc: "Please enter your 6-digit OTP code to verify your email and activate live storefront access.",
      type: "warning",
      actionUrl: "#verify",
      read: false,
      createdAt: nowStr,
    });
  }

  if (!tenant?.razorpayKeyId && !result.some((n) => n.id === "sys-razorpay")) {
    result.push({
      id: "sys-razorpay",
      title: "Razorpay Integration Pending 💳",
      desc: "Configure your Razorpay Key ID in Settings to accept live payments on your storefront.",
      type: "info",
      actionUrl: "#settings",
      read: false,
      createdAt: tenant?.createdAt || nowStr,
    });
  }

  if ((tenant?.plan === "free" || tenant?.plan === "starter") && !result.some((n) => n.id === "sys-plan")) {
    result.push({
      id: "sys-plan",
      title: "Plan Upgrade Available ⚡",
      desc: "Upgrade to the Growth or Pro plan to unlock custom domain mapping and automated Shiprocket shipping.",
      type: "plan",
      actionUrl: "#billing",
      read: false,
      createdAt: tenant?.createdAt || nowStr,
    });
  }

  if (!result.some((n) => n.id === "sys-welcome")) {
    result.push({
      id: "sys-welcome",
      title: "Welcome to Basecart! 🛍️",
      desc: "Your store design and isolated SQLite database are fully provisioned and ready.",
      type: "system",
      actionUrl: "#summary",
      read: true,
      createdAt: tenant?.createdAt || nowStr,
    });
  }

  return c.json({ notifications: result });
});

/**
 * Mark Single Notification as Read
 */
app.post("/merchant/notifications/:id/read", authenticateMerchant, async (c) => {
  const notifId = c.req.param("id");
  const tenantId = c.get("tenantId")!;
  const controlDb = getControlDb(c.env);

  await controlDb
    .prepare("UPDATE merchant_notifications SET read = 1 WHERE id = ? AND tenantId = ?")
    .bind(notifId, tenantId)
    .run();

  return c.json({ success: true });
});

/**
 * Mark All Merchant Notifications as Read
 */
app.post("/merchant/notifications/read-all", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const controlDb = getControlDb(c.env);

  await controlDb
    .prepare("UPDATE merchant_notifications SET read = 1 WHERE tenantId = ?")
    .bind(tenantId)
    .run();

  return c.json({ success: true });
});

// -------------------------------------------------------------
// 2. Customer Auth Endpoints (Storefront-scoped)
// -------------------------------------------------------------

/**
 * Customer Signup (Per-store scoped)
 */
app.post("/auth/customer/signup", resolveStorefrontTenant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const controlDb = getControlDb(c.env);

  // 1. Fetch store plan details from control DB
  const tenant = await controlDb
    .prepare("SELECT plan FROM tenants WHERE tenantId = ?")
    .bind(tenantId)
    .first<{ plan: string }>();

  const plan = tenant?.plan || "starter";
  if (plan === "free" || plan === "starter") {
    return c.json({
      error: "Feature locked: Customer accounts require the Growth or Pro tier. Please upgrade.",
    }, 403);
  }

  const body = await c.req.json().catch(() => ({}));
  const parseResult = CustomerSignupSchema.safeParse(body);

  if (!parseResult.success) {
    return c.json({
      error: "Validation failed",
      issues: parseResult.error.format(),
    }, 400);
  }

  const { email, password, name } = parseResult.data;
  const lowerEmail = email.toLowerCase();

  const tenantDb = await getTenantDb(tenantId, c.env);

  // 2. Check if customer email already exists in this tenant DB
  const existingCustomer = await tenantDb
    .prepare("SELECT customerId FROM customers WHERE email = ?")
    .bind(lowerEmail)
    .first();

  if (existingCustomer) {
    return c.json({ error: "Email is already registered on this store" }, 400);
  }

  // 3. Create customer record
  const customerId = crypto.randomUUID();
  const hashedPassword = await authService.hashPassword(password);
  const createdAt = new Date().toISOString();

  await tenantDb
    .prepare(
      "INSERT INTO customers (customerId, name, email, hashedPassword, createdAt) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(customerId, name, lowerEmail, hashedPassword, createdAt)
    .run();

  // 4. Generate tokens
  const tokens = await authService.generateTokens(
    {
      userId: customerId,
      email: lowerEmail,
      role: "customer",
      tenantId,
      type: "customer",
    },
    controlDb,
    c.env
  );

  setCookie(c, "basecart_customer_token", tokens.accessToken, getCustomerCookieOptions(c, 15 * 60));
  setCookie(c, "basecart_customer_refresh_token", tokens.refreshToken, getCustomerCookieOptions(c, 7 * 24 * 60 * 60));

  return c.json({
    message: "Customer account created successfully",
    customerId,
    name,
    email: lowerEmail,
    ...tokens,
  }, 201);
});

/**
 * Customer Login (Per-store scoped)
 */
app.post("/auth/customer/login", resolveStorefrontTenant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const controlDb = getControlDb(c.env);

  // 1. Fetch store plan details
  const tenant = await controlDb
    .prepare("SELECT plan FROM tenants WHERE tenantId = ?")
    .bind(tenantId)
    .first<{ plan: string }>();

  const plan = tenant?.plan || "starter";
  if (plan === "free" || plan === "starter") {
    return c.json({
      error: "Feature locked: Customer accounts require the Growth or Pro tier. Please upgrade.",
    }, 403);
  }

  const body = await c.req.json().catch(() => ({}));
  const parseResult = CustomerLoginSchema.safeParse(body);

  if (!parseResult.success) {
    return c.json({
      error: "Validation failed",
      issues: parseResult.error.format(),
    }, 400);
  }

  const { email, password } = parseResult.data;
  const lowerEmail = email.toLowerCase();

  const tenantDb = await getTenantDb(tenantId, c.env);

  const customer = await tenantDb
    .prepare("SELECT * FROM customers WHERE email = ?")
    .bind(lowerEmail)
    .first<any>();

  if (!customer || !customer.hashedPassword) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const valid = await authService.comparePassword(password, customer.hashedPassword);
  if (!valid) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const tokens = await authService.generateTokens(
    {
      userId: customer.customerId,
      email: lowerEmail,
      role: "customer",
      tenantId,
      type: "customer",
    },
    controlDb,
    c.env
  );

  setCookie(c, "basecart_customer_token", tokens.accessToken, getCustomerCookieOptions(c, 15 * 60));
  setCookie(c, "basecart_customer_refresh_token", tokens.refreshToken, getCustomerCookieOptions(c, 7 * 24 * 60 * 60));

  return c.json({
    customerId: customer.customerId,
    name: customer.name,
    email: lowerEmail,
    ...tokens,
  });
});

/**
 * Get Current Customer Profile (Future cacheable by session token)
 */
app.get("/auth/customer/me", resolveStorefrontTenant, authenticateCustomer, async (c) => {
  const tenantId = c.get("tenantId")!;
  const user = c.get("user")!;

  const tenantDb = await getTenantDb(tenantId, c.env);
  const customer = await tenantDb
    .prepare("SELECT name FROM customers WHERE customerId = ?")
    .bind(user.userId)
    .first<{ name: string }>();

  if (!customer) {
    return c.json({ error: "Customer not found" }, 404);
  }

  const controlDb = getControlDb(c.env);
  const tokens = await authService.generateTokens(
    {
      userId: user.userId,
      email: user.email,
      role: "customer",
      tenantId,
      type: "customer",
    },
    controlDb,
    c.env
  );

  return c.json({
    customerId: user.userId,
    email: user.email,
    role: "customer",
    name: customer.name,
    accessToken: tokens.accessToken,
  });
});

/**
 * Customer Logout
 */
app.post("/auth/customer/logout", resolveStorefrontTenant, async (c) => {
  deleteCookie(c, "basecart_customer_token", getCustomerDeleteOptions(c));
  deleteCookie(c, "basecart_customer_refresh_token", getCustomerDeleteOptions(c));
  return c.json({ message: "Logged out successfully" });
});

/**
 * Customer Forgot Password
 */
app.post("/auth/customer/forgot-password", resolveStorefrontTenant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const body = await c.req.json().catch(() => ({}));
  const { email } = body;

  if (!email) {
    return c.json({ error: "Email is required" }, 400);
  }
  const lowerEmail = email.toLowerCase();

  const tenantDb = await getTenantDb(tenantId, c.env);
  const customer = await tenantDb
    .prepare("SELECT customerId FROM customers WHERE email = ?")
    .bind(lowerEmail)
    .first<{ customerId: string }>();

  if (customer) {
    const controlDb = getControlDb(c.env);

    // Delete any existing reset tokens for this customer first
    await controlDb
      .prepare("DELETE FROM reset_tokens WHERE email = ? AND tenantId = ?")
      .bind(lowerEmail, tenantId)
      .run();

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
    const ttl = Math.floor(Date.now() / 1000) + 10 * 60;

    await controlDb
      .prepare(
        "INSERT INTO reset_tokens (token, email, tenantId, expiresAt, ttl) VALUES (?, ?, ?, ?, ?)"
      )
      .bind(token, lowerEmail, tenantId, expiresAt, ttl)
      .run();

    const tenant = c.get("tenant");
    const subdomain = tenant?.subdomain || "demo";
    const resetLink = `https://${subdomain}.basecart.app/reset-password?token=${token}`;

    await sendEmailSafely(
      {
        type: "password-reset",
        to: lowerEmail,
        data: {
          resetLink,
          expiresMinutes: 10,
          storeName: tenant?.storeName || subdomain,
        },
      },
      c.env
    );
  }

  return c.json({ message: "If the email is registered, a password reset link has been sent." });
});

/**
 * Customer Reset Password
 */
app.post("/auth/customer/reset-password", resolveStorefrontTenant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const body = await c.req.json().catch(() => ({}));
  const { token, newPassword } = body;

  if (!token || !newPassword || newPassword.length < 6) {
    return c.json({ error: "Token and password (min 6 chars) are required" }, 400);
  }

  const controlDb = getControlDb(c.env);
  const resetToken = await controlDb
    .prepare("SELECT * FROM reset_tokens WHERE token = ?")
    .bind(token)
    .first<any>();

  if (!resetToken || resetToken.tenantId !== tenantId) {
    return c.json({ error: "Invalid or expired reset token" }, 400);
  }

  if (new Date(resetToken.expiresAt) < new Date()) {
    // Delete expired token immediately
    await controlDb
      .prepare("DELETE FROM reset_tokens WHERE token = ?")
      .bind(token)
      .run();
    return c.json({ error: "Reset token has expired (tokens are valid for 10 minutes)" }, 400);
  }

  const tenantDb = await getTenantDb(tenantId, c.env);
  const customer = await tenantDb
    .prepare("SELECT customerId, hashedPassword FROM customers WHERE email = ?")
    .bind(resetToken.email)
    .first<{ customerId: string; hashedPassword?: string }>();

  if (!customer) {
    return c.json({ error: "Customer profile not found" }, 400);
  }

  // Prevent reusing previous password
  if (customer.hashedPassword) {
    const isSamePassword = await authService.comparePassword(newPassword, customer.hashedPassword);
    if (isSamePassword) {
      return c.json({ error: "New password cannot be the same as your previous password. Please choose a different password." }, 400);
    }
  }

  const hashedPassword = await authService.hashPassword(newPassword);

  // Update customer password in tenant DB
  await tenantDb
    .prepare("UPDATE customers SET hashedPassword = ? WHERE customerId = ?")
    .bind(hashedPassword, customer.customerId)
    .run();

  // Invalidate sessions and delete ALL reset tokens for this customer in control DB
  const deleteSessions = controlDb
    .prepare("DELETE FROM refresh_tokens WHERE tenantId = ? AND email = ?")
    .bind(tenantId, resetToken.email);

  const deleteToken = controlDb
    .prepare("DELETE FROM reset_tokens WHERE email = ? AND tenantId = ?")
    .bind(resetToken.email, tenantId);

  await controlDb.batch([deleteSessions, deleteToken]);

  return c.json({ message: "Password has been successfully reset" });
});

export default app;
