import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://basecart.app"),
  title: "Basecart | Headless Multi-Tenant E-commerce Platform",
  description: "Create, launch, and scale your online store with Basecart. Get isolated database storage, instant headless storefronts, and secure checkouts.",
  alternates: {
    canonical: "./",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
