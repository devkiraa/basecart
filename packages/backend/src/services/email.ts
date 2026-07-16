/**
 * Unified email dispatch service.
 * Connects to Resend in production and logs locally during development/tests.
 */
export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
  env?: any
): Promise<void> {
  console.log(`✉️ [Email Service] Sending to: ${to} | Subject: ${subject}`);

  if (process.env.NODE_ENV === "test") {
    // Suppress actual email dispatches during automated test suites
    return;
  }

  const apiKey = env?.RESEND_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Basecart <noreply@basecart.io>",
          to: [to],
          subject,
          html: htmlContent,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`❌ Resend API failed: ${res.statusText} - ${text}`);
      } else {
        console.log(`✅ Email sent successfully to ${to} via Resend`);
      }
    } catch (error) {
      console.error(`❌ Resend request failed for ${to}:`, error);
    }
  } else {
    console.log(`⚠️ RESEND_API_KEY binding not found. Email log details:`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
  }
}

/**
 * Dispatches an email with attachments (base64 encoded payloads) via Resend.
 */
export async function sendEmailWithAttachment(
  to: string,
  subject: string,
  htmlContent: string,
  attachments: Array<{ content: string; filename: string }>,
  env?: any
): Promise<void> {
  console.log(`✉️ [Email Service] Sending attachment email to: ${to} | Subject: ${subject}`);

  if (process.env.NODE_ENV === "test") {
    return;
  }

  const apiKey = env?.RESEND_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Basecart <noreply@basecart.app>",
          to: [to],
          subject,
          html: htmlContent,
          attachments,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`❌ Resend API attachment dispatch failed: ${res.statusText} - ${text}`);
      } else {
        console.log(`✅ Email with attachment sent successfully to ${to} via Resend`);
      }
    } catch (error) {
      console.error(`❌ Resend request failed for ${to}:`, error);
    }
  } else {
    console.log(`⚠️ RESEND_API_KEY binding not found. Email details (with attachments):`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
  }
}
