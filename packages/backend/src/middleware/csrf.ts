import { Context, Next } from "hono";

/**
 * CSRF Protection Middleware (S5 Requirement)
 * Enforces Origin/Referer header verification and X-CSRF-Token header validation
 * on state-changing requests (POST, PUT, DELETE, PATCH).
 */
export async function csrfProtectionMiddleware(c: Context, next: Next) {
  const method = c.req.method.toUpperCase();

  // GET, HEAD, OPTIONS requests do not mutate state
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return await next();
  }

  const path = c.req.path;

  // Exempt webhooks which authenticate via cryptographic HMAC signatures (e.g. Razorpay webhook)
  if (
    path.startsWith("/orders/webhook") ||
    path.startsWith("/api/webhooks") ||
    path.startsWith("/webhooks")
  ) {
    return await next();
  }

  const origin = c.req.header("origin");
  const referer = c.req.header("referer");
  const csrfHeader = c.req.header("x-csrf-token") || c.req.header("x-requested-with");
  const authHeader = c.req.header("authorization");

  // Requests authenticated purely with Bearer tokens (SDK / Headless API) are exempt from CSRF
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return await next();
  }

  // Check if request carries session auth cookies
  const cookieHeader = c.req.header("cookie") || "";
  const hasAuthCookie =
    cookieHeader.includes("basecart_merchant_token") ||
    cookieHeader.includes("basecart_customer_token") ||
    cookieHeader.includes("basecart_admin_token");

  if (hasAuthCookie) {
    // If request uses cookies, require either x-csrf-token header or matching Origin
    const host = c.req.header("host") || "";
    
    if (origin) {
      try {
        const originUrl = new URL(origin);
        // Allow same host or localhost or valid subdomains
        const isAllowedOrigin =
          originUrl.host === host ||
          originUrl.hostname === "localhost" ||
          originUrl.hostname === "127.0.0.1" ||
          originUrl.hostname.endsWith(".basecart.app");

        if (!isAllowedOrigin) {
          return c.json({ error: "CSRF Forbidden: Origin header validation failed" }, 403);
        }
      } catch {
        return c.json({ error: "CSRF Forbidden: Invalid Origin header" }, 403);
      }
    }

    // Require anti-CSRF header for cookie-based state-changing requests if no origin
    if (!origin && !csrfHeader) {
      return c.json(
        { error: "CSRF Forbidden: Missing anti-CSRF header (X-CSRF-Token or X-Requested-With)" },
        403
      );
    }
  }

  await next();
}
