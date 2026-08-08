import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Basecart Merchant Console — Store Management",
    template: "%s | Basecart Console",
  },
  description: "Manage your online store, products, orders, Razorpay billing, and team permissions with Basecart Merchant Dashboard.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_MERCHANT_URL || "https://merchant.basecart.app"),
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "Basecart Merchant Console",
    description: "Multi-tenant e-commerce control panel for store operations.",
    url: "https://merchant.basecart.app",
    siteName: "Basecart Merchant Console",
    images: [
      {
        url: "https://basecart.app/og-dashboard.png",
        width: 1200,
        height: 630,
        alt: "Basecart Console Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
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
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
