import { MinimalLayout } from "../layouts/minimal";
import { Text } from "../components/Text";
import { OTPBox } from "../components/OTPBox";
import { Alert } from "../components/Alert";

export function renderOTP({
  code,
  expiresMinutes = 10,
  storeName = "Basecart",
  colorPrimary,
  logoUrl,
  emailSignature,
}: {
  code: string;
  expiresMinutes?: number;
  storeName?: string;
  colorPrimary?: string;
  logoUrl?: string;
  emailSignature?: string;
}) {
  const subject = `Your Verification Code: ${code}`;

  const body = `
    ${Text({
      content: "Hello,",
      fontWeight: "600",
      fontSize: "16px",
    })}
    ${Text({
      content: "Please use the following verification code to secure your session or verify your request. Do not share this code with anyone.",
    })}
    ${OTPBox({ code })}
    ${Alert({
      message: `This verification code is valid for the next ${expiresMinutes} minutes. If you did not request this, you can safely ignore this email.`,
      type: "warning",
    })}
  `;

  const html = MinimalLayout({ title: subject, body, storeName, colorPrimary, logoUrl, emailSignature });
  const text = `
Hello,

Please use the following verification code to secure your session or verify your request. Do not share this code with anyone.

Verification Code: ${code}

This verification code is valid for the next ${expiresMinutes} minutes. If you did not request this, you can safely ignore this email.

This is an automated verification email from ${storeName}.
  `.trim();

  return { subject, html, text };
}
