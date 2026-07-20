import { DefaultLayout } from "../layouts/default";
import { Text } from "../components/Text";
import { Button } from "../components/Button";
import { Divider } from "../components/Divider";

export function renderNewsletter({
  subject,
  headline,
  bodyText,
  ctaText,
  ctaUrl,
  storeName = "Basecart",
  colorPrimary,
  logoUrl,
  emailSignature,
}: {
  subject: string;
  headline?: string;
  bodyText: string;
  ctaText?: string;
  ctaUrl?: string;
  storeName?: string;
  colorPrimary?: string;
  logoUrl?: string;
  emailSignature?: string;
}) {
  const finalHeadline = headline || subject;

  const body = `
    ${Text({
      content: finalHeadline,
      fontWeight: "750",
      fontSize: "20px",
      color: colorPrimary || "#2563EB",
    })}
    ${Text({
      content: bodyText,
      lineHeight: "1.6",
    })}
    ${
      ctaText && ctaUrl
        ? `
      <div style="margin: 24px 0;">
        ${Button({ text: ctaText, url: ctaUrl, primaryColor: colorPrimary })}
      </div>
    `
        : ""
    }
    ${Divider()}
    ${Text({
      content: "You received this email because you subscribed to updates from our store.",
      fontSize: "10px",
      color: "#94A3B8",
    })}
  `;

  const html = DefaultLayout({ title: subject, body, storeName, colorPrimary, logoUrl, emailSignature });
  const text = `
${finalHeadline}

${bodyText}

${ctaText && ctaUrl ? `${ctaText}: ${ctaUrl}` : ""}

This is an automated campaign broadcast from ${storeName}.
  `.trim();

  return { subject, html, text };
}
