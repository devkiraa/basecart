import type { Metadata } from "next";
import React from "react";
import {
  ArrowUpRight,
  Check,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Leaf Client Components
import DashboardRedirector from "../components/DashboardRedirector";
import FaqAccordionItem from "../components/FaqAccordionItem";
import HeroDashboardMockup from "../components/HeroDashboardMockup";
import HeroContent from "../components/HeroContent";
import AnimatedSection from "../components/AnimatedSection";
import FeaturesGrid from "../components/FeaturesGrid";
import TestimonialsSection from "../components/TestimonialsSection";

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
      
      {/* Inject JSON-LD Schema Structured Data (sanitized for XSS protection) */}
      <script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdSchema)
            .replace(/</g, "\\u003c")
            .replace(/>/g, "\\u003e")
            .replace(/&/g, "\\u0026")
            .replace(/"/g, "\\\""),
        }}
      />

      {/* Off-thread redirection check */}
      <DashboardRedirector merchantDashboardUrl={merchantDashboardUrl} />

      {/* Header */}
      <Header />

      {/* ───────────────────────────────────────────────────
          SECTION A: HERO — Full Viewport
      ─────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-16 min-h-[calc(100vh-64px)] flex items-center justify-center bg-white border-b border-slate-100 relative overflow-hidden py-16 lg:py-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-10 w-full">
          {/* Hero Left: Animated Content */}
          <HeroContent />

          {/* Hero Right: Interactive Dashboard Mockup */}
          <AnimatedSection direction="left" delay={0.3} className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
            <HeroDashboardMockup />
          </AnimatedSection>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────
          SECTION B: FEATURES GRID
      ─────────────────────────────────────────────────── */}
      <FeaturesGrid />

      {/* ───────────────────────────────────────────────────
          SECTION C: TESTIMONIALS
      ─────────────────────────────────────────────────── */}
      <TestimonialsSection />

      {/* ───────────────────────────────────────────────────
          SECTION D: PRICING
      ─────────────────────────────────────────────────── */}
      <section id="pricing" className="py-28 px-6 lg:px-16 bg-gradient-to-b from-white via-slate-50/40 to-white border-b border-slate-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-14">
          
          <AnimatedSection className="text-center max-w-2xl mx-auto space-y-5">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Pricing & Free Trial
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Start Free. Pay Only When You Scale.{" "}
              <span className="text-blue-600">
                0% Transaction Fees.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium max-w-2xl mx-auto">
              <strong className="text-slate-900 font-bold">Zero risk upfront.</strong> Experience full <span className="text-blue-600 font-bold">Growth-tier features</span> for your first 100 orders or ₹25,000 in sales (whichever comes first). No credit card required.
            </p>
          </AnimatedSection>

          {/* 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            
            {/* Basic Plan */}
            <AnimatedSection delay={0}>
              <div className="h-full bg-white border border-slate-200 rounded-2xl p-6 space-y-6 flex flex-col justify-between group shadow-sm hover:shadow-md transition-all">
                <div className="space-y-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-extrabold uppercase tracking-wider">Basic</span>
                  <h3 className="text-xl font-black text-slate-900">BASIC</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">₹99</span>
                    <span className="text-xs text-slate-400 font-semibold">/month</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Ideal for Instagram sellers & WhatsApp order intake.</p>
                  <div className="h-px bg-slate-100" />
                  <ul className="space-y-2.5 text-xs text-slate-600 font-semibold">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /><span>Up to 100 Product Listings</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /><span>Direct WhatsApp Checkout</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /><span>Razorpay & Stripe Payment Gateways</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /><span>Manual UPI & COD Tracking</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /><span>0% Platform Fees</span></li>
                  </ul>
                </div>
                <a href="https://dashboard.basecart.app/signup?plan=basic" className="w-full py-2.5 border border-slate-200 hover:border-slate-350 text-slate-800 font-bold rounded-xl text-xs text-center transition-all block">
                  Choose Basic
                </a>
              </div>
            </AnimatedSection>

            {/* Plus Plan (₹499) */}
            <AnimatedSection delay={0.06}>
              <div className="h-full bg-white border border-blue-200 rounded-2xl p-6 space-y-6 flex flex-col justify-between group shadow-sm hover:shadow-md transition-all">
                <div className="space-y-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-extrabold uppercase tracking-wider">Plus</span>
                  <h3 className="text-xl font-black text-slate-900">PLUS</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-blue-600">₹499</span>
                    <span className="text-xs text-slate-400 font-semibold">/month</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Custom domain website for growing D2C stores.</p>
                  <div className="h-px bg-blue-50" />
                  <ul className="space-y-2.5 text-xs text-slate-600 font-semibold">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 shrink-0" /><span className="font-bold text-slate-900">Custom Domain (`yourbrand.com`)</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 shrink-0" /><span>Razorpay & Stripe Payment Gateways</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 shrink-0" /><span>Up to 500 Product Listings</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 shrink-0" /><span>Custom Storefront Themes</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 shrink-0" /><span>0% Platform Fees</span></li>
                  </ul>
                </div>
                <a href="https://dashboard.basecart.app/signup?plan=plus" className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs text-center transition-all block">
                  Choose Plus
                </a>
              </div>
            </AnimatedSection>

            {/* Growth Plan (Popular) */}
            <AnimatedSection delay={0.12}>
              <div className="h-full bg-white border-2 border-indigo-600 rounded-2xl p-6 space-y-6 relative flex flex-col justify-between group shadow-xl scale-102 z-10">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-black uppercase px-3 py-0.5 rounded-full shadow-sm">
                  RECOMMENDED ⭐
                </div>
                <div className="space-y-4">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-extrabold uppercase tracking-wider">Growth ⭐</span>
                  <h3 className="text-xl font-black text-slate-900">GROWTH</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">₹1,499</span>
                    <span className="text-xs text-slate-400 font-semibold">/month</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Built for scaling D2C brands with automated shipping.</p>
                  <div className="h-px bg-indigo-50" />
                  <ul className="space-y-2.5 text-xs text-slate-600 font-semibold">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 shrink-0" /><span className="font-bold text-slate-900">Custom Domain Mapping</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 shrink-0" /><span>Razorpay & Stripe Gateways</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 shrink-0" /><span>Unlimited Products & Orders</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 shrink-0" /><span className="font-bold text-slate-900">Shiprocket Automated Shipping</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 shrink-0" /><span>Abandoned Cart Recovery</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 shrink-0" /><span>AI Description Writer</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 shrink-0" /><span>0% Platform Fees</span></li>
                  </ul>
                </div>
                <a href="https://dashboard.basecart.app/signup?plan=growth" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs text-center transition-all shadow-md block">
                  Choose Growth
                </a>
              </div>
            </AnimatedSection>

            {/* Business Plan */}
            <AnimatedSection delay={0.18}>
              <div className="h-full bg-white border border-purple-200 rounded-2xl p-6 space-y-6 flex flex-col justify-between group shadow-sm hover:shadow-md transition-all">
                <div className="space-y-4">
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-[10px] font-extrabold uppercase tracking-wider">Business</span>
                  <h3 className="text-xl font-black text-slate-900">BUSINESS</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-purple-900">₹2,999</span>
                    <span className="text-xs text-slate-400 font-semibold">/month</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">For high-volume brands and multi-member teams.</p>
                  <div className="h-px bg-slate-100" />
                  <ul className="space-y-2.5 text-xs text-slate-600 font-semibold">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600 shrink-0" /><span>Multi-Staff Accounts (5 Seats)</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600 shrink-0" /><span>Developer REST API & Webhooks</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600 shrink-0" /><span>Custom CSS / JS Code Injection</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600 shrink-0" /><span>Automated GST Invoices & PDF</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600 shrink-0" /><span>Priority 24/7 Support</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600 shrink-0" /><span>0% Platform Fees</span></li>
                  </ul>
                </div>
                <a href="https://dashboard.basecart.app/signup?plan=business" className="w-full py-2.5 border border-purple-200 hover:border-purple-300 text-purple-900 font-bold rounded-xl text-xs text-center transition-all block">
                  Choose Business
                </a>
              </div>
            </AnimatedSection>

          </div>

        </div>
      </section>

      {/* ───────────────────────────────────────────────────
          SECTION E: FAQ
      ─────────────────────────────────────────────────── */}
      <section className="py-28 px-6 lg:px-16 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto space-y-12">
          <AnimatedSection className="text-center space-y-4">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Have questions? We&apos;ve got answers.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-sm">
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
          </AnimatedSection>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────
          SECTION F: BOTTOM CTA
      ─────────────────────────────────────────────────── */}
      <section className="py-28 px-6 lg:px-16 bg-white relative overflow-hidden">
        <AnimatedSection className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Ready to grow your{" "}
            <span className="text-blue-600">
              online business
            </span>
            ?
          </h2>
          <p className="text-base sm:text-lg text-slate-500 font-medium max-w-xl mx-auto">
            Start your 60-day free trial today. No credit card required. Set up in under 2 minutes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a 
              href="/signup"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all text-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Start 60-day free trial</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-400 font-semibold pt-4">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" /> Cancel anytime
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" /> Zero transaction fees forever
            </span>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
