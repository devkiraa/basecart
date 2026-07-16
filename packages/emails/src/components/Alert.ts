export function Alert({
  message,
  type = "info",
}: {
  message: string;
  type?: "info" | "warning" | "error" | "success";
}): string {
  let bgColor = "#F0F9FF";
  let borderColor = "#B9E6FE";
  let textColor = "#0284C7";

  if (type === "warning") {
    bgColor = "#FEF3C7";
    borderColor = "#FDE68A";
    textColor = "#D97706";
  } else if (type === "error") {
    bgColor = "#FEE2E2";
    borderColor = "#FCA5A5";
    textColor = "#DC2626";
  } else if (type === "success") {
    bgColor = "#ECFDF5";
    borderColor = "#A7F3D0";
    textColor = "#059669";
  }

  return `
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="background-color: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 8px; margin-top: 16px; margin-bottom: 16px;">
      <tr>
        <td style="padding: 16px; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 500; color: ${textColor}; line-height: 1.5;">
          ${message}
        </td>
      </tr>
    </table>
  `;
}
