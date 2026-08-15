import "./globals.css";
import { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const cfAnalyticsToken = process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN;

export const metadata: Metadata = {
  metadataBase: new URL("https://basecart.app"),
  title: "Basecart | Headless Multi-Tenant E-commerce Platform",
  description: "Create, launch, and scale your online store with Basecart. Get isolated database storage, instant headless storefronts, and secure checkouts.",
  alternates: {
    canonical: "https://basecart.app",
  },
  openGraph: {
    title: "Basecart | Headless Multi-Tenant E-commerce Platform",
    description: "Scale your online shop with lightning-fast headless storefronts and private isolated databases.",
    url: "https://basecart.app",
    siteName: "Basecart",
    type: "website",
    images: [
      {
        url: "/basecart_dashboard_mockup.png",
        width: 1200,
        height: 630,
        alt: "Basecart Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Basecart | Headless Multi-Tenant E-commerce Platform",
    description: "Scale your online shop with lightning-fast headless storefronts and private isolated databases.",
    images: ["/basecart_dashboard_mockup.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${plusJakartaSans.className}`}>
      <body className="font-sans">
        <main id="main">{children}</main>
        {cfAnalyticsToken && (
          <Script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: cfAnalyticsToken })}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
