import { DefaultLayout } from "../layouts/default";
import { Text } from "../components/Text";
import { Divider } from "../components/Divider";

export function renderOrderConfirmation({
  orderId,
  customerName = "Valued Customer",
  total,
  invoiceNumber,
  storeName = "Basecart",
  colorPrimary,
  logoUrl,
  emailSignature,
}: {
  orderId: string;
  customerName?: string;
  total: number;
  invoiceNumber?: string;
  storeName?: string;
  colorPrimary?: string;
  logoUrl?: string;
  emailSignature?: string;
}) {
  const shortOrderId = orderId.substring(0, 8).toUpperCase();
  const subject = `Order Confirmation - #${shortOrderId}`;

  const body = `
    ${Text({
      content: `Hi ${customerName},`,
      fontWeight: "600",
      fontSize: "16px",
    })}
    ${Text({
      content: "Thank you for shopping with us! Your payment has been successfully processed and your order is now being prepared for shipment. Please review your order confirmation details below:",
    })}
    
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; margin-top: 20px; margin-bottom: 20px;">
      <tr>
        <td style="padding: 16px;">
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
            <tr>
              <td style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #475569; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0;">Order ID</td>
              <td align="right" style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #1E293B; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0;">#${orderId}</td>
            </tr>
            ${
              invoiceNumber
                ? `
            <tr>
              <td style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #475569; padding-top: 8px; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0;">Invoice Number</td>
              <td align="right" style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #1E293B; padding-top: 8px; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0;">${invoiceNumber}</td>
            </tr>
            `
                : ""
            }
            <tr>
              <td style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #475569; padding-top: 8px;">Amount Paid</td>
              <td align="right" style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 800; color: #059669; padding-top: 8px;">₹${total}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${
      invoiceNumber
        ? `
    ${Text({
      content: "For your reference, your official GST tax invoice has been generated and attached as a PDF file to this email.",
      fontSize: "13px",
      color: "#475569",
    })}
    `
        : ""
    }
    
    ${Divider()}
    ${Text({
      content: "You will receive another update as soon as your items have been shipped.",
      fontSize: "12px",
      color: "#64748B",
    })}
  `;

  const html = DefaultLayout({ title: subject, body, storeName, colorPrimary, logoUrl, emailSignature });
  const text = `
Hi ${customerName},

Thank you for shopping with us! Your payment has been successfully processed and your order is now being prepared for shipment. Please review your order confirmation details below:

Order ID: #${orderId}
${invoiceNumber ? `Invoice Number: ${invoiceNumber}` : ""}
Amount Paid: ₹${total}

${invoiceNumber ? "For your reference, your official GST tax invoice has been generated and attached as a PDF file to this email." : ""}

You will receive another update as soon as your items have been shipped.

This is an automated order confirmation email from ${storeName}.
  `.trim();

  return { subject, html, text };
}
