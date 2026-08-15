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
  title: {
    default: "Basecart Storefront — High-Performance E-commerce",
    template: "%s | Basecart Storefront",
  },
  description: "Experience ultra-fast, seamless online shopping powered by Basecart multi-tenant headless e-commerce.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://basecart.app"),
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "Basecart Storefront",
    description: "Discover curated items, fast checkout, and transparent tracking.",
    url: "https://basecart.app",
    siteName: "Basecart Storefront",
    images: [
      {
        url: "https://basecart.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Basecart Storefront Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Basecart Storefront",
    description: "Shop top products with seamless Razorpay payment.",
    images: ["https://basecart.app/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
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
    <html lang="en" dir="ltr" className={`${plusJakartaSans.variable} ${plusJakartaSans.className}`}>
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
