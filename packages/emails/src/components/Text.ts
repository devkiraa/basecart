export function Text({
  content,
  color = "#334155",
  fontSize = "14px",
  fontWeight = "400",
  lineHeight = "1.6",
  align = "left",
}: {
  content: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  align?: "left" | "center" | "right";
}): string {
  return `
    <p style="margin: 0 0 12px 0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: ${fontSize}; font-weight: ${fontWeight}; color: ${color}; line-height: ${lineHeight}; text-align: ${align};">
      ${content}
    </p>
  `;
}
