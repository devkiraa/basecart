import { Hono } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import { getControlDb, getTenantDb } from "../lib/db";
import { authService } from "../services/auth";
import { getTenantBySubdomain, provisionTenantDatabase, createD1Database } from "../services/tenant";
import { sendEmail } from "../services/email";
import {
  MerchantSignupSchema,
  MerchantLoginSchema,
  CustomerSignupSchema,
  CustomerLoginSchema,
} from "@basecart/shared";
import { authenticateMerchant, authenticateCustomer, resolveStorefrontTenant } from "../middleware/auth";

const app = new Hono();

function getMerchantCookieOptions(c: any, maxAge: number) {
  const isProdOrStaging = c.env && (c.env.NODE_ENV === "production" || c.env.NODE_ENV === "staging");
  return {
    path: "/",
    httpOnly: true,
    secure: isProdOrStaging,
    sameSite: isProdOrStaging ? ("None" as const) : ("Lax" as const),
    maxAge,
  };
}

function getMerchantDeleteOptions(c: any) {
  return {
    path: "/",
  };
}

function getCustomerCookieOptions(c: any, maxAge: number) {
  const isProdOrStaging = c.env && (c.env.NODE_ENV === "production" || c.env.NODE_ENV === "staging");
  return {
    path: "/",
    httpOnly: true,
    secure: isProdOrStaging,
    sameSite: isProdOrStaging ? ("None" as const) : ("Lax" as const),
    maxAge,
  };
}

function getCustomerDeleteOptions(c: any) {
  return {
    path: "/",
  };
}

// --- Helper: Send verification/reset emails safely ---
async function sendEmailSafely(to: string, subject: string, htmlContent: string, env: any) {
  try {
    await sendEmail(to, subject, htmlContent, env);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
  }
}

// -------------------------------------------------------------
// 1. Merchant Auth Endpoints
// -------------------------------------------------------------

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

  const { email, password, storeName, subdomain } = parseResult.data;
  const lowerEmail = email.toLowerCase();
  const lowerSubdomain = subdomain.toLowerCase();

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

  // 4. Provision the dynamic D1/Durable Object database
  const databaseId = await createD1Database(tenantId, c.env);

  // 5. Save registry details in the control database
  const tStmt = controlDb
    .prepare(
      "INSERT INTO tenants (tenantId, storeName, subdomain, plan, status, createdAt, razorpayKeyId, razorpaySecret, customDomain, addOns, branding) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(tenantId, storeName, lowerSubdomain, "starter", "active", createdAt, null, null, null, "[]", "{}");

  const uStmt = controlDb
    .prepare(
      "INSERT INTO merchant_users (email, tenantId, userId, hashedPassword, role, emailVerified, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(lowerEmail, tenantId, userId, hashedPassword, "owner", 0, createdAt);

  await controlDb.batch([tStmt, uStmt]);

  // 6. Run migrations & seed default configuration inside the tenant database
  await provisionTenantDatabase(tenantId, storeName, c.env);

  // 7. Create email verification token
  const verificationToken = crypto.randomUUID();
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const verificationTtl = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

  await controlDb
    .prepare(
      "INSERT INTO verification_tokens (token, email, tenantId, expiresAt, ttl) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(verificationToken, lowerEmail, tenantId, verificationExpiry, verificationTtl)
    .run();

  const verifyLink = `${c.req.url.split("/auth")[0]}/auth/merchant/verify-email?token=${verificationToken}`;
  await sendEmailSafely(
    lowerEmail,
    "Verify Your Basecart Store Account",
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2563EB;">Welcome to Basecart!</h2>
        <p>Thank you for signing up for ${storeName}. Please click the button below to verify your email address and unlock complete account access:</p>
        <div style="margin: 24px 0;">
          <a href="${verifyLink}" style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p style="font-size: 12px; color: #64748B;">This verification link will expire in 24 hours.</p>
      </div>
    `,
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
    controlDb
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
    controlDb
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
    const tokens = await authService.refreshSession(refreshToken, tenantId, controlDb);

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
    controlDb
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
 * Merchant Logout
 */
app.post("/auth/merchant/logout", async (c) => {
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
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const ttl = Math.floor(Date.now() / 1000) + 30 * 60;

    await controlDb
      .prepare(
        "INSERT INTO reset_tokens (token, email, tenantId, expiresAt, ttl) VALUES (?, ?, ?, ?, ?)"
      )
      .bind(token, lowerEmail, user.tenantId, expiresAt, ttl)
      .run();

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    await sendEmailSafely(
      lowerEmail,
      "Reset Your Basecart Password",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2>Reset Your Password</h2>
          <p>You requested a password reset for your Basecart store account. Click the link below to set a new password:</p>
          <div style="margin: 24px 0;">
            <a href="${resetLink}" style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #64748B;">This password reset link will expire in 30 minutes. If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
      c.env
    );
  }

  return c.json({ message: "If the email is registered, a password reset link has been sent." });
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
    return c.json({ error: "Reset token has expired" }, 400);
  }

  const hashedPassword = await authService.hashPassword(newPassword);

  // Update password and invalidate reset token & sessions in control DB
  const updatePass = controlDb
    .prepare("UPDATE merchant_users SET hashedPassword = ? WHERE email = ? AND tenantId = ?")
    .bind(hashedPassword, resetToken.email, resetToken.tenantId);

  const deleteSession = controlDb
    .prepare("DELETE FROM refresh_tokens WHERE tenantId = ? AND email = ?")
    .bind(resetToken.tenantId, resetToken.email);

  const deleteToken = controlDb
    .prepare("DELETE FROM reset_tokens WHERE token = ?")
    .bind(token);

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
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const verificationTtl = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

  await controlDb
    .prepare(
      "INSERT INTO verification_tokens (token, email, tenantId, expiresAt, ttl) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(verificationToken, email, tenantId, verificationExpiry, verificationTtl)
    .run();

  const verifyLink = `${c.req.url.split("/auth")[0]}/auth/merchant/verify-email?token=${verificationToken}`;
  await sendEmailSafely(
    email,
    "Verify Your Basecart Store Account",
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2563EB;">Verify Your Basecart Email</h2>
        <p>Please click the button below to verify your email address:</p>
        <div style="margin: 24px 0;">
          <a href="${verifyLink}" style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p style="font-size: 12px; color: #64748B;">This verification link will expire in 24 hours.</p>
      </div>
    `,
    c.env
  );

  return c.json({ message: "Verification email resent successfully" });
});

/**
 * Verify Email
 */
app.get("/auth/merchant/verify-email", async (c) => {
  const token = c.req.query("token");
  if (!token) {
    return c.json({ error: "Token is required" }, 400);
  }

  const controlDb = getControlDb(c.env);
  const tokenItem = await controlDb
    .prepare("SELECT * FROM verification_tokens WHERE token = ?")
    .bind(token)
    .first<any>();

  if (!tokenItem) {
    return c.json({ error: "Invalid or expired token" }, 400);
  }

  if (new Date(tokenItem.expiresAt) < new Date()) {
    return c.json({ error: "Token has expired" }, 400);
  }

  // Update merchant user emailVerified status and delete the verification token
  const updateVerify = controlDb
    .prepare("UPDATE merchant_users SET emailVerified = 1 WHERE email = ? AND tenantId = ?")
    .bind(tokenItem.email, tokenItem.tenantId);

  const deleteToken = controlDb
    .prepare("DELETE FROM verification_tokens WHERE token = ?")
    .bind(token);

  await controlDb.batch([updateVerify, deleteToken]);

  return c.redirect("http://localhost:3000/?verified=true");
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
  if (plan === "starter") {
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
    controlDb
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
  if (plan === "starter") {
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
    controlDb
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
    controlDb
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
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const ttl = Math.floor(Date.now() / 1000) + 30 * 60;

    const controlDb = getControlDb(c.env);
    await controlDb
      .prepare(
        "INSERT INTO reset_tokens (token, email, tenantId, expiresAt, ttl) VALUES (?, ?, ?, ?, ?)"
      )
      .bind(token, lowerEmail, tenantId, expiresAt, ttl)
      .run();

    const tenant = c.get("tenant");
    const subdomain = tenant?.subdomain || "demo";
    const resetLink = `http://${subdomain}.localhost:3002/reset-password?token=${token}`;

    await sendEmailSafely(
      lowerEmail,
      "Reset Your Storefront Password",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2>Reset Your Storefront Password</h2>
          <p>You requested a password reset for your account. Click the link below to set a new password:</p>
          <div style="margin: 24px 0;">
            <a href="${resetLink}" style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #64748B;">This password reset link will expire in 30 minutes.</p>
        </div>
      `,
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
    return c.json({ error: "Reset token has expired" }, 400);
  }

  const tenantDb = await getTenantDb(tenantId, c.env);
  const customer = await tenantDb
    .prepare("SELECT customerId FROM customers WHERE email = ?")
    .bind(resetToken.email)
    .first<{ customerId: string }>();

  if (!customer) {
    return c.json({ error: "Customer profile not found" }, 400);
  }

  const hashedPassword = await authService.hashPassword(newPassword);

  // Update customer password in tenant DB
  await tenantDb
    .prepare("UPDATE customers SET hashedPassword = ? WHERE customerId = ?")
    .bind(hashedPassword, customer.customerId)
    .run();

  // Invalidate sessions and cleanup reset token in control DB
  const deleteSessions = controlDb
    .prepare("DELETE FROM refresh_tokens WHERE tenantId = ? AND email = ?")
    .bind(tenantId, resetToken.email);

  const deleteToken = controlDb
    .prepare("DELETE FROM reset_tokens WHERE token = ?")
    .bind(token);

  await controlDb.batch([deleteSessions, deleteToken]);

  return c.json({ message: "Password has been successfully reset" });
});

export default app;
