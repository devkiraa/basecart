import { DefaultLayout } from "../layouts/default";
import { Text } from "../components/Text";
import { Button } from "../components/Button";
import { Divider } from "../components/Divider";
import { Alert } from "../components/Alert";

export function renderPasswordReset({
  resetLink,
  expiresMinutes = 30,
  storeName = "Basecart",
}: {
  resetLink: string;
  expiresMinutes?: number;
  storeName?: string;
}) {
  const subject = "Reset Your Password";

  const body = `
    ${Text({
      content: "Hello,",
      fontWeight: "600",
      fontSize: "16px",
    })}
    ${Text({
      content: `We received a request to reset the password associated with your account. Click the button below to set a new password:`,
    })}
    ${Button({ text: "Reset Password", url: resetLink })}
    ${Alert({
      message: `This password reset link will expire in ${expiresMinutes} minutes. If you did not request a password reset, you can safely ignore this email and your password will remain unchanged.`,
      type: "info",
    })}
    ${Divider()}
    ${Text({
      content: "If you continue to have trouble accessing your account, please contact our support team.",
      fontSize: "12px",
      color: "#64748B",
    })}
  `;

  const html = DefaultLayout({ title: subject, body, storeName });
  const text = `
Hello,

We received a request to reset the password associated with your account. Click the link below to set a new password:

Reset Link: ${resetLink}

This password reset link will expire in ${expiresMinutes} minutes. If you did not request a password reset, you can safely ignore this email and your password will remain unchanged.

If you continue to have trouble accessing your account, please contact our support team.

This is an automated security email from ${storeName}.
  `.trim();

  return { subject, html, text };
}
