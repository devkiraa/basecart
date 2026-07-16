import { EmailProvider, EmailAttachment, EmailResponse } from "../types";

export class ZeptoMailProvider implements EmailProvider {
  private apiUrl: string;
  private token: string;
  private fromAddress: string;
  private fromName: string;

  constructor(env: any) {
    this.apiUrl = env?.ZEPTOMAIL_API_URL || "";
    this.token = env?.ZEPTOMAIL_TOKEN || "";
    this.fromAddress = env?.MAIL_FROM_ADDRESS || "noreply@basecart.app";
    this.fromName = env?.MAIL_FROM_NAME || "Basecart";

    // Fallback/log warning if bindings are missing
    if (!this.apiUrl || !this.token) {
      console.warn("⚠️ ZeptoMail Provider is missing ZEPTOMAIL_API_URL or ZEPTOMAIL_TOKEN. Emails will log only.");
    }
  }

  async send(
    to: string,
    subject: string,
    html: string,
    text: string,
    attachments?: EmailAttachment[],
    from?: { address?: string; name?: string }
  ): Promise<EmailResponse> {
    if (!this.apiUrl || !this.token) {
      console.log(`[Mock Send] To: ${to} | Subject: ${subject}`);
      return {
        success: true,
        messageId: "mock_message_id_" + Math.random().toString(36).substring(7),
      };
    }

    const fromAddress = from?.address || this.fromAddress;
    const fromName = from?.name || this.fromName;

    const payload: any = {
      from: {
        address: fromAddress,
        name: fromName,
      },
      to: [
        {
          email_address: {
            address: to,
          },
        },
      ],
      subject,
      htmlbody: html,
      textbody: text,
    };

    if (attachments && attachments.length > 0) {
      payload.attachments = attachments.map((att) => {
        // Detect MIME type based on file extension
        let mimeType = "application/octet-stream";
        if (att.filename.endsWith(".pdf")) mimeType = "application/pdf";
        else if (att.filename.endsWith(".png")) mimeType = "image/png";
        else if (att.filename.endsWith(".jpg") || att.filename.endsWith(".jpeg")) mimeType = "image/jpeg";
        else if (att.filename.endsWith(".csv")) mimeType = "text/csv";

        return {
          content: att.content,
          mime_type: mimeType,
          name: att.filename,
        };
      });
    }

    const maxAttempts = 3;
    let delay = 1000; // start with 1 second delay

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`✉️ Dispatched email to ${to} via ZeptoMail API. Attempt ${attempt}/${maxAttempts}`);
        
        const res = await fetch(this.apiUrl, {
          method: "POST",
          headers: {
            "Authorization": this.token.startsWith("Main ") ? this.token : `Main ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json() as any;
          return {
            success: true,
            messageId: data.data?.[0]?.message_id || data.message_id || "zeptomail_success",
          };
        }

        const errText = await res.text();
        console.error(`❌ ZeptoMail API returned error (Attempt ${attempt}/${maxAttempts}): ${res.statusText} - ${errText}`);
        
        // If it's a client error (e.g. 400 Bad Request, 401 Unauthorized), do not retry
        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          return {
            success: false,
            error: `Client error: ${res.statusText} (${errText})`,
          };
        }
      } catch (err: any) {
        console.error(`❌ Request failed to ZeptoMail API (Attempt ${attempt}/${maxAttempts}):`, err);
      }

      if (attempt < maxAttempts) {
        console.log(`⏳ Sleeping ${delay}ms before next retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
      }
    }

    return {
      success: false,
      error: `Failed sending email after ${maxAttempts} attempts.`,
    };
  }
}
