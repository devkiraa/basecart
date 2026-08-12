import React from "react";
import { Metadata } from "next";
import { ArrowRight, Scale, ArrowLeftRight } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  COMPETITORS,
  COMPARE_PAIRS,
  getCompetitor,
} from "../../data/competitors";

export const metadata: Metadata = {
  title: "Basecart Comparisons & Alternatives for Indian Sellers (2026)",
  description:
    "Honest, researched comparisons of Basecart vs Shopify, WooCommerce, Instamojo, StoreHippo, Wix, Zyro, BigCommerce, Meesho and Shopsy — pricing, transaction fees, UPI/COD, WhatsApp commerce and who each is really for.",
  alternates: {
    canonical: "/vs",
  },
  openGraph: {
    title: "Basecart Comparisons & Alternatives for Indian Sellers",
    description:
      "Compare Basecart against Shopify, WooCommerce, Instamojo, Meesho and more — pricing, fees, payments and shipping, researched for Indian merchants.",
    url: "https://basecart.app/vs",
    siteName: "Basecart",
    type: "website",
    images: [
      {
        url: "/basecart_dashboard_mockup.png",
        width: 1200,
        height: 630,
        alt: "Basecart competitor comparisons",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Basecart Comparisons & Alternatives for Indian Sellers",
    description:
      "Compare Basecart against Shopify, WooCommerce, Instamojo, Meesho and more.",
    images: ["/basecart_dashboard_mockup.png"],
  },
};

export default function VsHubPage() {
  return (
    <div className="min-h-screen bg-white text-slate-600 font-sans antialiased overflow-x-hidden selection:bg-blue-50 selection:text-blue-600">
      <Header />

      {/* ── Hero ── */}
      <section className="px-6 lg:px-16 pt-16 pb-14 bg-gradient-to-b from-[#F8FAFC]/60 to-white border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-15%] w-[500px] h-[500px] rounded-full bg-blue-50/40 blur-3xl opacity-60 -z-10" />
        <div className="max-w-7xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-black uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" /> Comparison hub
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight max-w-3xl">
            Basecart vs the rest:{" "}
            <span className="text-blue-600">honest comparisons for Indian sellers</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium max-w-3xl leading-relaxed">
            Every comparison below is researched from publicly listed pricing and real review themes as of
            August 2026 — pricing, transaction fees, UPI/COD support, WhatsApp commerce, shipping automation
            and who each platform is genuinely best for.
          </p>
        </div>
      </section>

      {/* ── Basecart vs Competitor grid ── */}
      <section className="px-6 lg:px-16 py-16 max-w-7xl mx-auto">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase">Direct comparisons</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Basecart vs [Competitor]
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMPETITORS.map((c) => (
              <a
                key={c.slug}
                href={`/vs/${c.slug}`}
                className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors">
                    Basecart vs {c.name}
                  </p>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{c.category}</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3">{c.positioning}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Competitor vs Competitor ── */}
      <section className="px-6 lg:px-16 py-16 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-2 text-[11px] font-black tracking-widest text-blue-600 uppercase">
              <ArrowLeftRight className="w-3.5 h-3.5" /> Third-option comparisons
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Competitor vs Competitor — with Basecart as the third option
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl mx-auto">
              Weighing two other platforms? We compare them fairly, then show where Basecart fits.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {COMPARE_PAIRS.map((p) => {
              const a = getCompetitor(p.a);
              const b = getCompetitor(p.b);
              if (!a || !b) return null;
              return (
                <a
                  key={p.slug}
                  href={`/compare/${p.slug}`}
                  className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors">
                      {a.name} vs {b.name}
                    </p>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3">{p.tldr}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20 max-w-7xl mx-auto text-center">
        <div className="bg-blue-600 rounded-3xl p-10 lg:p-16 text-white space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-[-50%] left-[-20%] w-[500px] h-[500px] rounded-full bg-blue-500 blur-3xl opacity-40" />
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight relative">
            Stop comparing — start selling
          </h2>
          <p className="text-sm sm:text-base text-blue-100 font-medium max-w-xl mx-auto relative">
            Full Growth-plan features for 3 months. No credit card required. Set up in under 2 minutes.
          </p>
          <a
            href="/signup"
            className="inline-flex items-center gap-1.5 px-6 py-3 bg-white text-blue-600 font-extrabold text-sm rounded-lg hover:bg-slate-50 transition-all shadow-md active:scale-95 relative"
          >
            Start your 3-month free trial <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
