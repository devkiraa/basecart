import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: Request) {
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://basecart.app/sitemap.xml`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
