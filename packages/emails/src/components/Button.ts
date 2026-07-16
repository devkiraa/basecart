export function Button({
  text,
  url,
  primaryColor = "#2563EB",
}: {
  text: string;
  url: string;
  primaryColor?: string;
}): string {
  return `
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top: 24px; margin-bottom: 24px;">
      <tr>
        <td align="center" bgcolor="${primaryColor}" style="border-radius: 8px;">
          <a href="${url}" target="_blank" style="display: inline-block; padding: 12px 28px; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 8px; letter-spacing: 0.2px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}
