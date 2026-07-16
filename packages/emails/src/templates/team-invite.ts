import { DefaultLayout } from "../layouts/default";
import { Text } from "../components/Text";
import { Button } from "../components/Button";
import { Divider } from "../components/Divider";

export function renderTeamInvite({
  inviteLink,
  inviterName = "A team member",
  role = "member",
  storeName = "Basecart",
  colorPrimary,
  logoUrl,
  emailSignature,
}: {
  inviteLink: string;
  inviterName?: string;
  role?: string;
  storeName?: string;
  colorPrimary?: string;
  logoUrl?: string;
  emailSignature?: string;
}) {
  const subject = `Join the ${storeName} team on Basecart`;

  const body = `
    ${Text({
      content: "Hello,",
      fontWeight: "600",
      fontSize: "16px",
    })}
    ${Text({
      content: `**${inviterName}** has invited you to join the team at **${storeName}** on Basecart with the role of **${role}**.`,
    })}
    ${Text({
      content: "By joining the team, you will collaborate, edit theme layouts, list products, track customer fulfillment, and manage settings.",
    })}
    
    ${Button({ text: "Accept Invitation", url: inviteLink, primaryColor: colorPrimary })}

    ${Divider()}
    ${Text({
      content: "This invitation link was generated specifically for your email. If you did not expect this invitation, you can safely ignore this email.",
      fontSize: "12px",
      color: "#64748B",
    })}
  `;

  const html = DefaultLayout({ title: subject, body, storeName, colorPrimary, logoUrl, emailSignature });
  const text = `
Hello,

${inviterName} has invited you to join the team at ${storeName} on Basecart with the role of ${role}.

By joining the team, you will collaborate, edit theme layouts, list products, track customer fulfillment, and manage settings.

Accept Invitation Link: ${inviteLink}

This invitation link was generated specifically for your email. If you did not expect this invitation, you can safely ignore this email.

This is an automated team invitation email from ${storeName}.
  `.trim();

  return { subject, html, text };
}
