import { EmailPayload, EmailType } from "./types";

export * from "./types";
export { renderEmail } from "./renderer";
export { getEmailProvider } from "./services/provider";
export { ZeptoMailProvider } from "./services/zeptomail";

/**
 * Hardcoded platform-level email sender aliases.
 * These are Basecart's own transactional email addresses — never overridden by merchant config.
 * Env variable EMAIL_ALIASES can still override these at runtime if needed.
 */
export const PLATFORM_EMAIL_ALIASES: Record<string, { address: string; name: string }> = {
  default: {
    address: "noreply@basecart.app",
    name: "Basecart",
  },
  otp: {
    address: "otp@basecart.app",
    name: "Basecart Security",
  },
  welcome: {
    address: "welcome@basecart.app",
    name: "Basecart",
  },
  "password-reset": {
    address: "security@basecart.app",
    name: "Basecart Security",
  },
  "order-confirmation": {
    address: "orders@basecart.app",
    name: "Basecart Orders",
  },
  "order-shipped": {
    address: "orders@basecart.app",
    name: "Basecart Orders",
  },
  invoice: {
    address: "billing@basecart.app",
    name: "Basecart Billing",
  },
  "payment-failed": {
    address: "billing@basecart.app",
    name: "Basecart Billing",
  },
  subscription: {
    address: "billing@basecart.app",
    name: "Basecart Billing",
  },
  "team-invite": {
    address: "noreply@basecart.app",
    name: "Basecart",
  },
};

/**
 * Platform-level templates — always sent as Basecart, never rebranded as a merchant store.
 */
export const PLATFORM_ONLY_TEMPLATES: EmailType[] = [
  "otp",
  "welcome",
  "password-reset",
  "team-invite",
  "subscription",
];

/**
 * Resolves the sender address and name for a given email type.
 * Priority: env EMAIL_ALIASES JSON → hardcoded PLATFORM_EMAIL_ALIASES → fallback defaults.
 */
export function resolveSender(type: EmailType, env: any): { address: string; name: string } {
  // Start with hardcoded platform defaults
  const hardcoded = PLATFORM_EMAIL_ALIASES[type] || PLATFORM_EMAIL_ALIASES.default;
  let address = hardcoded.address;
  let name = hardcoded.name;

  // Allow runtime override via EMAIL_ALIASES env variable (optional)
  if (env?.EMAIL_ALIASES) {
    let aliases: any = env.EMAIL_ALIASES;
    if (typeof aliases === "string") {
      try {
        aliases = JSON.parse(aliases);
      } catch (e) {
        console.error("Failed to parse EMAIL_ALIASES JSON string:", e);
      }
    }

    if (aliases && typeof aliases === "object") {
      const templateAlias = aliases[type];
      if (templateAlias?.address) address = templateAlias.address;
      if (templateAlias?.name) name = templateAlias.name;
    }
  }

  return { address, name };
}

/**
 * Main email client entry point.
 * Pushes email payloads to the Cloudflare Queue (JOBS_QUEUE).
 * Falls back to synchronous sending if JOBS_QUEUE is missing.
 *
 * For platform-level templates (OTP, Welcome, Password Reset, etc.), the storeName
 * in the email data is always forced to "Basecart" regardless of what was passed in.
 */
export async function sendEmail(
  payload: EmailPayload,
  env: any
): Promise<void> {
  // Force platform branding on platform-only templates
  if (PLATFORM_ONLY_TEMPLATES.includes(payload.type)) {
    payload.data = {
      ...payload.data,
      storeName: "Basecart",
      colorPrimary: undefined,
      logoUrl: undefined,
      emailSignature: undefined,
    };
  }

  // Resolve sender
  const defaultSender = resolveSender(payload.type, env);
  payload.from = {
    address: payload.from?.address || defaultSender.address,
    name: payload.from?.name || defaultSender.name,
  };

  console.log(`✉️ [Email Client] Scheduling email to: ${payload.to} | Template: ${payload.type} | From: ${payload.from.address} (${payload.from.name})`);

  if (process.env.NODE_ENV === "test") {
    console.log(`✉️ [Email Client] [Test Mode] Bypassing email dispatch.`);
    return;
  }

  const queue = env?.JOBS_QUEUE;
  if (!queue) {
    console.warn("⚠️ env.JOBS_QUEUE is missing. Dispatching email synchronously.");
    try {
      const { renderEmail } = await import("./renderer");
      const { getEmailProvider } = await import("./services/provider");

      const { subject, html, text } = renderEmail(payload.type, payload.data);
      const provider = getEmailProvider(env);
      const res = await provider.send(
        payload.to,
        subject,
        html,
        text,
        payload.data.attachments,
        payload.from
      );
      if (!res.success) {
        console.error(`❌ Synchronous email dispatch failed: ${res.error}`);
      } else {
        console.log(`✅ Synchronous email dispatch completed successfully.`);
      }
    } catch (err) {
      console.error("❌ Synchronous email dispatch crashed:", err);
    }
    return;
  }

  // Serialize and send job to queue
  await queue.send({
    type: "TRANSACTIONAL_EMAIL",
    emailPayload: payload,
  });
}
