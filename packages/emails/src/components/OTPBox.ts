export function OTPBox({ code }: { code: string }): string {
  return `
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" align="center" style="margin-top: 24px; margin-bottom: 24px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;">
      <tr>
        <td align="center" style="padding: 16px 32px; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 32px; font-weight: 800; color: #2563EB; letter-spacing: 6px; text-align: center;">
          ${code}
        </td>
      </tr>
    </table>
  `;
}
