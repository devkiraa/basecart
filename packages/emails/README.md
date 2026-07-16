# Basecart Transactional Email Module

This package (`@basecart/emails`) houses all transactional email logic, components, layouts, templates, rendering configurations, and provider implementations. It decouples the presentation and composition of emails from the underlying delivery networks (e.g. ZeptoMail, Resend, SES).

---

## Folder Structure

```
packages/emails/
├── dist/               # Compiled JS and type definitions
├── src/
│   ├── components/     # Reusable HTML/CSS components (Button, Card, Alert, etc.)
│   ├── layouts/        # Reusable structures (Default, Minimal)
│   ├── templates/      # Individual email templates (OTP, Welcome, Password Reset, etc.)
│   ├── renderer/       # Template mapping and rendering orchestrator
│   ├── services/       # Email provider implementations (ZeptoMail REST API)
│   ├── types/          # Strong types (EmailType, EmailPayload, EmailProvider)
│   └── index.ts        # Unified public client helper (sendEmail)
├── package.json
└── tsconfig.json
```

---

## Public client: `sendEmail`

All emails in the application are sent using the `sendEmail` helper.

```ts
import { sendEmail } from "@basecart/emails";

await sendEmail({
  type: "welcome",
  to: "merchant@example.com",
  data: {
    userName: "John Doe",
    verifyLink: "https://basecart.app/verify?token=abc"
  }
}, env);
```

### Async Queue Routing Flow
1. The client function `sendEmail` pushes the payload to the Cloudflare Queue binding (`env.JOBS_QUEUE`) under the job type `"TRANSACTIONAL_EMAIL"`.
2. The queue consumer in `packages/backend/src/queue.ts` picks up the job asynchronously.
3. The consumer invokes the renderer to produce the HTML and plain-text contents, executes the configured provider, and records the logs into D1 control database `email_logs` table.
4. If `env.JOBS_QUEUE` is missing (e.g., local development fallback), `sendEmail` automatically falls back to synchronous delivery.

---

## How to Add a New Template

To introduce a new email template (e.g. `order-delivered`):

1. **Define Types:** Add the new type string (e.g. `"order-delivered"`) to the `EmailType` union in `src/types/index.ts`.
2. **Create Template:** Create a new template file in `src/templates/order-delivered.ts`:
   ```ts
   import { DefaultLayout } from "../layouts/default";
   import { Text } from "../components/Text";
   import { Button } from "../components/Button";

   export function renderOrderDelivered({ customerName, orderId, feedbackUrl }) {
     const subject = `Your order #${orderId} has been delivered!`;
     const body = `
       ${Text({ content: `Hi ${customerName},` })}
       ${Text({ content: `Your order #${orderId} has been successfully delivered. We hope you love your products!` })}
       ${Button({ text: "Leave Feedback", url: feedbackUrl })}
     `;
     const html = DefaultLayout({ title: subject, body });
     const text = `Hi ${customerName}, your order #${orderId} has been successfully delivered. Leave feedback: ${feedbackUrl}`;
     return { subject, html, text };
   }
   ```
3. **Register in Renderer:** Update `src/renderer/index.ts` to map your new type:
   ```ts
   import { renderOrderDelivered } from "../templates/order-delivered";
   // ...
   case "order-delivered":
     return renderOrderDelivered(data);
   ```
4. **Compile:** Run `npm run build` in this directory to update the distribution folder.

---

## How to Swap Providers

All provider logic is abstracted behind the `EmailProvider` interface defined in `src/types/index.ts`.

To switch from ZeptoMail to another provider (e.g. Resend):

1. **Implement Provider:** Create a new service file (e.g. `src/services/resend.ts`):
   ```ts
   import { EmailProvider, EmailAttachment, EmailResponse } from "../types";

   export class ResendProvider implements EmailProvider {
     private apiKey: string;
     constructor(env: any) {
       this.apiKey = env.RESEND_API_KEY;
     }

     async send(to, subject, html, text, attachments): Promise<EmailResponse> {
       const res = await fetch("https://api.resend.com/emails", {
         method: "POST",
         headers: {
           "Authorization": `Bearer ${this.apiKey}`,
           "Content-Type": "application/json"
         },
         body: JSON.stringify({
           from: "Basecart <noreply@basecart.app>",
           to: [to],
           subject,
           html,
           text,
           attachments
         })
       });
       if (res.ok) {
         const data = await res.json();
         return { success: true, messageId: data.id };
       }
       return { success: false, error: await res.text() };
     }
   }
   ```
2. **Update Provider Factory:** Modify `src/services/provider.ts` to return the new provider:
   ```ts
   import { ResendProvider } from "./resend";

   export function getEmailProvider(env: any): EmailProvider {
     return new ResendProvider(env);
   }
   ```

No changes to business logic or templates are required.
