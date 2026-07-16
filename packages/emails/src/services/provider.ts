import { EmailProvider } from "../types";
import { ZeptoMailProvider } from "./zeptomail";

/**
 * Factory function to retrieve the configured email provider.
 * This makes it extremely simple to swap email providers (e.g. Resend, SES, SendGrid) later
 * without altering any template rendering or business logic.
 */
export function getEmailProvider(env: any): EmailProvider {
  return new ZeptoMailProvider(env);
}
