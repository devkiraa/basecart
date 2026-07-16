import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export function MinimalLayout({
  title,
  body,
  storeName = "Basecart",
}: {
  title?: string;
  body: string;
  storeName?: string;
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
    <body style="margin: 0; padding: 0; background-color: #ffffff; -webkit-text-size-adjust: none; text-size-adjust: none;">
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" height="100%" bgcolor="#ffffff" style="padding: 20px 10px;">
        <tr>
          <td align="center" valign="top">
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="max-width: 500px;">
              <tr>
                <td style="padding: 20px 10px;">
                  ${Header({ storeName })}
                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                    <tr>
                      <td style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                        ${body}
                      </td>
                    </tr>
                  </table>
                  ${Footer({ storeName })}
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
