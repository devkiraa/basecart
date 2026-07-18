import { Context } from "hono";

export function logReservedSubdomainAbuse(c: Context, attemptedSlug: string) {
  const logData = {
    event: "RESERVED_SUBDOMAIN_ABUSE",
    timestamp: new Date().toISOString(),
    ip: c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "unknown",
    userId: c.get("user")?.userId || "anonymous",
    attemptedSlug,
    route: c.req.path,
  };
  console.warn(`[RESERVED_SUBDOMAIN_ABUSE] ${JSON.stringify(logData)}`);
}
