import { Context } from "hono";

export interface AnalyticsEvent {
  eventType: "SIGNUP_COMPLETED" | "ORDER_PLACED" | "PAYMENT_VERIFIED" | "WHATSAPP_REDIRECT" | "STORE_VISIT";
  tenantId?: string;
  amount?: number;
  currency?: string;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Emits non-blocking event telemetry to Cloudflare Workers Analytics Engine.
 */
export function recordAnalyticsEvent(c: Context, event: AnalyticsEvent): void {
  try {
    const dataset = c.env?.STORE_ANALYTICS;
    if (!dataset || typeof dataset.writeDataPoint !== "function") {
      // Graceful fallback for local dev & test environments
      if (process.env.NODE_ENV !== "test") {
        console.log(`[Analytics Engine Log] Event: ${event.eventType} | Tenant: ${event.tenantId || "system"} | Amount: ${event.amount || 0}`);
      }
      return;
    }

    dataset.writeDataPoint({
      blobs: [
        event.eventType,
        event.tenantId || "system",
        event.currency || "INR",
        JSON.stringify(event.metadata || {}),
      ],
      doubles: [
        event.amount || 0,
        Date.now(),
      ],
      indexes: [
        event.tenantId || "system",
      ],
    });
  } catch (error) {
    console.error("[Analytics Engine] Non-fatal telemetry log error:", error);
  }
}
