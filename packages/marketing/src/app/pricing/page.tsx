"use client";

import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-650 font-sans selection:bg-blue-50 selection:text-blue-600">
      <Header />

      {/* Hero Section */}
      <section className="px-6 lg:px-16 pt-16 pb-20 bg-gradient-to-b from-[#F8FAFC]/50 to-white text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase">PRICING</span>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Simple, predictable plans for businesses of all sizes
          </h1>
          <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            All plans include high-performance storefronts, secure checkout, and isolated database storage. Start free and scale as you grow.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 lg:px-16 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Free",
              price: "₹0",
              desc: "Perfect for testing out ideas.",
              features: ["1 Online Store", "Up to 5 Products", "Basic Store Analytics", "Basecart Subdomain"],
              popular: false,
              btn: "Get started"
            },
            {
              title: "Starter",
              price: "₹299",
              desc: "For launch and basic setup.",
              features: ["1 Online Store", "Up to 50 Products", "Custom domain setup", "Discount Coupons", "Email support"],
              popular: false,
              btn: "Start free trial"
            },
            {
              title: "Growth",
              price: "₹699",
              desc: "For fast-scaling stores.",
              features: ["1 Online Store", "Up to 500 Products", "Abandoned Cart recovery", "Advanced reporting", "Priority support"],
              popular: true,
              btn: "Start free trial"
            },
            {
              title: "Pro",
              price: "₹1499",
              desc: "For advanced operations.",
              features: ["1 Online Store", "Unlimited Products", "API Access credentials", "Team Roles (5 members)", "SLA Support Agreement"],
              popular: false,
              btn: "Start free trial"
            }
          ].map((plan, idx) => (
            <div 
              key={idx} 
              className={`bg-white border rounded-2xl p-6 flex flex-col justify-between relative transition-all duration-300 ${
                plan.popular 
                  ? "border-blue-600 ring-4 ring-blue-50 scale-105 z-10 shadow-lg" 
                  : "border-slate-150 hover:border-slate-350 shadow-sm"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-black uppercase text-[8px] tracking-widest px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-1">{plan.title}</h3>
                  <p className="text-[11px] text-slate-400 font-bold mb-4">{plan.desc}</p>
                  <div className="flex items-baseline gap-1 select-none">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">{plan.price}</span>
                    <span className="text-xs text-slate-400 font-bold">/ month</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  {plan.features.map((feat, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <a 
                href="/signup"
                className={`w-full mt-8 py-2.5 rounded-lg text-xs font-bold text-center block transition-all active:scale-95 ${
                  plan.popular 
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10" 
                    : "border border-slate-200 text-slate-800 hover:bg-slate-50"
                }`}
              >
                {plan.btn}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ block */}
      <section className="bg-slate-50/50 border-y border-slate-100 py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-8 text-left">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-8">Pricing FAQ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Are there transaction setup fees?</h4>
              <p className="text-xs text-slate-550 text-slate-500 leading-relaxed font-semibold">No, Basecart does not charge any setup or subscription transaction fees. You only pay standard gateway processing fees to Stripe/Razorpay.</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Can I cancel my subscription?</h4>
              <p className="text-xs text-slate-550 text-slate-500 leading-relaxed font-semibold">Yes, you can downgrade, upgrade, or cancel your subscription at any time directly in your account billing settings.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
