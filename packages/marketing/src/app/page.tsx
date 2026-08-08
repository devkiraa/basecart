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
              Pricing
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Simple, transparent pricing.{" "}
              <span className="text-blue-600">
                Zero transaction fees.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium max-w-xl mx-auto">
              Choose the plan that fits your business scale. No hidden fees. Ever.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            
            {/* Free Plan */}
            <AnimatedSection delay={0}>
              <div className="h-full bg-white border border-slate-200 rounded-2xl p-7 space-y-6 flex flex-col justify-between group">
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-900">Free Plan</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">₹0</span>
                    <span className="text-xs text-slate-400 font-semibold">/month</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Ideal for new sellers launching their first catalog.</p>
                  <div className="h-px bg-slate-100" />
                  <ul className="space-y-3 text-xs text-slate-600 font-semibold">
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /><span>Up to 25 catalog products</span></li>
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /><span>Manual order management</span></li>
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /><span>Basecart subdomain catalog</span></li>
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /><span>Zero transaction fees</span></li>
                  </ul>
                </div>
                <a href="/signup" className="w-full py-3 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl text-xs text-center transition-all block">
                  Get Started
                </a>
              </div>
            </AnimatedSection>

            {/* Starter Plan */}
            <AnimatedSection delay={0.08}>
              <div className="h-full bg-white border border-slate-200 rounded-2xl p-7 space-y-6 flex flex-col justify-between group">
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-900">Starter Plan</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">₹299</span>
                    <span className="text-xs text-slate-400 font-semibold">/month</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Perfect for growing boutiques needing a custom domain.</p>
                  <div className="h-px bg-slate-100" />
                  <ul className="space-y-3 text-xs text-slate-600 font-semibold">
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /><span>Up to 500 catalog products</span></li>
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /><span>Custom domain mapping (.com / .in)</span></li>
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /><span>Razorpay, Cashfree & COD support</span></li>
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /><span>Direct WhatsApp chat support</span></li>
                  </ul>
                </div>
                <a href="/signup" className="w-full py-3 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl text-xs text-center transition-all block">
                  Get Started
                </a>
              </div>
            </AnimatedSection>

            {/* Growth Plan (Popular) */}
            <AnimatedSection delay={0.16}>
              <div className="h-full bg-white border-2 border-blue-600 rounded-2xl p-7 space-y-6 relative flex flex-col justify-between group">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-900">Growth Plan</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-blue-600">₹699</span>
                    <span className="text-xs text-slate-400 font-semibold">/month</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">For scaling brands requiring automated logistics.</p>
                  <div className="h-px bg-slate-100" />
                  <ul className="space-y-3 text-xs text-slate-600 font-semibold">
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blue-600 shrink-0" /><span>Unlimited catalog products</span></li>
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blue-600 shrink-0" /><span>Shiprocket & local courier AWB sync</span></li>
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blue-600 shrink-0" /><span>Automated WhatsApp order alerts</span></li>
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blue-600 shrink-0" /><span>Custom coupon & discount engine</span></li>
                  </ul>
                </div>
                <a href="/signup" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs text-center transition-all block">
                  Start Free Trial
                </a>
              </div>
            </AnimatedSection>

            {/* Pro Plan */}
            <AnimatedSection delay={0.24}>
              <div className="h-full bg-white border border-slate-200 rounded-2xl p-7 space-y-6 flex flex-col justify-between group">
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-900">Pro Plan</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">₹1,499</span>
                    <span className="text-xs text-slate-400 font-semibold">/month</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Advanced features & APIs for high-volume stores.</p>
                  <div className="h-px bg-slate-100" />
                  <ul className="space-y-3 text-xs text-slate-600 font-semibold">
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /><span>Headless Storefront APIs</span></li>
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /><span>Priority 24/7 WhatsApp support</span></li>
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /><span>Custom domain & SSL included</span></li>
                    <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /><span>Multi-staff account access</span></li>
                  </ul>
                </div>
                <a href="/signup" className="w-full py-3 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl text-xs text-center transition-all block">
                  Get Started
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
