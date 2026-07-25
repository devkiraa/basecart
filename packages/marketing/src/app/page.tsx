import type { Metadata } from "next";
import React from "react";
import {
  Sparkles,
  ArrowUpRight,
  Check,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Leaf Client Components for client-side side-effects and interactions
import DashboardRedirector from "../components/DashboardRedirector";
import BookDemoButton from "../components/BookDemoButton";
import FaqAccordionItem from "../components/FaqAccordionItem";
import HeroDashboardMockup from "../components/HeroDashboardMockup";

export const metadata: Metadata = {
  title: "Basecart — #1 Shopify Alternative for Indian Brands & WhatsApp Stores",
  description: "Launch your online store in 2 minutes. Accept instant UPI & COD payments, automate WhatsApp orders, and integrate local shipping across Kerala & India with zero transaction fees.",
  keywords: [
    "Shopify alternative India",
    "WhatsApp store builder",
    "Create online store Kerala",
    "Instagram boutique catalog maker",
    "Zero transaction fee ecommerce platform",
    "Accept UPI online store",
    "E-commerce platform Kochi",
    "Shiprocket integrated store builder"
  ],
  authors: [{ name: "Basecart Inc." }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Basecart — The Shopify Alternative Built for Indian Brands",
    description: "Accept instant UPI payments, automate WhatsApp orders, and ship across India with zero transaction fees. Start your 60-day free trial.",
    url: "https://basecart.app",
    siteName: "Basecart",
    images: [
      {
        url: "https://basecart.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Basecart Merchant Dashboard Preview",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Basecart — #1 Shopify Alternative for Indian Brands",
    description: "Launch your store with zero transaction fees, automated WhatsApp order alerts, and instant UPI checkout.",
    images: ["https://basecart.app/og-image.png"],
  },
  alternates: {
    canonical: "https://basecart.app",
  },
};

export default function LandingPage() {
  const merchantDashboardUrl = process.env.NEXT_PUBLIC_MERCHANT_DASHBOARD_URL || "http://localhost:3004";

  // Structured Data (JSON-LD)
  const jsonLdSchema = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Basecart",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "url": "https://basecart.app",
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "INR",
        "lowPrice": "0",
        "highPrice": "1499",
        "offerCount": "4"
      },
      "description": "The top Shopify alternative for Indian brands, Instagram boutiques, and local businesses in Kerala offering WhatsApp store integration and instant UPI payment automation."
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does Basecart automate Instagram DM and WhatsApp orders?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Basecart links your online storefront directly to WhatsApp. When a customer checks out on your store, an instant, pre-filled WhatsApp message containing order items, payment status, and delivery address is generated—eliminating manual DM management."
          }
        },
        {
          "@type": "Question",
          "name": "How does Basecart handle localized shipping and regional logistics in India?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Basecart natively integrates with Shiprocket, Delhivery, DTDC, and Speed Post. You can automatically generate Air Waybills (AWBs), schedule local doorstep pickups across Kerala & South India, and offer Cash on Delivery (COD) with automated verification."
          }
        },
        {
          "@type": "Question",
          "name": "Does Basecart support regional customer checkout in local Indian languages?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! Storefront checkout flows, order confirmation messages, and WhatsApp notifications can be customized in Malayalam, Tamil, and English, making it effortless for local customers to buy from your store."
          }
        },
        {
          "@type": "Question",
          "name": "How do I connect a custom domain to my Basecart store?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Connecting your custom domain (such as yourbrand.in or yourbrand.com) takes less than 2 minutes. Simply point your CNAME records to Basecart's servers, and we automatically provision a free SSL certificate for instant secure browsing."
          }
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-600 font-sans antialiased overflow-x-hidden selection:bg-blue-50 selection:text-blue-600">
      
      {/* Inject JSON-LD Schema Structured Data */}
      <script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdSchema),
        }}
      />

      {/* Off-thread redirection check */}
      <DashboardRedirector merchantDashboardUrl={merchantDashboardUrl} />

      {/* Header */}
      <Header />

      {/* Section A: Hero Section (Full Screen Viewport) */}
      <section className="px-6 lg:px-16 min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-b from-[#F8FAFC]/50 via-white to-white border-b border-slate-100 relative overflow-hidden py-12 lg:py-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-50/50 filter blur-3xl opacity-60 pointer-events-none -z-10"></div>
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-50/40 filter blur-3xl opacity-50 pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-8 w-full">
          {/* Hero Content */}
          <div className="w-full lg:w-1/2 space-y-8 text-left">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-[1.12] tracking-tight">
                The <span className="text-blue-600">Shopify alternative</span> built for <span className="text-blue-600">Indian brands</span> & Instagram sellers.
              </h1>
              <p className="text-base lg:text-lg text-slate-500 leading-relaxed max-w-xl font-medium">
                Basecart gives you everything you need to create your store, accept instant UPI & COD payments, automate WhatsApp order receipts, and scale your business across Kerala & India with zero transaction fees.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 select-none pt-2">
              <a 
                href="/signup"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/10 transition-all text-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start 60-day free trial</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
              <BookDemoButton />
            </div>

            {/* Hero Micro-copy Badges */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400 font-semibold select-none pt-1">
              <span className="flex items-center gap-1.5">✓ No credit card required</span>
              <span className="flex items-center gap-1.5">✓ Quick setup in 2 minutes</span>
              <span className="flex items-center gap-1.5">✓ Zero transaction fees</span>
            </div>
          </div>

          {/* Hero Right Column: Interactive Dashboard Mockup Component */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
            <HeroDashboardMockup />
          </div>
        </div>
      </section>

      {/* Section B: Social Proof Banner */}
      <section className="border-b border-slate-100 bg-slate-50/50 py-10 px-6 select-none">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            TRUSTED BY 5,000+ HOME BUSINESSES, INSTAGRAM BOUTIQUES & D2C BRANDS ACROSS KERALA & INDIA
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60 text-slate-500 text-sm font-extrabold tracking-tight">
            <span className="hover:text-blue-600 transition-colors">Kasavu Boutique</span>
            <span className="hover:text-blue-600 transition-colors">Aura Luxury</span>
            <span className="hover:text-blue-600 transition-colors">Kochi Bakers</span>
            <span className="hover:text-blue-600 transition-colors">Zari Silks</span>
            <span className="hover:text-blue-600 transition-colors">Urban Threads</span>
          </div>
        </div>
      </section>

      {/* Section C: Merchant Dashboard Feature Showcase Section */}
      <section className="py-24 px-6 lg:px-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-blue-600 uppercase tracking-wider bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>MERCHANT DASHBOARD</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Stay productive with built-in UPI, WhatsApp automation, and local courier sync.
            </h2>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-medium">
              Manage product catalogs, verify Razorpay/Cashfree & UPI payments instantly, auto-dispatch WhatsApp receipts, and track local Shiprocket/DTDC shipments—all without leaving your Basecart dashboard.
            </p>
          </div>

          <div className="flex justify-center pt-4">
            <HeroDashboardMockup />
          </div>

        </div>
      </section>

      {/* Section D: Pricing Section */}
      <section id="pricing" className="py-24 px-6 lg:px-16 bg-[#F8FAFC]/60 border-b border-slate-100">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-blue-600 uppercase tracking-wider bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              <span>PRICING</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Simple, transparent pricing with zero transaction fees.
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium">
              Choose the plan that fits your business scale. No hidden transaction fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Free Plan */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-900">Free Plan</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">₹0</span>
                  <span className="text-xs text-slate-400 font-semibold">/month</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Ideal for new sellers launching their first catalog.</p>
                <div className="h-px bg-slate-100" />
                <ul className="space-y-2.5 text-xs text-slate-600 font-semibold">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Up to 25 catalog products</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Standard UPI & WhatsApp orders</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Basecart subdomain catalog</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Zero transaction fees</span>
                  </li>
                </ul>
              </div>
              <a
                href="/signup"
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs text-center transition-colors block"
              >
                Get Started
              </a>
            </div>

            {/* Starter Plan */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-900">Starter Plan</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">₹299</span>
                  <span className="text-xs text-slate-400 font-semibold">/month</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Perfect for growing boutiques needing a custom domain.</p>
                <div className="h-px bg-slate-100" />
                <ul className="space-y-2.5 text-xs text-slate-600 font-semibold">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Up to 250 catalog products</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Custom domain mapping (.com / .in)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Razorpay, Cashfree & COD support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Direct WhatsApp chat support</span>
                  </li>
                </ul>
              </div>
              <a
                href="/signup"
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs text-center transition-colors block"
              >
                Get Started
              </a>
            </div>

            {/* Growth Plan (Popular) */}
            <div className="bg-white border-2 border-blue-600 rounded-2xl p-6 space-y-6 shadow-md relative flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-xs">
                MOST POPULAR
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-900">Growth Plan</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">₹699</span>
                  <span className="text-xs text-slate-400 font-semibold">/month</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">For scaling brands requiring automated logistics.</p>
                <div className="h-px bg-slate-100" />
                <ul className="space-y-2.5 text-xs text-slate-600 font-semibold">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Unlimited catalog products</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Shiprocket & local courier AWB sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Automated WhatsApp order alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Custom coupon & discount engine</span>
                  </li>
                </ul>
              </div>
              <a
                href="/signup"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs text-center transition-colors block shadow-sm"
              >
                Start Free Trial
              </a>
            </div>

            {/* Pro Plan */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-900">Pro Plan</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">₹1,499</span>
                  <span className="text-xs text-slate-400 font-semibold">/month</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Advanced features & APIs for high-volume stores.</p>
                <div className="h-px bg-slate-100" />
                <ul className="space-y-2.5 text-xs text-slate-600 font-semibold">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Headless Storefront APIs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Priority 24/7 WhatsApp support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Custom domain & SSL included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Multi-staff account access</span>
                  </li>
                </ul>
              </div>
              <a
                href="/signup"
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs text-center transition-colors block"
              >
                Get Started
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* Section E: FAQ Accordion Section */}
      <section className="py-24 px-6 lg:px-16 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Have questions? We&apos;ve got answers.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            <FaqAccordionItem
              question="How does Basecart automate Instagram DM and WhatsApp orders?"
              answer="Basecart links your online storefront directly to WhatsApp. When a customer checks out on your store, an instant, pre-filled WhatsApp message containing order items, payment status, and delivery address is generated—eliminating manual DM management."
            />
            <FaqAccordionItem
              question="How does Basecart handle localized shipping and regional logistics in India?"
              answer="Basecart natively integrates with Shiprocket, Delhivery, DTDC, and Speed Post. You can automatically generate Air Waybills (AWBs), schedule local doorstep pickups across Kerala & South India, and offer Cash on Delivery (COD) with automated verification."
            />
            <FaqAccordionItem
              question="Does Basecart support regional customer checkout in local Indian languages?"
              answer="Yes! Storefront checkout flows, order confirmation messages, and WhatsApp notifications can be customized in Malayalam, Tamil, and English, making it effortless for local customers to buy from your store."
            />
            <FaqAccordionItem
              question="How do I connect a custom domain to my Basecart store?"
              answer="Connecting your custom domain (such as yourbrand.in or yourbrand.com) takes less than 2 minutes. Simply point your CNAME records to Basecart's servers, and we automatically provision a free SSL certificate for instant secure browsing."
            />
          </div>
        </div>
      </section>

      {/* Section F: Bottom CTA Banner */}
      <section className="py-24 px-6 lg:px-16 bg-gradient-to-b from-white to-[#F8FAFC] relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Ready to grow your online business?
          </h2>
          <p className="text-base sm:text-lg text-slate-500 font-medium max-w-xl mx-auto">
            Start your 60-day free trial today. No credit card required.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a 
              href="/signup"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Start 60-day free trial</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
            <BookDemoButton />
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
