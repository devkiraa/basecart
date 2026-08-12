import React from "react";
import { Metadata } from "next";
import { CheckCircle, ArrowRight, Sparkles, ShieldCheck, CreditCard, RefreshCw, FileText } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import FaqAccordionItem from "../../components/FaqAccordionItem";
import { PLANS, FAQS, TRIAL, PRICING_LAST_UPDATED } from "../../data/plans";

export const metadata: Metadata = {
  title: "Pricing & Plans for Indian Sellers (2026) | Basecart",
  description:
    "Basecart pricing starts at ₹99/month with 0% platform transaction fees. Try full Growth-plan features free for 3 months or your first 1,000 orders / ₹25,000 in sales — no credit card required.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Basecart Pricing — 0% Transaction Fees, Plans from ₹99/mo",
    description:
      "Start with full Growth-tier features free. Transparent plans from ₹99/month with zero platform transaction fees. No credit card required.",
    url: "https://basecart.app/pricing",
    siteName: "Basecart",
    type: "website",
    images: [
      {
        url: "/basecart_dashboard_mockup.png",
        width: 1200,
        height: 630,
        alt: "Basecart pricing plans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Basecart Pricing — 0% Transaction Fees, Plans from ₹99/mo",
    description:
      "Start with full Growth-tier features free. Transparent plans from ₹99/month with zero platform transaction fees.",
    images: ["/basecart_dashboard_mockup.png"],
  },
};

const accentStyles: Record<string, { badge: string; price: string; border: string; cta: string }> = {
  slate: {
    badge: "bg-slate-100 text-slate-700",
    price: "text-slate-900",
    border: "border-slate-200",
    cta: "bg-slate-100 hover:bg-slate-200 text-slate-800",
  },
  blue: {
    badge: "bg-blue-50 text-blue-700",
    price: "text-blue-600",
    border: "border-blue-200",
    cta: "bg-blue-50 hover:bg-blue-100 text-blue-700",
  },
  indigo: {
    badge: "bg-indigo-50 text-indigo-700",
    price: "text-slate-900",
    border: "border-2 border-indigo-600",
    cta: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md",
  },
  purple: {
    badge: "bg-purple-50 text-purple-700",
    price: "text-purple-900",
    border: "border-purple-200",
    cta: "bg-purple-50 hover:bg-purple-100 text-purple-800",
  },
};

// ── JSON-LD: machine-readable offers + FAQ (AI-agent readiness) ──
const offersSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Basecart",
  description:
    "Multi-tenant e-commerce platform for Indian sellers — 0% platform transaction fees, native WhatsApp checkout, UPI/COD payments and Shiprocket automation.",
  brand: { "@type": "Brand", name: "Basecart" },
  url: "https://basecart.app/pricing",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "INR",
    lowPrice: "0",
    highPrice: "2999",
    offerCount: "5",
    offers: [
      {
        "@type": "Offer",
        name: TRIAL.label,
        price: String(TRIAL.price),
        priceCurrency: "INR",
        description: TRIAL.description,
        availability: "https://schema.org/InStock",
      },
      ...PLANS.map((p) => ({
        "@type": "Offer",
        name: `${p.name} plan`,
        price: String(p.price),
        priceCurrency: "INR",
        priceValidUntil: "2027-12-31",
        description: p.tagline,
        availability: "https://schema.org/InStock",
        url: `https://basecart.app/pricing#${p.id}`,
      })),
    ],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const schemaHtml = JSON.stringify([offersSchema, faqSchema])
  .replace(/</g, "\\u003c")
  .replace(/>/g, "\\u003e")
  .replace(/&/g, "\\u0026");

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-600 font-sans selection:bg-blue-50 selection:text-blue-600">
      {/* JSON-LD structured data (sanitized) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaHtml }}
      />

      <Header />

      {/* ── Hero ── */}
      <section className="px-6 lg:px-16 pt-16 pb-12 bg-gradient-to-b from-[#F8FAFC] via-white to-white text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>3-month free trial — full Growth features</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Start Free. Pay Only When You Scale.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            <strong className="text-slate-900 font-bold">Zero risk upfront.</strong> Experience full{" "}
            <span className="text-indigo-600 font-bold">Growth-tier features</span> for{" "}
            <strong className="text-slate-900 font-bold">3 months</strong>, or your{" "}
            <strong className="text-slate-900 font-bold">first 1,000 orders / ₹25,000 in sales</strong>{" "}
            (whichever comes first). No credit card required.
          </p>

          {/* Freshness signal (AI engines weight recency) */}
          <p className="text-[11px] text-slate-400 font-semibold">
            Last updated: {PRICING_LAST_UPDATED} · Prices verified against the official plan configs
          </p>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-500" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-500" /> Cancel anytime
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 0% platform fees forever
            </span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://dashboard.basecart.app/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>Start your free trial</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/pricing.md"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 text-[11px] font-bold text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-200 rounded-xl transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              Machine-readable pricing (.md)
            </a>
          </div>
        </div>
      </section>

      {/* ── Cited statistics band (Princeton GEO: stats + citations boost AI visibility) ── */}
      <section className="px-6 lg:px-16 py-10 bg-slate-50/60 border-y border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">0%</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Platform transaction fee on every plan — vs Shopify's 2% India surcharge (Basic) on top of gateway MDR
            </p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">₹99<span className="text-sm font-bold text-slate-400">/mo</span></p>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Starting price — versus ₹1,994/mo for Shopify Basic or ~₹4,500–12,000+/mo all-in for a WooCommerce setup
            </p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">60<span className="text-sm font-bold text-slate-400"> days</span></p>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Free trial with full Growth features — Shopify's trial is 3 days; Instamojo's free tier charges 5% + ₹3 per order
            </p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">~2<span className="text-sm font-bold text-slate-400"> min</span></p>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Setup time, no code — versus days-to-weeks of configuration on Shopify, Wix or WooCommerce
            </p>
          </div>
        </div>
      </section>

      {/* ── 4-Column Pricing Grid ── */}
      <section className="px-6 lg:px-16 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {PLANS.map((plan) => {
            const accent = accentStyles[plan.accent];
            return (
              <div
                key={plan.id}
                id={plan.id}
                className={`bg-white ${accent.border} rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative ${plan.recommended ? "shadow-xl scale-[1.02] z-10" : ""}`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-black uppercase text-[9px] tracking-widest px-3 py-0.5 rounded-full shadow-sm">
                    Recommended ⭐
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <span className={`px-3 py-1 ${accent.badge} rounded-full text-[10px] font-extrabold uppercase tracking-wider`}>
                      {plan.name}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-2">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{plan.tagline}</p>
                  </div>

                  <div className="flex items-baseline gap-1 py-2 border-y border-slate-100">
                    <span className={`text-3xl font-black ${accent.price}`}>₹{plan.price.toLocaleString("en-IN")}</span>
                    <span className="text-xs text-slate-400 font-bold uppercase">/ month</span>
                  </div>

                  <div className="space-y-2.5">
                    {plan.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <a
                    href={plan.ctaHref}
                    className={`w-full py-2.5 rounded-xl font-extrabold text-xs ${accent.cta} transition-all flex items-center justify-center gap-2`}
                  >
                    <span>Choose {plan.name.charAt(0) + plan.name.slice(1).toLowerCase()}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-slate-400 font-semibold mt-6">
          All prices in INR, billed monthly. 0% platform transaction fees on every plan — you only pay standard payment gateway charges.
        </p>
      </section>

      {/* ── Feature Comparison Table ── */}
      <section className="px-6 lg:px-16 py-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">Compare All Plan Features</h2>
            <p className="text-xs text-slate-500">
              Zero platform transaction fees across all paid tiers. Guaranteed transparent pricing.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="p-4">Feature</th>
                  <th className="p-4 text-center">Basic (₹99)</th>
                  <th className="p-4 text-center text-blue-700">Plus (₹499)</th>
                  <th className="p-4 text-center text-indigo-700">Growth (₹1,499)</th>
                  <th className="p-4 text-center">Business (₹2,999)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                <tr>
                  <td className="p-4 font-bold text-slate-900">Custom Domain (`brand.com`)</td>
                  <td className="p-4 text-center text-slate-400">—</td>
                  <td className="p-4 text-center text-emerald-600 font-bold">✓ Included</td>
                  <td className="p-4 text-center text-emerald-600 font-bold">✓ Included</td>
                  <td className="p-4 text-center text-emerald-600 font-bold">✓ Included</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Razorpay & Stripe Payment Gateways</td>
                  <td className="p-4 text-center text-emerald-600 font-bold">✓ Enabled</td>
                  <td className="p-4 text-center text-emerald-600 font-bold">✓ Enabled</td>
                  <td className="p-4 text-center text-emerald-600 font-bold">✓ Enabled</td>
                  <td className="p-4 text-center text-emerald-600 font-bold">✓ Enabled</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Product Listings Cap</td>
                  <td className="p-4 text-center font-bold text-slate-800">100 items</td>
                  <td className="p-4 text-center font-bold text-slate-800">500 items</td>
                  <td className="p-4 text-center text-emerald-600 font-bold">Unlimited</td>
                  <td className="p-4 text-center text-emerald-600 font-bold">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Shiprocket Automated Shipping & AWBs</td>
                  <td className="p-4 text-center text-slate-400">—</td>
                  <td className="p-4 text-center text-slate-400">—</td>
                  <td className="p-4 text-center text-emerald-600 font-bold">✓ Automated</td>
                  <td className="p-4 text-center text-emerald-600 font-bold">✓ Automated</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Abandoned Cart WhatsApp Recovery</td>
                  <td className="p-4 text-center text-slate-400">—</td>
                  <td className="p-4 text-center text-slate-400">—</td>
                  <td className="p-4 text-center text-emerald-600 font-bold">✓ Included</td>
                  <td className="p-4 text-center text-emerald-600 font-bold">✓ Included</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">AI Description Writer</td>
                  <td className="p-4 text-center text-slate-400">—</td>
                  <td className="p-4 text-center text-slate-400">—</td>
                  <td className="p-4 text-center text-emerald-600 font-bold">✓ Included</td>
                  <td className="p-4 text-center text-emerald-600 font-bold">✓ Included</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Staff Seats</td>
                  <td className="p-4 text-center text-slate-400">1</td>
                  <td className="p-4 text-center text-slate-400">1</td>
                  <td className="p-4 text-center font-bold text-slate-800">3</td>
                  <td className="p-4 text-center font-bold text-slate-800">5</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Developer API & Custom Scripts</td>
                  <td className="p-4 text-center text-slate-400">—</td>
                  <td className="p-4 text-center text-slate-400">—</td>
                  <td className="p-4 text-center text-slate-400">—</td>
                  <td className="p-4 text-center text-emerald-600 font-bold">✓ Included</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Platform Transaction Fee</td>
                  <td className="p-4 text-center font-bold text-emerald-600">0% Fee</td>
                  <td className="p-4 text-center font-bold text-emerald-600">0% Fee</td>
                  <td className="p-4 text-center font-bold text-emerald-600">0% Fee</td>
                  <td className="p-4 text-center font-bold text-emerald-600">0% Fee</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 lg:px-16 py-16 max-w-4xl mx-auto">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase">FAQ</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pricing Questions, Answered
            </h2>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm px-6">
            {FAQS.map((f) => (
              <FaqAccordionItem key={f.q} question={f.q} answer={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="px-6 py-20 max-w-7xl mx-auto text-center">
        <div className="bg-blue-600 rounded-3xl p-10 lg:p-16 text-white space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-[-50%] left-[-20%] w-[500px] h-[500px] rounded-full bg-blue-500 blur-3xl opacity-40" />
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight relative">
            Start free. Keep every rupee when you scale.
          </h2>
          <p className="text-sm sm:text-base text-blue-100 font-medium max-w-xl mx-auto relative">
            3 months of full Growth-plan features. No credit card required. Set up in under 2 minutes.
          </p>
          <a
            href="https://dashboard.basecart.app/signup"
            className="inline-flex items-center gap-1.5 px-6 py-3 bg-white text-blue-600 font-extrabold text-sm rounded-lg hover:bg-slate-50 transition-all shadow-md active:scale-95 relative"
          >
            Start your free trial <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
