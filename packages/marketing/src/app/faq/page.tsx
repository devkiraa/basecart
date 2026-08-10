"use client";

import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      q: "What makes Basecart different from other e-commerce builders?",
      a: "Basecart implements isolated tenant databases via Cloudflare Durable Objects. Instead of storing all merchants in a single massive database table, every store gets its own private SQLite database. This guarantees high security, no database noisy-neighbor problems, and maximum query performance."
    },
    {
      q: "Can I use my own custom domain?",
      a: "Yes! Starting from our Plus plan, you can map your own custom domain (e.g. yourstore.com) to your storefront. We provide automatic SSL certificate generation and global CDN hosting via Cloudflare."
    },
    {
      q: "Are there any hidden transaction fees?",
      a: "No. Basecart does not charge any transaction fees. You only pay the standard payment gateway fees directly to Razorpay or Stripe."
    },
    {
      q: "What payment gateways are supported?",
      a: "We support Stripe and Razorpay out of the box. This allows you to collect payments globally and inside India via UPI, Cards, Netbanking, and Wallets."
    },
    {
      q: "How does the 60-Day Free Trial work?",
      a: "Every new merchant automatically receives a 60-Day Free Trial with full Growth Plan features (unlimited products, AI tools, custom domain, Razorpay payments). No credit card is required to sign up."
    },
    {
      q: "What happens when the 60-day trial expires?",
      a: "If you do not choose a plan after 60 days, your customer-facing storefront is paused, but your merchant dashboard, catalog data, and orders remain safe. You can log in and upgrade anytime to reactivate your store."
    }
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-slate-650 font-sans selection:bg-blue-50 selection:text-blue-600">
      <Header />

      {/* Hero Section */}
      <section className="px-6 lg:px-16 pt-16 pb-20 bg-gradient-to-b from-[#F8FAFC]/50 to-white text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase">FAQ</span>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions about Basecart's database setups, domains, billing, and checkout.
          </p>
        </div>
      </section>

      {/* Accordion List */}
      <section className="px-6 py-12 max-w-3xl mx-auto">
        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div 
                key={idx} 
                className="border border-slate-150 rounded-xl overflow-hidden shadow-sm bg-white"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full px-6 py-5 text-left font-bold text-slate-900 flex justify-between items-center text-sm sm:text-base focus:outline-none"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed border-t border-slate-50 pt-4 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}
