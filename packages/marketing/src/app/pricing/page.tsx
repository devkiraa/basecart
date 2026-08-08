"use client";

import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { CheckCircle, ArrowRight, Sparkles, ShieldCheck, Zap, Layers } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-650 font-sans selection:bg-blue-50 selection:text-blue-600">
      <Header />

      {/* Top Hero Umbrella Banner Section */}
      <section className="px-6 lg:px-16 pt-16 pb-12 bg-gradient-to-b from-[#F8FAFC] via-white to-white text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>Umbrella Free Trial Hook</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Start Free. Pay Only When You Scale.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            <strong className="text-slate-900 font-bold">Zero risk upfront.</strong> Experience full{" "}
            <span className="text-indigo-600 font-bold">Growth-tier features</span> for your{" "}
            <strong className="text-slate-900 font-bold">first 100 orders</strong> or{" "}
            <strong className="text-slate-900 font-bold">₹25,000 in sales</strong> (whichever comes first). No credit card required.
          </p>

          <div className="pt-2">
            <a
              href="https://dashboard.basecart.app/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>Start 100-Order Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Streamlined 3-Column Pricing Grid */}
      <section className="px-6 lg:px-16 py-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Card 1: Basic (₹99 / month) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
            <div className="space-y-6">
              <div>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  Basic
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-3">BASIC</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Ideal for Instagram sellers & WhatsApp order intake.
                </p>
              </div>

              <div className="flex items-baseline gap-1 py-2 border-y border-slate-100">
                <span className="text-3xl font-black text-slate-900">₹99</span>
                <span className="text-xs text-slate-400 font-bold uppercase">/ month</span>
              </div>

              <div className="space-y-3">
                {[
                  "Up to 100 Product Listings",
                  "Direct WhatsApp Checkout",
                  "Manual UPI & COD Order Tracking",
                  "Standard Storefront Theme",
                  "0% Platform Transaction Fees",
                ].map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-600">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <a
                href="https://dashboard.basecart.app/signup?plan=basic"
                className="w-full py-3 rounded-xl font-extrabold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <span>Choose Basic</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 2: Growth ⭐ (RECOMMENDED) (₹1,499 / month) */}
          <div className="bg-white border-2 border-indigo-600 rounded-2xl p-7 flex flex-col justify-between shadow-xl relative scale-105 z-10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-black uppercase text-[9px] tracking-widest px-4 py-1 rounded-full shadow-sm">
              Recommended ⭐
            </div>

            <div className="space-y-6">
              <div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  Growth ⭐
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-3">GROWTH</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Built for scaling D2C brands with automated shipping.
                </p>
              </div>

              <div className="flex items-baseline gap-1 py-2 border-y border-indigo-50">
                <span className="text-3xl font-black text-slate-900">₹1,499</span>
                <span className="text-xs text-slate-400 font-bold uppercase">/ month</span>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-indigo-900 pb-1 border-b border-indigo-50">
                  Everything in Basic, plus:
                </p>
                {[
                  "Custom Domain Mapping (yourbrand.com)",
                  "Razorpay & Stripe Payment Gateways",
                  "Unlimited Products & Orders",
                  "Shiprocket Automated Shipping & AWBs",
                  "Abandoned Cart Recovery (WhatsApp & Email)",
                  "AI Description Writer & Marketing Tools",
                  "Product Options Matrix (Sizes, Colors, Variants)",
                  "0% Platform Transaction Fees",
                ].map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span className={fIdx === 0 || fIdx === 1 ? "font-bold text-slate-900" : ""}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <a
                href="https://dashboard.basecart.app/signup?plan=growth"
                className="w-full py-3 rounded-xl font-extrabold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Choose Growth</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 3: Business (₹2,999 / month) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
            <div className="space-y-6">
              <div>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  Business
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-3">BUSINESS</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  For high-volume brands and multi-member teams.
                </p>
              </div>

              <div className="flex items-baseline gap-1 py-2 border-y border-slate-100">
                <span className="text-3xl font-black text-slate-900">₹2,999</span>
                <span className="text-xs text-slate-400 font-bold uppercase">/ month</span>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-purple-900 pb-1 border-b border-purple-50">
                  Everything in Growth, plus:
                </p>
                {[
                  "Multi-Staff Accounts (5 Team Seats)",
                  "Developer REST API & Custom Webhooks",
                  "Custom CSS / JS Code Injection (Pixel & Scripts)",
                  "Automated GST Invoices & PDF Export",
                  "Dedicated Account Manager & Priority 24/7 Support",
                  "0% Platform Transaction Fees",
                ].map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-600">
                    <CheckCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <a
                href="https://dashboard.basecart.app/signup?plan=business"
                className="w-full py-3 rounded-xl font-extrabold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <span>Choose Business</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
