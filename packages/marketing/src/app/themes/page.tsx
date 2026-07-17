"use client";

import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Monitor, Tablet, Smartphone, ArrowRight } from "lucide-react";

export default function ThemesPage() {
  return (
    <div className="min-h-screen bg-white text-slate-650 font-sans selection:bg-blue-50 selection:text-blue-600">
      <Header />

      {/* Hero Section */}
      <section className="px-6 lg:px-16 pt-16 pb-20 bg-gradient-to-b from-[#F8FAFC]/50 to-white text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase">THEMES</span>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Designed for high performance & clean layouts
          </h1>
          <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Beautiful, conversion-optimized headless templates built to load instantly on any mobile or desktop screen.
          </p>
        </div>
      </section>

      {/* Themes Grid */}
      <section className="px-6 lg:px-16 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: "Aura Minimalist",
              category: "Minimal / Clean",
              desc: "A pure aesthetic theme featuring spacious grids, large product image frames, and clean typography. Perfect for fashion and watch houses.",
              image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&auto=format&fit=crop&q=80",
            },
            {
              name: "Quantum Dark",
              category: "Dark Mode / Tech",
              desc: "A futuristic dark layout optimized for tech, gadgets, and gaming gear. Bold headings and neon accents highlight premium features.",
              image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop&q=80",
            },
            {
              name: "Zen Organic",
              category: "Natural / Earthy",
              desc: "Soft colors, warm tones, and rounded card borders make this layout ideal for organic food, beauty care, and wellness boutiques.",
              image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&auto=format&fit=crop&q=80",
            }
          ].map((theme, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="relative aspect-video w-full bg-slate-100">
                  <img src={theme.image} alt={theme.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6 space-y-3">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">{theme.category}</span>
                  <h3 className="text-lg font-black text-slate-900">{theme.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">{theme.desc}</p>
                </div>
              </div>
              <div className="p-6 pt-0 border-t border-slate-50 mt-4 flex items-center justify-between">
                <div className="flex gap-2 text-slate-400">
                  <Monitor className="h-4 w-4" />
                  <Tablet className="h-4 w-4" />
                  <Smartphone className="h-4 w-4" />
                </div>
                <a 
                  href="/signup"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                >
                  Use Theme <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
