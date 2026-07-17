"use client";

import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ArrowRight, Puzzle, Check } from "lucide-react";

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-650 font-sans selection:bg-blue-50 selection:text-blue-600">
      <Header />

      {/* Hero Section */}
      <section className="px-6 lg:px-16 pt-16 pb-20 bg-gradient-to-b from-[#F8FAFC]/50 to-white text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase">INTEGRATIONS</span>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Connect your store to your favorite tools
          </h1>
          <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Expand the features of your storefront and admin backend. Seamlessly process payments, automate fulfillment, and deliver fast receipts.
          </p>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="px-6 lg:px-16 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: "Razorpay Checkout",
              type: "Payment Gateway",
              desc: "Enable instant payments via UPI, card, netbanking, and wallets for your Indian merchant storefronts.",
              connected: true
            },
            {
              name: "Stripe Gateway",
              type: "Payment Gateway",
              desc: "Accept credit cards globally. Integrated checkout flow with immediate payment success webhooks.",
              connected: true
            },
            {
              name: "Shiprocket Delivery",
              type: "Logistics / Shipping",
              desc: "Automate shipping label generation, dispatch orders, write tracking links, and verify status updates.",
              connected: false
            },
            {
              name: "Zoho ZeptoMail",
              type: "Transactional Email",
              desc: "Deliver welcoming emails, verification OTP codes, and order receipt PDFs instantly with high inbox delivery.",
              connected: true
            },
            {
              name: "Google Analytics 4",
              type: "Analytics & Tracking",
              desc: "Track catalog visitors, checkout conversion rates, page views, and revenue data in real-time.",
              connected: false
            },
            {
              name: "Resend Email client",
              type: "Email Service Provider",
              desc: "Beautiful transactional emails rendered with React email, built for high deliverability and scale.",
              connected: true
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-100 p-6 rounded-2xl hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.type}</span>
                  {item.connected && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      <Check className="h-3 w-3" /> Pre-built
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">{item.desc}</p>
              </div>
              <div className="pt-6 border-t border-slate-50 mt-6 select-none">
                <a href="/signup" className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
                  Connect Integration <ArrowRight className="h-3.5 w-3.5" />
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
