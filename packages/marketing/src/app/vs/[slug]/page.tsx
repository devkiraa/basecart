import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Scale,
  Zap,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  Minus,
} from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import {
  BASECART,
  getCompetitor,
  COMPETITORS,
  COMPARE_PAIRS,
  comparePairsFor,
  relatedCompetitors,
  type Competitor,
} from "../../../data/competitors";
import { PRICING_LAST_UPDATED } from "../../../data/plans";

interface Props {
  params: {
    slug: string;
  };
}

// ── Static generation ────────────────────────────────────────
export function generateStaticParams() {
  return COMPETITORS.map((c) => ({ slug: c.slug }));
}

// ── Metadata (target keywords: "Basecart vs X", "X alternative") ──
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const competitor = getCompetitor(params.slug);
  if (!competitor) return {};

  const title = `Basecart vs ${competitor.name} (2026): Honest Comparison for Indian Sellers`;
  const description = `Comparing Basecart vs ${competitor.name} for Indian e-commerce? We break down pricing, transaction fees, UPI/COD support, WhatsApp ordering, shipping automation and who each platform is really for. Start your 3-month free trial.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/vs/${competitor.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://basecart.app/vs/${competitor.slug}`,
      siteName: "Basecart",
      type: "website",
      images: [
        {
          url: "/basecart_dashboard_mockup.png",
          width: 1200,
          height: 630,
          alt: `Basecart vs ${competitor.name}`,
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

// ── Table renderer (shared) ──────────────────────────────────
function ComparisonTable({ competitor }: { competitor: Competitor }) {
  const rows = [
    { label: "Starting price", basecart: BASECART.startingPrice, them: competitor.atAGlance.startingPrice },
    { label: "Platform transaction fee", basecart: BASECART.transactionFee, them: competitor.atAGlance.transactionFee },
    { label: "Payments in India", basecart: BASECART.payments, them: competitor.atAGlance.payments },
    { label: "WhatsApp & social commerce", basecart: BASECART.whatsapp, them: competitor.atAGlance.whatsapp },
    { label: "Shipping & logistics", basecart: BASECART.shipping, them: competitor.atAGlance.shipping },
    { label: "Setup time", basecart: BASECART.setupTime, them: competitor.atAGlance.setupTime },
    { label: "Staff accounts", basecart: BASECART.staffAccounts, them: competitor.atAGlance.staffAccounts },
    { label: "Free trial", basecart: BASECART.freeTrial, them: competitor.atAGlance.freeTrial },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
      <table className="w-full min-w-[640px] text-left text-xs">
        <thead>
          <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700">
            <th className="p-4 font-black uppercase tracking-wider text-slate-500 w-40">Feature</th>
            <th className="p-4 font-black text-blue-600">Basecart</th>
            <th className="p-4 font-black text-slate-500">{competitor.name}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="p-4 font-bold text-slate-900 align-top">{row.label}</td>
              <td className="p-4 text-slate-700 font-medium align-top">
                <span className="inline-flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{row.basecart}</span>
                </span>
              </td>
              <td className="p-4 text-slate-500 font-medium align-top">{row.them}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────
export default function VsPage({ params }: Props) {
  const competitor = getCompetitor(params.slug);

  if (!competitor) {
    notFound();
  }

  const relatedPairs = comparePairsFor(competitor.slug);
  const moreCompetitors = relatedCompetitors(competitor.slug, 3);

  // JSON-LD: breadcrumb + FAQ schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: competitor.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://basecart.app" },
      { "@type": "ListItem", position: 2, name: "Compare", item: "https://basecart.app/vs" },
      {
        "@type": "ListItem",
        position: 3,
        name: `Basecart vs ${competitor.name}`,
        item: `https://basecart.app/vs/${competitor.slug}`,
      },
    ],
  };

  const schemaHtml = JSON.stringify([breadcrumbSchema, faqSchema])
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

      {/* ── Hero / TL;DR ── */}
      <section className="px-6 lg:px-16 pt-16 pb-14 bg-gradient-to-b from-[#F8FAFC]/60 to-white border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-15%] w-[500px] h-[500px] rounded-full bg-blue-50/40 blur-3xl opacity-60 -z-10" />
        <div className="max-w-7xl mx-auto space-y-6">
          <nav className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 flex-wrap">
            <a href="/vs" className="hover:text-blue-600 transition-colors">Compare</a>
            <span>/</span>
            <span className="text-blue-600">Basecart vs {competitor.name}</span>
          </nav>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight max-w-3xl">
            Basecart vs {competitor.name}:{" "}
            <span className="text-blue-600">The Honest Comparison for Indian Sellers</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-500 font-medium max-w-3xl leading-relaxed">
            <strong className="text-slate-900 font-bold">{competitor.name}</strong> is {competitor.positioning}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="/signup"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md shadow-blue-500/10 transition-all text-sm active:scale-95 inline-flex items-center gap-2"
            >
            Start 3-month free trial <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href={`/vs/${competitor.slug}#comparison`}
              className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold rounded-lg transition-all text-sm"
            >
              Jump to comparison
            </a>
          </div>
        </div>
      </section>

      {/* ── At-a-glance comparison table ── */}
      <section id="comparison" className="px-6 lg:px-16 py-16 max-w-7xl mx-auto scroll-mt-24">
        <div className="space-y-6">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-black uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" /> At a glance
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Basecart vs {competitor.name}: Key Differences
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Verified against publicly listed pricing and review themes. Last updated: {PRICING_LAST_UPDATED} — always confirm on official sites.
            </p>
          </div>
          <ComparisonTable competitor={competitor} />
        </div>
      </section>

      {/* ── Detailed category comparison ── */}
      <section className="px-6 lg:px-16 py-16 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase">Deep dive</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How Basecart and {competitor.name} Compare, Point by Point
            </h2>
          </div>

          <div className="space-y-6">
            {competitor.detailedCategories.map((cat, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-blue-600 text-white text-xs flex items-center justify-center font-black shrink-0">
                    {i + 1}
                  </span>
                  {cat.name}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Basecart</p>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{cat.basecart}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{competitor.name}</p>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{cat.competitor}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-2 text-xs font-semibold text-slate-800 bg-amber-50/70 border border-amber-100 rounded-xl px-4 py-3">
                  <span className="text-amber-500 font-black shrink-0">Verdict:</span>
                  <span>{cat.verdict}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="px-6 lg:px-16 py-16 max-w-7xl mx-auto">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase">Who it&apos;s for</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Be honest: who should pick which?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl mx-auto">
              Different tools fit different businesses. Here&apos;s an honest read on both.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-[-40%] right-[-20%] w-[300px] h-[300px] rounded-full bg-blue-500 blur-3xl opacity-40" />
              <h3 className="text-lg font-black mb-3 relative">Basecart is best for…</h3>
              <p className="text-sm leading-relaxed opacity-95 font-medium relative">{competitor.basecartBestFor}</p>
              <div className="mt-5 pt-5 border-t border-white/20 space-y-2 text-sm font-semibold relative">
                <p className="flex items-start gap-2">
                  <Zap className="w-4 h-4 shrink-0 mt-0.5 text-amber-300" />
                  <span>Launch in ~2 minutes, no code, no plugins</span>
                </p>
                <p className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-amber-300" />
                  <span>3-month free trial — no credit card required</span>
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-3">{competitor.name} is best for…</h3>
              <p className="text-sm leading-relaxed text-slate-600 font-medium">{competitor.bestFor}</p>
              <div className="mt-5 pt-5 border-t border-slate-100 space-y-2 text-sm font-semibold text-slate-700">
                <p className="flex items-start gap-2">
                  <Minus className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                  <span>{competitor.notIdealFor}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Strengths / weaknesses / complaints */}
          <div className="grid md:grid-cols-3 gap-6 pt-2">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-600 mb-4">{competitor.name} strengths</h3>
              <ul className="space-y-2.5">
                {competitor.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-rose-500 mb-4">{competitor.name} weaknesses</h3>
              <ul className="space-y-2.5">
                {competitor.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-500 mb-4">What users complain about</h3>
              <ul className="space-y-2.5">
                {competitor.commonComplaints.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                    <Minus className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Migration ── */}
      <section className="px-6 lg:px-16 py-16 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-2 text-[11px] font-black tracking-widest text-blue-600 uppercase">
              <RefreshCw className="w-3.5 h-3.5" /> Migration
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Switching from {competitor.name} to Basecart
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Most merchants complete the move in under a day. Here&apos;s what transfers.
            </p>
          </div>

          <ol className="space-y-4">
            {competitor.migrationNotes.map((step, i) => (
              <li key={i} className="flex items-start gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-700 font-medium leading-relaxed pt-1.5">{step}</p>
              </li>
            ))}
          </ol>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <p className="text-sm text-slate-700 font-semibold">
              <span className="text-blue-600 font-black">Free migration support.</span> Our team helps you import your catalog, connect your domain and go live — on any plan.
            </p>
            <a
              href="/signup"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all text-sm text-center sm:whitespace-nowrap"
            >
              Start free trial
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
              Basecart vs {competitor.name}: Common Questions
            </h2>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            {competitor.faqs.map((f, i) => (
              <div key={i} className="p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-2">{f.q}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Related pages / internal linking ── */}
      <section className="px-6 lg:px-16 py-16 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase">Keep comparing</span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">More comparisons</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {relatedPairs.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
                  {competitor.name} vs others
                </h3>
                <div className="space-y-2">
                  {relatedPairs.map((p) => {
                    const a = getCompetitor(p.a);
                    const b = getCompetitor(p.b);
                    if (!a || !b) return null;
                    return (
                      <a
                        key={p.slug}
                        href={`/compare/${p.slug}`}
                        className="flex items-center justify-between gap-3 text-sm font-bold text-slate-700 hover:text-blue-600 py-2.5 px-4 rounded-lg hover:bg-blue-50/60 transition-colors"
                      >
                        <span>{a.name} vs {b.name}</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">More vs pages</h3>
              <div className="space-y-2">
                {moreCompetitors.map((c) => (
                  <a
                    key={c.slug}
                    href={`/vs/${c.slug}`}
                    className="flex items-center justify-between gap-3 text-sm font-bold text-slate-700 hover:text-blue-600 py-2.5 px-4 rounded-lg hover:bg-blue-50/60 transition-colors"
                  >
                    <span>Basecart vs {c.name}</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20 max-w-7xl mx-auto text-center">
        <div className="bg-blue-600 rounded-3xl p-10 lg:p-16 text-white space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-[-50%] left-[-20%] w-[500px] h-[500px] rounded-full bg-blue-500 blur-3xl opacity-40" />
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight relative">
            See for yourself why sellers switch from {competitor.name} to Basecart
          </h2>
          <p className="text-sm sm:text-base text-blue-100 font-medium max-w-xl mx-auto relative">
            Full Growth-plan features for 3 months. No credit card required. Set up in under 2 minutes.
          </p>
          <a
            href="/signup"
            className="inline-flex items-center gap-1.5 px-6 py-3 bg-white text-blue-600 font-extrabold text-sm rounded-lg hover:bg-slate-50 transition-all shadow-md active:scale-95 relative"
          >
            Start your 60-day free trial <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
