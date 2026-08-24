import { Context, Next } from "hono";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  requestId?: string;
  tenantId?: string;
  userId?: string;
  userType?: string;
  ip?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  durationMs?: number;
  environment?: string;
  meta?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string | number;
  };
}

/**
 * Deeply sanitizes sensitive PII data (emails, passwords, card numbers, secrets, auth headers).
 */
export function sanitizeLogData<T = any>(data: T): T {
  if (data === null || data === undefined) return data;

  if (typeof data === "string") {
    return data
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED_EMAIL]")
      .replace(/"(password|secret|token|authorization|cookie|key_secret|razorpay_secret)"\s*:\s*"[^"]+"/gi, '"$1":"[REDACTED]"')
      .replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{1,7}\b/g, "[REDACTED_CARD]") as any;
  }

  if (typeof data === "object") {
    if (data instanceof Error) {
      return {
        name: data.name,
        message: sanitizeLogData(data.message),
        stack: data.stack ? sanitizeLogData(data.stack) : undefined,
        code: (data as any).code || (data as any).statusCode || (data as any).status,
      } as any;
    }

    if (Array.isArray(data)) {
      return data.map((item) => sanitizeLogData(item)) as any;
    }

    const sanitizedObj: Record<string, any> = {};
    const sensitiveKeys = new Set([
      "password",
      "secret",
      "token",
      "authorization",
      "cookie",
      "key_secret",
      "razorpay_secret",
      "razorpay_signature",
      "x-csrf-token",
      "set-cookie",
      "credit_card",
      "cardnumber",
      "cvv",
    ]);

    for (const [key, value] of Object.entries(data)) {
      if (sensitiveKeys.has(key.toLowerCase())) {
        sanitizedObj[key] = "[REDACTED]";
      } else {
        sanitizedObj[key] = sanitizeLogData(value);
      }
    }
    return sanitizedObj as T;
  }

  return data;
}

/**
 * Core Structured Logger for Cloudflare Workers & Hono API.
 */
class Logger {
  private getMinLogLevel(env?: Record<string, any>): LogLevel {
    const levelStr = (env?.LOG_LEVEL || "info").toLowerCase();
    if (levelStr === "debug") return "debug";
    if (levelStr === "warn") return "warn";
    if (levelStr === "error") return "error";
    return "info";
  }

  private shouldLog(level: LogLevel, env?: Record<string, any>): boolean {
    const priority: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
    const minLevel = this.getMinLogLevel(env);
    return priority[level] >= priority[minLevel];
  }

  public log(level: LogLevel, message: string, meta: Record<string, any> = {}, c?: Context) {
    const env = c?.env;
    if (!this.shouldLog(level, env)) return;

    const reqId = c?.get("requestId") || c?.req?.header("cf-ray") || c?.req?.header("x-request-id");
    const tenantId = c?.get("tenantId") || c?.get("tenant")?.id;
    const user = c?.get("user") || c?.get("merchant") || c?.get("customer");

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message: typeof message === "string" ? sanitizeLogData(message) : message,
      requestId: reqId || undefined,
      tenantId: tenantId || undefined,
      userId: user?.userId || user?.id || undefined,
      userType: user?.userType || (user ? "authenticated" : undefined),
      ip: c ? (c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1") : undefined,
      method: c?.req?.method,
      path: c?.req?.path,
      environment: env?.ENVIRONMENT || env?.NODE_ENV || "development",
      meta: meta && Object.keys(meta).length > 0 ? sanitizeLogData(meta) : undefined,
    };

    const formattedLog = JSON.stringify(entry);

    switch (level) {
      case "debug":
        console.debug(formattedLog);
        break;
      case "info":
        console.log(formattedLog);
        break;
      case "warn":
        console.warn(formattedLog);
        break;
      case "error":
        console.error(formattedLog);
        break;
    }
  }

  public debug(message: string, meta?: Record<string, any>, c?: Context) {
    this.log("debug", message, meta, c);
  }

  public info(message: string, meta?: Record<string, any>, c?: Context) {
    this.log("info", message, meta, c);
  }

  public warn(message: string, meta?: Record<string, any>, c?: Context) {
    this.log("warn", message, meta, c);
  }

  public error(message: string, errOrMeta?: any, c?: Context) {
    let meta: Record<string, any> = {};
    if (errOrMeta instanceof Error) {
      meta.error = sanitizeLogData(errOrMeta);
    } else if (errOrMeta && typeof errOrMeta === "object") {
      meta = errOrMeta;
    }
    this.log("error", message, meta, c);
  }
}

export const logger = new Logger();

/**
 * Advanced HTTP Access & Performance Request Logger Middleware.
 * Generates X-Request-ID, measures response latency, logs status code and request metadata.
 */
export async function requestLoggerMiddleware(c: Context, next: Next) {
  const start = performance.now();
  
  // Extract or generate Correlation / Request ID
  const incomingReqId = c.req.header("x-request-id") || c.req.header("cf-ray");
  const requestId = incomingReqId || `req_${crypto.randomUUID().replace(/-/g, "")}`;
  
  c.set("requestId", requestId);
  c.header("X-Request-ID", requestId);

  await next();

  const durationMs = Math.round((performance.now() - start) * 100) / 100;
  const status = c.res.status;
  const method = c.req.method;
  const path = c.req.path;
  const contentLength = c.res.headers.get("content-length") || undefined;
  const userAgent = c.req.header("user-agent") || undefined;

  const accessLogMeta = {
    method,
    path,
    statusCode: status,
    durationMs,
    contentLength,
    userAgent,
    ip: c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1",
  };

  if (status >= 500) {
    logger.error(`HTTP ${method} ${path} -> ${status} (${durationMs}ms)`, accessLogMeta, c);
  } else if (status >= 400) {
    logger.warn(`HTTP ${method} ${path} -> ${status} (${durationMs}ms)`, accessLogMeta, c);
  } else {
    logger.info(`HTTP ${method} ${path} -> ${status} (${durationMs}ms)`, accessLogMeta, c);
  }
}
