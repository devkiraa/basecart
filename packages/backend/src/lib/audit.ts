import { Context } from "hono";
import { logger, sanitizeLogData } from "./logger";

export function sanitizeLogPII(text: string): string {
  return sanitizeLogData(text);
}

export function logReservedSubdomainAbuse(c: Context, attemptedSlug: string) {
  const meta = {
    event: "RESERVED_SUBDOMAIN_ABUSE",
    attemptedSlug,
    route: c.req.path,
  };
  logger.warn("Reserved subdomain abuse attempt detected", meta, c);
}

export function logSecurityAudit(c: Context, event: string, details: Record<string, any> = {}) {
  const meta = {
    event,
    ...details,
  };
  logger.info(`Security Audit: ${event}`, meta, c);
}
