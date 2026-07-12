import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const host = request.headers.get("host") || "";
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: http://${host}/sitemap.xml`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
