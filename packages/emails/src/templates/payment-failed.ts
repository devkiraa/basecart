import { DefaultLayout } from "../layouts/default";
import { Text } from "../components/Text";
import { Button } from "../components/Button";
import { Divider } from "../components/Divider";
import { Alert } from "../components/Alert";

export function renderPaymentFailed({
  invoiceNumber,
  amount,
  retryUrl,
  storeName = "Basecart",
  colorPrimary,
  logoUrl,
  emailSignature,
}: {
  invoiceNumber?: string;
  amount: number;
  retryUrl: string;
  storeName?: string;
  colorPrimary?: string;
  logoUrl?: string;
  emailSignature?: string;
}) {
  const subject = "Payment Processing Failed";

  const body = `
    ${Text({
      content: "Hello,",
      fontWeight: "600",
      fontSize: "16px",
    })}
    ${Alert({
      message: "Important: We were unable to process your payment. To prevent store disruption, please update your payment details or retry processing your invoice.",
      type: "error",
    })}
    
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; margin-top: 20px; margin-bottom: 20px;">
      <tr>
        <td style="padding: 16px;">
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
            ${
              invoiceNumber
                ? `
            <tr>
              <td style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #475569; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0;">Invoice Number</td>
              <td align="right" style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #1E293B; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0;">${invoiceNumber}</td>
            </tr>
            `
                : ""
            }
            <tr>
              <td style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #475569; padding-top: 8px;">Attempted Amount</td>
              <td align="right" style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 800; color: #DC2626; padding-top: 8px;">₹${amount}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${Text({
      content: "Please click the button below to update your billing details and complete payment processing:",
    })}
    ${Button({ text: "Update Payment Method", url: retryUrl, primaryColor: colorPrimary })}

    ${Divider()}
    ${Text({
      content: "If you have any questions or require billing assistance, please open a support ticket from your Basecart dashboard.",
      fontSize: "12px",
      color: "#64748B",
    })}
  `;

  const html = DefaultLayout({ title: subject, body, storeName, colorPrimary, logoUrl, emailSignature });
  const text = `
Hello,

Important: We were unable to process your payment. To prevent store disruption, please update your payment details or retry processing your invoice.

${invoiceNumber ? `Invoice Number: ${invoiceNumber}` : ""}
Attempted Amount: ₹${amount}

Please update your billing details and complete payment processing at: ${retryUrl}

If you have any questions or require billing assistance, please open a support ticket from your Basecart dashboard.

This is an automated billing alert from ${storeName}.
  `.trim();

  return { subject, html, text };
}
