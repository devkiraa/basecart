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

      {/* 4-Column Pricing Grid */}
      <section className="px-6 lg:px-16 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {/* Card 1: Basic (₹99 / month) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
            <div className="space-y-5">
              <div>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  Basic
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">BASIC</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Ideal for Instagram sellers & WhatsApp order intake.
                </p>
              </div>

              <div className="flex items-baseline gap-1 py-2 border-y border-slate-100">
                <span className="text-3xl font-black text-slate-900">₹99</span>
                <span className="text-xs text-slate-400 font-bold uppercase">/ month</span>
              </div>

              <div className="space-y-2.5">
                {[
                  "Up to 100 Product Listings",
                  "Direct WhatsApp Checkout",
                  "Razorpay & Stripe Payment Gateways",
                  "Manual UPI & COD Tracking",
                  "Standard Storefront Theme",
                  "0% Platform Transaction Fees",
                ].map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <a
                href="https://dashboard.basecart.app/signup?plan=basic"
                className="w-full py-2.5 rounded-xl font-extrabold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <span>Choose Basic</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 2: Plus (₹499 / month) */}
          <div className="bg-white border border-blue-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
            <div className="space-y-5">
              <div>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  Plus
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">PLUS</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Full custom domain website for growing D2C stores.
                </p>
              </div>

              <div className="flex items-baseline gap-1 py-2 border-y border-blue-50">
                <span className="text-3xl font-black text-blue-600">₹499</span>
                <span className="text-xs text-slate-400 font-bold uppercase">/ month</span>
              </div>

              <div className="space-y-2.5">
                {[
                  "Custom Domain Mapping (yourbrand.com)",
                  "Razorpay & Stripe Payment Gateways",
                  "Up to 500 Product Listings",
                  "Custom Storefront Themes",
                  "Direct WhatsApp & Email Notifications",
                  "0% Platform Transaction Fees",
                ].map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className={fIdx === 0 ? "font-bold text-slate-900" : ""}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <a
                href="https://dashboard.basecart.app/signup?plan=plus"
                className="w-full py-2.5 rounded-xl font-extrabold text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <span>Choose Plus</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 3: Growth ⭐ (RECOMMENDED) (₹1,499 / month) */}
          <div className="bg-white border-2 border-indigo-600 rounded-2xl p-6 flex flex-col justify-between shadow-xl relative scale-102 z-10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-black uppercase text-[9px] tracking-widest px-3 py-0.5 rounded-full shadow-sm">
              Recommended ⭐
            </div>

            <div className="space-y-5">
              <div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  Growth ⭐
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">GROWTH</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Built for scaling D2C brands with automated shipping.
                </p>
              </div>

              <div className="flex items-baseline gap-1 py-2 border-y border-indigo-50">
                <span className="text-3xl font-black text-slate-900">₹1,499</span>
                <span className="text-xs text-slate-400 font-bold uppercase">/ month</span>
              </div>

              <div className="space-y-2.5">
                {[
                  "Custom Domain Mapping (yourbrand.com)",
                  "Razorpay & Stripe Payment Gateways",
                  "Unlimited Products & Orders",
                  "Shiprocket Automated Shipping & AWBs",
                  "Abandoned Cart Recovery (WhatsApp & Email)",
                  "AI Description Writer & Marketing Tools",
                  "Product Options Matrix (Sizes, Colors)",
                  "0% Platform Transaction Fees",
                ].map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span className={fIdx === 0 || fIdx === 3 ? "font-bold text-slate-900" : ""}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <a
                href="https://dashboard.basecart.app/signup?plan=growth"
                className="w-full py-2.5 rounded-xl font-extrabold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Choose Growth</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 4: Business (₹2,999 / month) */}
          <div className="bg-white border border-purple-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
            <div className="space-y-5">
              <div>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  Business
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">BUSINESS</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  For high-volume brands and multi-member teams.
                </p>
              </div>

              <div className="flex items-baseline gap-1 py-2 border-y border-purple-50">
                <span className="text-3xl font-black text-purple-900">₹2,999</span>
                <span className="text-xs text-slate-400 font-bold uppercase">/ month</span>
              </div>

              <div className="space-y-2.5">
                {[
                  "Multi-Staff Accounts (5 Team Seats)",
                  "Developer REST API & Custom Webhooks",
                  "Custom CSS / JS Code Injection",
                  "Automated GST Invoices & PDF Export",
                  "Dedicated Account Manager & 24/7 Support",
                  "0% Platform Transaction Fees",
                ].map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <a
                href="https://dashboard.basecart.app/signup?plan=business"
                className="w-full py-2.5 rounded-xl font-extrabold text-xs bg-purple-50 hover:bg-purple-100 text-purple-800 transition-all flex items-center justify-center gap-2"
              >
                <span>Choose Business</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
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

      <Footer />
    </div>
  );
}
