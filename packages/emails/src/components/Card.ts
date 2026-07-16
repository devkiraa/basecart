export function Card({ content }: { content: string }): string {
  return `
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 20px;">
      <tr>
        <td style="padding: 24px;">
          ${content}
        </td>
      </tr>
    </table>
  `;
}
