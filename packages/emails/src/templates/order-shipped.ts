import { DefaultLayout } from "../layouts/default";
import { Text } from "../components/Text";
import { Button } from "../components/Button";
import { Divider } from "../components/Divider";

export function renderOrderShipped({
  orderId,
  customerName = "Valued Customer",
  carrier = "our delivery partner",
  trackingNumber = "N/A",
  trackingUrl,
  storeName = "Basecart",
}: {
  orderId: string;
  customerName?: string;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  storeName?: string;
}) {
  const shortOrderId = orderId.substring(0, 8).toUpperCase();
  const subject = `Your order #${shortOrderId} has shipped!`;

  const body = `
    ${Text({
      content: `Hi ${customerName},`,
      fontWeight: "600",
      fontSize: "16px",
    })}
    ${Text({
      content: `Great news! Your order #${shortOrderId} has been shipped via **${carrier}** and is on its way to you.`,
    })}

    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; margin-top: 20px; margin-bottom: 20px;">
      <tr>
        <td style="padding: 16px;">
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
            <tr>
              <td style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #475569; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0;">Shipping Carrier</td>
              <td align="right" style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #1E293B; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0;">${carrier}</td>
            </tr>
            <tr>
              <td style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #475569; padding-top: 8px;">Tracking Number</td>
              <td align="right" style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #1E293B; padding-top: 8px;">${trackingNumber}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${
      trackingUrl
        ? `
      ${Text({
        content: "You can track the shipment status of your order by clicking the button below:",
      })}
      ${Button({ text: "Track Order Status", url: trackingUrl })}
    `
        : ""
    }
    
    ${Divider()}
    ${Text({
      content: "If you have any questions or concerns about your delivery, please reply to this email or visit our support channel.",
      fontSize: "12px",
      color: "#64748B",
    })}
  `;

  const html = DefaultLayout({ title: subject, body, storeName });
  const text = `
Hi ${customerName},

Great news! Your order #${shortOrderId} has been shipped via ${carrier} and is on its way to you.

Carrier: ${carrier}
Tracking Number: ${trackingNumber}
${trackingUrl ? `Track shipment here: ${trackingUrl}` : ""}

If you have any questions or concerns about your delivery, please contact our support team.

This is an automated shipping update from ${storeName}.
  `.trim();

  return { subject, html, text };
}
