import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isReservedSubdomain, isPlatformHost } from "@basecart/shared";

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api routes
     * 2. /_next (static files)
     * 3. /_static (inside /public)
     * 4. All static asset files (svg, png, jpg, webp, css, js, favicon)
     */
    "/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Standard platforms hosts to ignore (should bypass rewrite or map to marketing / admin)
  const baseHosts = [
    "basecart.app",
    "www.basecart.app",
    "basecart-storefront.pages.dev",
    "localhost:3000",
    "localhost:3002",
    "marketing.internal",
  ];

  // Bypass rewrite for base platforms hosts or dedicated demo routes
  if (baseHosts.includes(hostname) || request.nextUrl.pathname.startsWith("/checkout-demo")) {
    return NextResponse.next();
  }

  let tenant = "";

  // Check if subdomain of basecart.app
  if (hostname.endsWith(".basecart.app")) {
    tenant = hostname.replace(".basecart.app", "");
  } 
  // Local development subdomain support (e.g., boutique.localhost:3002)
  else if (hostname.endsWith(".localhost:3002")) {
    tenant = hostname.replace(".localhost:3002", "");
  } 
  // Mapped premium custom domains (e.g., myboutique.in)
  else {
    // Treat the hostname directly as the tenant key. 
    // This allows resolving domain -> store database mappings natively.
    tenant = hostname.toLowerCase();
  }

  // Bypass rewriting for empty, platform hostnames, or reserved subdomains
  if (!tenant || isReservedSubdomain(tenant) || isPlatformHost(hostname)) {
    return NextResponse.next();
  }

  const pathname = url.pathname;

  // Add custom headers containing resolved context info
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant", tenant);
  requestHeaders.set("x-resolved-host", hostname);

  // Perform stealth rewrite to /[tenant]/pathname behind the scenes
  return NextResponse.rewrite(
    new URL(`/${tenant}${pathname}`, request.nextUrl),
    {
      request: {
        headers: requestHeaders,
      },
    }
  );
}
