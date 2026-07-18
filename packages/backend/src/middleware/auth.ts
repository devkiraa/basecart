import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { getControlDb } from "../lib/db";
import { authService, TokenPayload } from "../services/auth";
import { getTenantBySubdomain } from "../services/tenant";
import { isReservedSubdomain, isPlatformHost } from "@basecart/shared";

/**
 * Authenticate merchant request
 */
export async function authenticateMerchant(c: Context, next: Next) {
  try {
    let token = getCookie(c, "basecart_merchant_token");
    if (!token) {
      const authHeader = c.req.header("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return c.json({ error: "Unauthorized: Missing token" }, 401);
    }

    const payload = await authService.verifyAccessToken(token, c.env);

    if (payload.type !== "merchant") {
      return c.json({ error: "Forbidden: Not a merchant session" }, 403);
    }

    // Verify store suspension
    const db = getControlDb(c.env);
    const tenantRow = await db
      .prepare("SELECT status FROM tenants WHERE tenantId = ?")
      .bind(payload.tenantId)
      .first<{ status: string }>();

    if (tenantRow?.status === "suspended") {
      return c.json({ error: "Store Suspended: This merchant account has been suspended" }, 403);
    }

    c.set("user", payload);
    c.set("tenantId", payload.tenantId);
    await next();
  } catch (error: any) {
    return c.json({ error: error.message || "Unauthorized" }, 401);
  }
}

/**
 * Authenticate customer request
 */
export async function authenticateCustomer(c: Context, next: Next) {
  try {
    let token = getCookie(c, "basecart_customer_token");
    if (!token) {
      const authHeader = c.req.header("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return c.json({ error: "Unauthorized: Missing token" }, 401);
    }

    const payload = await authService.verifyAccessToken(token, c.env);

    if (payload.type !== "customer") {
      return c.json({ error: "Forbidden: Not a customer session" }, 403);
    }

    c.set("user", payload);
    c.set("tenantId", payload.tenantId);
    await next();
  } catch (error: any) {
    return c.json({ error: error.message || "Unauthorized" }, 401);
  }
}

/**
 * Resolves tenant details based on URL subdomain parameters, Host header, or a custom header
 */
export async function resolveStorefrontTenant(c: Context, next: Next) {
  const host = c.req.header("host") || "";

  // Avoid database queries for platform hostnames
  if (isPlatformHost(host) && !c.req.param("subdomain")) {
    return c.json({ error: `Store "${host}" not found` }, 404);
  }

  let subdomain = c.req.param("subdomain");

  if (!subdomain) {
    // Attempt to extract from host header
    const parts = host.split(".");
    if (parts.length >= 2) {
      const sub = parts[0];
      // Skip standard root domains or dev domains
      if (
        sub &&
        sub !== "localhost" &&
        sub !== "www" &&
        sub !== "dashboard" &&
        sub !== "storefront"
      ) {
        subdomain = sub;
      }
    }
  }

  if (!subdomain) {
    // Fallback check: Custom header for easy API/integration testing
    subdomain = c.req.header("x-subdomain");
  }

  if (!subdomain) {
    return c.json({ error: "Bad Request: Subdomain is required" }, 400);
  }

  if (isReservedSubdomain(subdomain) || isPlatformHost(`${subdomain}.basecart.app`)) {
    return c.json({ error: `Store "${subdomain}" not found` }, 404);
  }

  const tenant = await getTenantBySubdomain(subdomain, c.env);
  if (!tenant) {
    return c.json({ error: `Store "${subdomain}" not found` }, 404);
  }

  if (tenant.status === "suspended") {
    return c.json({ error: "Store Suspended: This store has been suspended by platform administrators" }, 403);
  }

  c.set("tenantId", tenant.tenantId);
  c.set("tenant", tenant);
  await next();
}
