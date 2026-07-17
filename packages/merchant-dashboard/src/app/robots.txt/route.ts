import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  const robotsTxt = `User-agent: *
Disallow: /`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
