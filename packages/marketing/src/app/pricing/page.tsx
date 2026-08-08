"use client";

import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { CheckCircle, ArrowRight, Sparkles, Zap, ShieldCheck, Layers } from "lucide-react";

export default function PricingPage() {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    fetch(`${apiUrl}/public/plan-configs`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPlans(data);
        }
      })
      .catch((e) => {});
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-650 font-sans selection:bg-blue-50 selection:text-blue-600">
      <Header />

      {/* Hero Section */}
      <section className="px-6 lg:px-16 pt-16 pb-20 bg-gradient-to-b from-[#F8FAFC]/50 to-white text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase">PRICING & FREE TRIAL</span>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Start Free. Scale to ₹25,000 Revenue Before Paying a Single Rupee.
          </h1>
          <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            No credit card required upfront. Experience full Growth-tier features until you complete 100 orders or ₹25,000 GMV, then select the plan that fits your business.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 lg:px-16 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              title: "Free Trial (Hook)",
              price: "₹0",
              period: "first 100 orders / ₹25k GMV",
              desc: "Full Growth-tier experience with zero risk.",
              features: [
                "Growth Tier Full Access",
                "First 100 Orders OR ₹25,000 GMV",
                "Razorpay & Stripe Gateways",
                "Custom Domain Mapping",
                "AI Description Writer",
                "Celebratory Paywall Prompt"
              ],
              popular: false,
              btn: "Start Free Trial",
              highlight: "Zero Risk"
            },
            {
              title: "Tier 1: Basic",
              price: "₹99",
              period: "/ month",
              desc: "Instagram sellers, home bakers & micro-sellers.",
              features: [
                "Catalog up to 100 Products",
                "Direct WhatsApp Checkout Link",
                "Manual UPI & COD Order Tracking",
                "Low-cost Retention Tier",
                "0% Platform Fees"
              ],
              popular: false,
              btn: "Choose Basic (₹99)"
            },
            {
              title: "Tier 2: Starter",
              price: "₹399",
              period: "/ month",
              desc: "New D2C storefronts needing an official website.",
              features: [
                "Custom Domain (`yourbrand.com`)",
                "Razorpay & Stripe Gateways",
                "Up to 250 Active Products",
                "Standard Templates & Themes",
                "0% Platform Fees"
              ],
              popular: false,
              btn: "Choose Starter (₹399)"
            },
            {
              title: "Tier 3: Growth ⭐",
              price: "₹1,499",
              period: "/ month",
              desc: "Active D2C brands running ad campaigns.",
              features: [
                "Unlimited Products & Orders",
                "Shiprocket Automated Shipping & AWB",
                "Abandoned Cart Recovery",
                "AI Description Writer & Variants",
                "0% Platform Fees"
              ],
              popular: true,
              btn: "Choose Growth (₹1,499)"
            },
            {
              title: "Tier 4: Business",
              price: "₹2,999",
              period: "/ month",
              desc: "High-volume brands & team workflows.",
              features: [
                "Multi-Staff Accounts (5–10 Seats)",
                "Developer REST API & Webhooks",
                "Custom CSS / JS Code Injection",
                "Automated GST Invoices & PDF Export",
                "Priority 24/7 Support",
                "0% Platform Fees"
              ],
              popular: false,
              btn: "Choose Business (₹2,999)"
            }
          ].map((plan, idx) => (
            <div 
              key={idx} 
              className={`bg-white border rounded-2xl p-5 flex flex-col justify-between relative transition-all duration-300 ${
                plan.popular 
                  ? "border-blue-600 ring-4 ring-blue-50 scale-105 z-10 shadow-lg" 
                  : "border-slate-150 hover:border-slate-350 shadow-sm"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-black uppercase text-[8px] tracking-widest px-3 py-1 rounded-full">
                  Recommended
                </span>
              )}
              {plan.highlight && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-black uppercase text-[8px] tracking-widest px-3 py-1 rounded-full">
                  {plan.highlight}
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">{plan.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{plan.desc}</p>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <a
                  href="https://dashboard.basecart.app/signup"
                  className={`w-full py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                    plan.popular
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                  }`}
                >
                  <span>{plan.btn}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Competitive Advantages Guarantee */}
      <section className="px-6 lg:px-16 py-12 max-w-5xl mx-auto">
        <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider">
              Basecart Edge in the Indian D2C Market
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="space-y-2">
              <span className="font-bold text-emerald-400 text-sm flex items-center gap-1">
                <Zap className="w-4 h-4" /> 0% Platform Fees
              </span>
              <p className="text-slate-300 leading-relaxed">
                Shopify charges 0.5%–2.0% transaction fees on third-party Indian gateways. Basecart guarantees 0% platform fees across all paid plans.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-blue-400 text-sm flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> Full Website on ₹399 Starter
              </span>
              <p className="text-slate-300 leading-relaxed">
                Offers hosted custom domain mapping (`brand.com`) at ₹399/mo, whereas Shopify Starter limits users to buy links without a website.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-purple-400 text-sm flex items-center gap-1">
                <Layers className="w-4 h-4" /> Zero Upfront Commitment
              </span>
              <p className="text-slate-300 leading-relaxed">
                Start for ₹0 and process your first 100 orders or ₹25,000 GMV before choosing a plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
