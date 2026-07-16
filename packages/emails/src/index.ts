import { EmailPayload } from "./types";

export * from "./types";
export { renderEmail } from "./renderer";
export { getEmailProvider } from "./services/provider";
export { ZeptoMailProvider } from "./services/zeptomail";

/**
 * Main email client entry point.
 * Pushes email payloads to the Cloudflare Queue (JOBS_QUEUE).
 * Falls back to synchronous sending in development if JOBS_QUEUE is missing.
 */
export async function sendEmail(
  payload: EmailPayload,
  env: any
): Promise<void> {
  console.log(`✉️ [Email Client] Scheduling email to: ${payload.to} | Template: ${payload.type}`);

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
        payload.data.attachments
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
