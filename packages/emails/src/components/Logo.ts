export function Logo(): string {
  // SVG or image representing Basecart logo. Let's use a nice styled text logo with a blue accent box.
  return `
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 20px;">
      <tr>
        <td bgcolor="#2563EB" style="border-radius: 6px; padding: 6px 12px; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase;">
          B
        </td>
        <td style="padding-left: 10px; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 20px; font-weight: 800; color: #1E293B; letter-spacing: -0.5px; text-transform: uppercase;">
          Basecart
        </td>
      </tr>
    </table>
  `;
}
