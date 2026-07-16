import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export function DefaultLayout({
  title,
  body,
  storeName = "Basecart",
  colorPrimary = "#2563EB",
  logoUrl,
  emailSignature,
}: {
  title?: string;
  body: string;
  storeName?: string;
  colorPrimary?: string;
  logoUrl?: string;
  emailSignature?: string;
}): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title || "Notification"}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F8FAFC; -webkit-text-size-adjust: none; text-size-adjust: none;">
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" height="100%" bgcolor="#F8FAFC" style="padding: 20px 10px;">
        <tr>
          <td align="center" valign="top">
            <!-- Center Box -->
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);">
              <!-- Accent Line -->
              <tr>
                <td bgcolor="${colorPrimary}" style="height: 4px; line-height: 4px; font-size: 4px;">&nbsp;</td>
              </tr>
              <!-- Content Padding -->
              <tr>
                <td style="padding: 32px 24px;">
                  ${Header({ storeName, logoUrl, colorPrimary })}
                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                    <tr>
                      <td style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                        ${body}
                      </td>
                    </tr>
                  </table>
                  ${Footer({ storeName, emailSignature })}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
