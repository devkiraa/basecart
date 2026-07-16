import { Logo } from "./Logo";

export function Header({ storeName }: { storeName?: string }): string {
  if (storeName && storeName.toLowerCase() !== "basecart") {
    return `
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="margin-bottom: 24px; border-bottom: 1px solid #E2E8F0; padding-bottom: 16px;">
        <tr>
          <td align="left">
            <h1 style="margin: 0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 22px; font-weight: 800; color: #2563EB; text-transform: uppercase;">
              ${storeName}
            </h1>
          </td>
        </tr>
      </table>
    `;
  }
  return `
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td align="left">
          ${Logo()}
        </td>
      </tr>
    </table>
  `;
}
