export function Footer({
  storeName = "Basecart",
  emailSignature
}: {
  storeName?: string;
  emailSignature?: string;
}): string {
  const currentYear = new Date().getFullYear();
  return `
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="margin-top: 32px; border-top: 1px solid #E2E8F0; padding-top: 16px;">
      ${emailSignature ? `
      <tr>
        <td style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: #475569; line-height: 1.6; padding-bottom: 16px; text-align: left;">
          ${emailSignature.replace(/\n/g, "<br/>")}
        </td>
      </tr>
      ` : ""}
      <tr>
        <td align="center" style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: #94A3B8; line-height: 1.5; text-align: center;">
          <p style="margin: 0 0 6px 0;">This is an automated transaction email from ${storeName}.</p>
          <p style="margin: 0;">&copy; ${currentYear} ${storeName}. All rights reserved.</p>
        </td>
      </tr>
    </table>
  `;
}
