import { EmailPayload, EmailType } from "./types";

export * from "./types";
export { renderEmail } from "./renderer";
export { getEmailProvider } from "./services/provider";
export { ZeptoMailProvider } from "./services/zeptomail";

/**
 * Resolves the sender address and name based on email type and environment variables.
 */
export function resolveSender(type: EmailType, env: any) {
  let address = env?.MAIL_FROM_ADDRESS || "noreply@basecart.app";
  let name = env?.MAIL_FROM_NAME || "Basecart";

  // Check if EMAIL_ALIASES JSON configuration exists
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
      // 1. Check specific template type match (e.g. otp, welcome, etc.)
      const templateAlias = aliases[type];
      if (templateAlias && typeof templateAlias === "object") {
        if (templateAlias.address) address = templateAlias.address;
        if (templateAlias.name) name = templateAlias.name;
      } else if (aliases.default && typeof aliases.default === "object") {
        // 2. Check default fallback in JSON
        if (aliases.default.address) address = aliases.default.address;
        if (aliases.default.name) name = aliases.default.name;
      }
    }
  } else {
    // Fall back to separate environment variables
    switch (type) {
      case "otp":
        if (env?.MAIL_FROM_OTP) address = env.MAIL_FROM_OTP;
        if (env?.MAIL_FROM_OTP_NAME) name = env.MAIL_FROM_OTP_NAME;
        break;
      case "welcome":
        if (env?.MAIL_FROM_WELCOME) address = env.MAIL_FROM_WELCOME;
        if (env?.MAIL_FROM_WELCOME_NAME) name = env.MAIL_FROM_WELCOME_NAME;
        break;
      case "password-reset":
        if (env?.MAIL_FROM_SECURITY) address = env.MAIL_FROM_SECURITY;
        if (env?.MAIL_FROM_SECURITY_NAME) name = env.MAIL_FROM_SECURITY_NAME;
        break;
      case "order-confirmation":
      case "order-shipped":
      case "invoice":
        if (env?.MAIL_FROM_ORDERS) address = env.MAIL_FROM_ORDERS;
        if (env?.MAIL_FROM_ORDERS_NAME) name = env.MAIL_FROM_ORDERS_NAME;
        break;
      case "payment-failed":
      case "subscription":
        if (env?.MAIL_FROM_BILLING) address = env.MAIL_FROM_BILLING;
        if (env?.MAIL_FROM_BILLING_NAME) name = env.MAIL_FROM_BILLING_NAME;
        break;
      case "team-invite":
        if (env?.MAIL_FROM_NOREPLY) address = env.MAIL_FROM_NOREPLY;
        if (env?.MAIL_FROM_NOREPLY_NAME) name = env.MAIL_FROM_NOREPLY_NAME;
        break;
    }
  }

  return { address, name };
}

/**
 * Main email client entry point.
 * Pushes email payloads to the Cloudflare Queue (JOBS_QUEUE).
 * Falls back to synchronous sending in development if JOBS_QUEUE is missing.
 */
export async function sendEmail(
  payload: EmailPayload,
  env: any
): Promise<void> {
  // Resolve/Merge default and override sender info
  const defaultSender = resolveSender(payload.type, env);
  const resolvedFrom = {
    address: payload.from?.address || defaultSender.address,
    name: payload.from?.name || defaultSender.name,
  };
  payload.from = resolvedFrom;

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
