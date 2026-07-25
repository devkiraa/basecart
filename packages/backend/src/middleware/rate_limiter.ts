import { Context, Next } from "hono";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryRateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Auth Endpoint Rate Limiter Middleware (G2, G3 Requirements)
 * Enforces max 10 auth requests per minute per IP address.
 */
export async function authRateLimiterMiddleware(c: Context, next: Next) {
  const ip = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "127.0.0.1";
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 10; // Max 10 attempts per minute

  const key = `auth_ratelimit_${ip}`;
  const record = memoryRateLimitStore.get(key);

  if (record && record.resetAt > now) {
    if (record.count >= maxRequests) {
      const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
      c.header("Retry-After", String(retryAfterSec));
      return c.json(
        {
          error: "Too Many Requests",
          message: `Too many authentication attempts. Please try again after ${retryAfterSec} seconds.`,
        },
        429
      );
    }
    record.count += 1;
  } else {
    memoryRateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
  }

  // Periodic cleanup of stale memory entries
  if (memoryRateLimitStore.size > 5000) {
    for (const [k, v] of memoryRateLimitStore.entries()) {
      if (v.resetAt <= now) {
        memoryRateLimitStore.delete(k);
      }
    }
  }

  await next();
}
