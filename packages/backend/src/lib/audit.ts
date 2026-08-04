import { Context } from "hono";

export function sanitizeLogPII(text: string): string {
  if (!text || typeof text !== "string") return text;
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED_EMAIL]")
    .replace(/"password"\s*:\s*"[^"]+"/gi, '"password":"[REDACTED]"')
    .replace(/"secret"\s*:\s*"[^"]+"/gi, '"secret":"[REDACTED]"')
    .replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{1,7}\b/g, "[REDACTED_CARD]");
}

export function logReservedSubdomainAbuse(c: Context, attemptedSlug: string) {
  const logData = {
    event: "RESERVED_SUBDOMAIN_ABUSE",
    timestamp: new Date().toISOString(),
    ip: c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "unknown",
    userId: c.get("user")?.userId || "anonymous",
    attemptedSlug,
    route: c.req.path,
  };
  console.warn(`[RESERVED_SUBDOMAIN_ABUSE] ${sanitizeLogPII(JSON.stringify(logData))}`);
}
