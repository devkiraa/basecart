import { DefaultLayout } from "../layouts/default";
import { Text } from "../components/Text";
import { Button } from "../components/Button";
import { Divider } from "../components/Divider";

export function renderSubscription({
  planName,
  amount,
  billingCycle = "monthly",
  status = "active",
  consoleUrl = "https://basecart.app",
  storeName = "Basecart",
  colorPrimary,
  logoUrl,
  emailSignature,
}: {
  planName: string;
  amount: number;
  billingCycle?: string;
  status?: string;
  consoleUrl?: string;
  storeName?: string;
  colorPrimary?: string;
  logoUrl?: string;
  emailSignature?: string;
}) {
  const subject = `Basecart Subscription Update: ${planName} Plan`;

  const body = `
    ${Text({
      content: "Hello,",
      fontWeight: "600",
      fontSize: "16px",
    })}
    ${Text({
      content: `Your subscription to the **${planName}** plan is now **${status}**. Below is your current billing and subscription profile summary:`,
    })}

    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; margin-top: 20px; margin-bottom: 20px;">
      <tr>
        <td style="padding: 16px;">
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
            <tr>
              <td style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #475569; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0;">Selected Plan</td>
              <td align="right" style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #1E293B; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0;">${planName}</td>
            </tr>
            <tr>
              <td style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #475569; padding-top: 8px; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0;">Billing Cycle</td>
              <td align="right" style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #1E293B; padding-top: 8px; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0;">${billingCycle}</td>
            </tr>
            <tr>
              <td style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #475569; padding-top: 8px; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0;">Status</td>
              <td align="right" style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #059669; padding-top: 8px; padding-bottom: 8px; border-bottom: 1px solid #E2E8F0; text-transform: capitalize;">${status}</td>
            </tr>
            <tr>
              <td style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #475569; padding-top: 8px;">Rate</td>
              <td align="right" style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 800; color: #1E293B; padding-top: 8px;">₹${amount} / cycle</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${Text({
      content: "You can manage your subscription settings, view your invoices, and update your business details in your console dashboard:",
    })}
    ${Button({ text: "Access Dashboard", url: consoleUrl, primaryColor: colorPrimary })}

    ${Divider()}
    ${Text({
      content: "Thank you for using Basecart to power your storefront business.",
      fontSize: "12px",
      color: "#64748B",
    })}
  `;

  const html = DefaultLayout({ title: subject, body, storeName, colorPrimary, logoUrl, emailSignature });
  const text = `
Hello,

Your subscription to the ${planName} plan is now ${status}. Below is your current billing and subscription profile summary:

Plan: ${planName}
Billing Cycle: ${billingCycle}
Status: ${status}
Rate: ₹${amount}

You can manage your subscription settings, view your invoices, and update your business details in your console dashboard at: ${consoleUrl}

Thank you for using Basecart to power your storefront business.

This is an automated billing email from ${storeName}.
  `.trim();

  return { subject, html, text };
}


