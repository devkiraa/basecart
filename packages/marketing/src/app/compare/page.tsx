import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { COMPETITORS, COMPARE_PAIRS } from "../../data/competitors";
import { ArrowRight, Scale, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Compare E-commerce Platforms in India — Basecart",
  description: "Compare Basecart, Shopify, Dukaan, Bikayi, Instamojo, WooCommerce, and Shopaccino on pricing, zero transaction fees, UPI, and WhatsApp integration.",
  alternates: {
    canonical: "https://basecart.app/compare",
  },
};

export default function CompareIndexPage() {
  return (
    <div className="min-h-screen bg-white text-slate-600 font-sans antialiased selection:bg-blue-50 selection:text-blue-600">
      <Header />

      <section className="px-6 lg:px-16 pt-16 pb-14 bg-gradient-to-b from-[#F8FAFC]/60 to-white border-b border-slate-100 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Platform Comparison Hub</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Compare Top E-commerce Platforms
          </h1>
          <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Side-by-side technical and economic breakdowns for Indian merchants choosing between Shopify alternatives, open-source platforms, and local store builders.
          </p>
        </div>
      </section>

      <section className="px-6 lg:px-16 py-16 max-w-6xl mx-auto space-y-12">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
            Basecart vs Competitors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMPETITORS.map((c) => (
              <Link
                key={c.slug}
                href={`/vs/${c.slug}`}
                className="group p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="p-3 w-fit rounded-xl bg-blue-50 text-blue-600">
                    <Scale className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Basecart vs {c.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {c.positioning}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>Read Breakdown</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
            Head-to-Head Alternative Comparisons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COMPARE_PAIRS.map((pair) => (
              <Link
                key={pair.slug}
                href={`/compare/${pair.slug}`}
                className="group p-6 rounded-2xl bg-slate-50/50 border border-slate-200/80 hover:bg-white hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {pair.headline}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {pair.tldr}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>Compare Head-to-Head</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
