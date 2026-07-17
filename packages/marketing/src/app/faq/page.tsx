"use client";

import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "What makes Basecart different from other e-commerce builders?",
      a: "Basecart implements isolated tenant databases via Cloudflare Durable Objects. Instead of storing all merchants in a single massive database table, every store gets its own private SQLite database. This guarantees high security, no database noisy-neighbor problems, and maximum query performance."
    },
    {
      q: "Can I use my own custom domain?",
      a: "Yes! Starting from our Starter plan, you can map your own custom domain (e.g. yourstore.com) to your storefront. We provide automatic SSL certificate generation and global CDN hosting via Cloudflare."
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
      q: "Do you offer a money-back guarantee?",
      a: "Yes! We offer a 14-day money-back guarantee on all our plans. You can trial the platform completely risk-free, and cancel anytime from your settings."
    }
  ];

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
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
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
