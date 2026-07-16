import { DefaultLayout } from "../layouts/default";
import { Text } from "../components/Text";
import { Button } from "../components/Button";
import { Divider } from "../components/Divider";

export function renderInvoice({
  invoiceNumber,
  billingMonth,
  amount,
  paymentDueDate,
  downloadUrl,
  storeName = "Basecart",
}: {
  invoiceNumber: string;
  billingMonth: string;
  amount: number;
  paymentDueDate?: string;
  downloadUrl?: string;
  storeName?: string;
}) {
  const subject = `Your Basecart Invoice: ${invoiceNumber}`;

  const body = `
    ${Text({
      content: "Hello,",
      fontWeight: "600",
      fontSize: "16px",
    })}
    ${Text({
      content: `Your monthly statement for **${billingMonth}** is now available. Details for invoice **${invoiceNumber}** are listed below:`,
    })}

    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; margin-top: 20px; margin-bottom: 20px;">
      <tr>
        <td style="padding: 16px;">
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
            <tr>
              <td style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #475569; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0;">Invoice Number</td>
              <td align="right" style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #1E293B; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0;">${invoiceNumber}</td>
            </tr>
            <tr>
              <td style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #475569; padding-top: 8px; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0;">Billing Period</td>
              <td align="right" style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #1E293B; padding-top: 8px; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0;">${billingMonth}</td>
            </tr>
            ${
              paymentDueDate
                ? `
            <tr>
              <td style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #475569; padding-top: 8px; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0;">Payment Due Date</td>
              <td align="right" style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #DC2626; padding-top: 8px; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0;">${paymentDueDate}</td>
            </tr>
            `
                : ""
            }
            <tr>
              <td style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #475569; padding-top: 8px;">Total Invoice Amount</td>
              <td align="right" style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 800; color: #1E293B; padding-top: 8px;">₹${amount}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${
      downloadUrl
        ? `
      ${Text({
        content: "You can download the full PDF format statement details using the link below:",
      })}
      ${Button({ text: "Download Invoice PDF", url: downloadUrl })}
    `
        : ""
    }
    
    ${Divider()}
    ${Text({
      content: "This is an automatically generated billing invoice. Please visit the Basecart console to update your payment profile.",
      fontSize: "12px",
      color: "#64748B",
    })}
  `;

  const html = DefaultLayout({ title: subject, body, storeName });
  const text = `
Hello,

Your monthly statement for ${billingMonth} is now available. Details for invoice ${invoiceNumber} are listed below:

Invoice Number: ${invoiceNumber}
Billing Period: ${billingMonth}
${paymentDueDate ? `Payment Due Date: ${paymentDueDate}` : ""}
Total Invoice Amount: ₹${amount}

${downloadUrl ? `Download Invoice PDF: ${downloadUrl}` : ""}

This is an automatically generated billing invoice. Please visit the Basecart console to update your payment profile.

This is an automated billing email from ${storeName}.
  `.trim();

  return { subject, html, text };
}
