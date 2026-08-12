import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ArrowRight, Scale, HelpCircle, Sparkles } from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import {
  BASECART,
  getCompetitor,
  getComparePair,
  COMPARE_PAIRS,
  COMPETITORS,
} from "../../../data/competitors";
import { PRICING_LAST_UPDATED } from "../../../data/plans";

interface Props {
  params: {
    slug: string;
  };
}

// ── Static generation ────────────────────────────────────────
export function generateStaticParams() {
  return COMPARE_PAIRS.map((p) => ({ slug: p.slug }));
}

// ── Metadata ─────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pair = getComparePair(params.slug);
  if (!pair) return {};
  const a = getCompetitor(pair.a);
  const b = getCompetitor(pair.b);
  if (!a || !b) return {};

  const title = pair.headline;
  const description = `${a.name} vs ${b.name} for Indian e-commerce — we compare pricing, transaction fees, UPI/COD support, WhatsApp commerce, shipping automation and who each is really for. Plus why Basecart is a popular third option.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/compare/${pair.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://basecart.app/compare/${pair.slug}`,
      siteName: "Basecart",
      type: "website",
      images: [
        {
          url: "/basecart_dashboard_mockup.png",
          width: 1200,
          height: 630,
          alt: `${a.name} vs ${b.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/basecart_dashboard_mockup.png"],
    },
  };
}

export default function ComparePage({ params }: Props) {
  const pair = getComparePair(params.slug);

  if (!pair) {
    notFound();
  }

  const a = getCompetitor(pair.a);
  const b = getCompetitor(pair.b);
  if (!a || !b) {
    notFound();
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pair.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const schemaHtml = JSON.stringify(faqSchema)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  return (
    <div className="min-h-screen bg-white text-slate-600 font-sans antialiased overflow-x-hidden selection:bg-blue-50 selection:text-blue-600">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaHtml }}
      />

      <Header />

      {/* ── Hero ── */}
      <section className="px-6 lg:px-16 pt-16 pb-14 bg-gradient-to-b from-[#F8FAFC]/60 to-white border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-15%] w-[500px] h-[500px] rounded-full bg-blue-50/40 blur-3xl opacity-60 -z-10" />
        <div className="max-w-7xl mx-auto space-y-6">
          <nav className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 flex-wrap">
            <a href="/vs" className="hover:text-blue-600 transition-colors">Compare</a>
            <span>/</span>
            <span className="text-blue-600">{a.name} vs {b.name}</span>
          </nav>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl">
            {pair.headline}
          </h1>

          <p className="text-sm sm:text-base text-slate-500 font-medium max-w-3xl leading-relaxed">
            <strong className="text-slate-900 font-bold">The short version:</strong> {pair.tldr}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="/signup"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md shadow-blue-500/10 transition-all text-sm active:scale-95 inline-flex items-center gap-2"
            >
              Try the third option — Basecart <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#comparison"
              className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold rounded-lg transition-all text-sm"
            >
              Jump to comparison
            </a>
          </div>
        </div>
      </section>

      {/* ── Overview of both products ── */}
      <section className="px-6 lg:px-16 py-16 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 mb-2">{a.name}</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">{a.category}</p>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">{a.positioning}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 mb-2">{b.name}</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">{b.category}</p>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">{b.positioning}</p>
          </div>
        </div>
      </section>

      {/* ── Category comparison table ── */}
      <section id="comparison" className="px-6 lg:px-16 py-16 bg-slate-50/50 border-y border-slate-100 scroll-mt-24">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-black uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" /> Side by side
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {a.name} vs {b.name}: Detailed Comparison
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Pricing and fee data verified against publicly listed plans. Last updated: {PRICING_LAST_UPDATED}.
            </p>
          </div>

          <div className="space-y-6">
            {pair.categories.map((cat, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-blue-600 text-white text-xs flex items-center justify-center font-black shrink-0">
                    {i + 1}
                  </span>
                  {cat.name}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{a.name}</p>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{cat.a}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{b.name}</p>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{cat.b}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-2 text-xs font-semibold text-slate-800 bg-blue-50/70 border border-blue-100 rounded-xl px-4 py-3">
                  <span className="text-blue-600 font-black shrink-0">How Basecart fits:</span>
                  <span>{cat.verdict}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who each is best for ── */}
      <section className="px-6 lg:px-16 py-16 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-3">{a.name} is best for…</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">{pair.bestForA}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-3">{b.name} is best for…</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">{pair.bestForB}</p>
          </div>
        </div>
      </section>

      {/* ── Third option: Basecart ── */}
      <section className="px-6 lg:px-16 py-16 bg-gradient-to-b from-slate-50/60 to-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> The third option
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why many sellers pick Basecart instead
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
            {pair.thirdOption}
          </p>

          <div className="grid sm:grid-cols-3 gap-4 pt-4 text-left">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1.5">Pricing</p>
              <p className="text-xs text-slate-700 font-semibold">{BASECART.startingPrice} — no per-order platform fee</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1.5">Payments</p>
              <p className="text-xs text-slate-700 font-semibold">Razorpay UPI, cards, netbanking & COD — built in</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1.5">WhatsApp & shipping</p>
              <p className="text-xs text-slate-700 font-semibold">Native WhatsApp checkout + Shiprocket auto-AWB</p>
            </div>
          </div>

          <div className="pt-4">
            <a
              href="/signup"
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-lg shadow-md transition-all active:scale-95"
            >
              Start your 3-month free trial <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 lg:px-16 py-16 max-w-4xl mx-auto">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-2 text-[11px] font-black tracking-widest text-blue-600 uppercase">
              <HelpCircle className="w-3.5 h-3.5" /> FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {a.name} vs {b.name}: Common Questions
            </h2>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            {pair.faqs.map((f, i) => (
              <div key={i} className="p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-2">{f.q}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Related pages ── */}
      <section className="px-6 lg:px-16 py-16 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase">Keep comparing</span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">More comparisons</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMPARE_PAIRS.filter((p) => p.slug !== pair.slug)
              .slice(0, 3)
              .map((p) => {
                const pa = getCompetitor(p.a);
                const pb = getCompetitor(p.b);
                if (!pa || !pb) return null;
                return (
                  <a
                    key={p.slug}
                    href={`/compare/${p.slug}`}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
                  >
                    <p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors">
                      {pa.name} vs {pb.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-semibold mt-1">Read the comparison</p>
                  </a>
                );
              })}
            {COMPETITORS.filter((c) => c.slug !== pair.a && c.slug !== pair.b)
              .slice(0, 1)
              .map((c) => (
                <a
                  key={c.slug}
                  href={`/vs/${c.slug}`}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
                >
                  <p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors">
                    Basecart vs {c.name}
                  </p>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">Read the comparison</p>
                </a>
              ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20 max-w-7xl mx-auto text-center">
        <div className="bg-blue-600 rounded-3xl p-10 lg:p-16 text-white space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-[-50%] left-[-20%] w-[500px] h-[500px] rounded-full bg-blue-500 blur-3xl opacity-40" />
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight relative">
            Torn between {a.name} and {b.name}? Try the third option.
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
