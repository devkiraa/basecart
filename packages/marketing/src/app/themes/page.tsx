import type { Metadata } from "next";
import React from "react";
import ThemesClient from "../../components/ThemesClient";

export const metadata: Metadata = {
  title: "E-commerce Storefront Themes & Templates — Basecart",
  description: "Explore high-performance, mobile-first themes for Indian brands, Instagram boutiques, saree stores, and electronics. 100/100 Lighthouse speed score.",
  keywords: [
    "Ecommerce themes India",
    "Shopify theme alternative",
    "Kasavu saree store theme",
    "Instagram boutique templates",
    "Mobile first ecommerce themes",
    "Basecart themes",
  ],
  openGraph: {
    title: "Basecart E-commerce Themes & Storefront Templates",
    description: "Launch in minutes with lightning-fast, mobile-first themes built for UPI checkout and WhatsApp order sync.",
    url: "https://basecart.app/themes",
    siteName: "Basecart",
  },
  alternates: {
    canonical: "https://basecart.app/themes",
  },
};

export default function ThemesPage() {
  return <ThemesClient />;
}
