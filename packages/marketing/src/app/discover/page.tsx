import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Store, ArrowRight, MapPin, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Discover Local E-commerce Solutions — Basecart",
  description: "Explore how Basecart empowers clothing boutiques, home bakers, and regional merchants across Kerala & South India with automated WhatsApp storefronts.",
  alternates: {
    canonical: "https://basecart.app/discover",
  },
};

const niches = [
  {
    slug: "clothing-boutiques-kerala",
    title: "Clothing Boutiques in Kerala",
    description: "Automate Instagram DM orders, garment cataloging, and regional courier dispatch for Kerala fashion boutiques.",
    location: "Kerala",
  },
  {
    slug: "home-bakers-kochi",
    title: "Home Bakers in Kochi",
    description: "Accept custom cake orders, instant UPI payments, and coordinate local delivery across Kochi.",
    location: "Kochi, Kerala",
  },
  {
    slug: "saree-designers-thrissur",
    title: "Saree Designers in Thrissur",
    description: "Digital store builder for boutique saree makers with variant management and automated COD verification.",
    location: "Thrissur, Kerala",
  },
];

export default function DiscoverIndexPage() {
  return (
    <div className="min-h-screen bg-white text-slate-600 font-sans antialiased selection:bg-blue-50 selection:text-blue-600">
      <Header />

      <section className="px-6 lg:px-16 pt-16 pb-14 bg-gradient-to-b from-[#F8FAFC]/60 to-white border-b border-slate-100 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Regional E-commerce Solutions</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Tailored E-Commerce for Regional Brands
          </h1>
          <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Discover specialized storefront tooling engineered for Indian SMBs, local boutiques, and WhatsApp merchants.
          </p>
        </div>
      </section>

      <section className="px-6 lg:px-16 py-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {niches.map((item) => (
            <Link
              key={item.slug}
              href={`/discover/${item.slug}`}
              className="group p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                    <Store className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {item.location}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>View Solution</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
