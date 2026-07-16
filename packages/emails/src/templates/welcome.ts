import { DefaultLayout } from "../layouts/default";
import { Text } from "../components/Text";
import { Button } from "../components/Button";
import { Divider } from "../components/Divider";

export function renderWelcome({
  userName,
  verifyLink,
  storeName = "Basecart",
  colorPrimary,
  logoUrl,
  emailSignature,
}: {
  userName?: string;
  verifyLink?: string;
  storeName?: string;
  colorPrimary?: string;
  logoUrl?: string;
  emailSignature?: string;
}) {
  const subject = `Welcome to ${storeName}!`;

  const welcomeText = userName ? `Welcome to Basecart, ${userName}!` : "Welcome to Basecart!";

  const body = `
    ${Text({
      content: welcomeText,
      fontWeight: "750",
      fontSize: "20px",
      color: colorPrimary || "#2563EB",
    })}
    ${Text({
      content: "Thank you for signing up and embarking on your ecommerce journey with us. Basecart is built on Cloudflare Edge architecture to run your store at zero latency and scale seamlessly to thousands of checkout operations.",
    })}
    ${
      verifyLink
        ? `
      ${Text({
        content: "To unlock full access to your console and publish your active storefront, please verify your email address by clicking the button below:",
      })}
      ${Button({ text: "Verify Email Address", url: verifyLink, primaryColor: colorPrimary })}
      ${Text({
        content: "This link will expire in 24 hours.",
        fontSize: "12px",
        color: "#64748B",
      })}
    `
        : `
      ${Text({
        content: "You are all set to build your collections, list your products, configure secure payment gateways, and launch your storefront.",
      })}
      ${Button({ text: "Go to Console", url: "https://basecart.app", primaryColor: colorPrimary })}
    `
    }
    ${Divider()}
    ${Text({
      content: "Need help? Reach out to our support channel or consult the Basecart documentation.",
      fontSize: "12px",
      color: "#64748B",
    })}
  `;

  const html = DefaultLayout({ title: subject, body, storeName, colorPrimary, logoUrl, emailSignature });
  const text = `
${welcomeText}

Thank you for signing up and embarking on your ecommerce journey with us. Basecart is built on Cloudflare Edge architecture to run your store at zero latency and scale seamlessly to thousands of checkout operations.

${
  verifyLink
    ? `To unlock full access to your console and publish your active storefront, please verify your email address using this link: ${verifyLink} (expires in 24 hours)`
    : `You are all set to build your collections, list your products, configure secure payment gateways, and launch your storefront. Go to console: https://basecart.app`
}

Need help? Reach out to our support channel or consult the Basecart documentation.

This is an automated welcome email from ${storeName}.
  `.trim();

  return { subject, html, text };
}
