export type EmailType =
  | "otp"
  | "welcome"
  | "password-reset"
  | "order-confirmation"
  | "order-shipped"
  | "invoice"
  | "payment-failed"
  | "subscription"
  | "team-invite";

export interface EmailAttachment {
  content: string; // Base64 encoded payload
  filename: string;
}

export interface EmailPayload {
  type: EmailType;
  to: string;
  data: Record<string, any> & {
    attachments?: EmailAttachment[];
  };
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailProvider {
  send(
    to: string,
    subject: string,
    html: string,
    text: string,
    attachments?: EmailAttachment[]
  ): Promise<EmailResponse>;
}
