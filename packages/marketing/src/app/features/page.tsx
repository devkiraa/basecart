"use client";

import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ShoppingBag, Package, ShoppingCart, CreditCard, TrendingUp, Users, ArrowRight, ShieldCheck, Cpu } from "lucide-react";

export default function FeaturesPage() {
  const merchantDashboardUrl = process.env.NEXT_PUBLIC_MERCHANT_DASHBOARD_URL || "http://localhost:3004";

  return (
    <div className="min-h-screen bg-white text-slate-650 font-sans selection:bg-blue-50 selection:text-blue-600">
      <Header />

      {/* Hero Section */}
      <section className="px-6 lg:px-16 pt-16 pb-20 bg-gradient-to-b from-[#F8FAFC]/50 to-white text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase">FEATURES</span>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Everything you need to launch and scale your e-commerce store
          </h1>
          <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Basecart provides the complete infrastructure to manage your store catalog, process payments securely, fulfill orders, and track growth.
          </p>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="px-6 lg:px-16 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Storefront Builder",
              desc: "Deploy beautiful, lightning-fast headless storefronts in seconds. Customize branding, colors, logos, and hero copy with zero code.",
              icon: <ShoppingBag className="h-6 w-6 text-blue-600" />
            },
            {
              title: "Catalog Management",
              desc: "Add multiple product images, SKUs, compare-at pricing, inventory weights, categories, and generate complex options like sizes or colors.",
              icon: <Package className="h-6 w-6 text-blue-600" />
            },
            {
              title: "Isolated Tenant Databases",
              desc: "Every merchant gets their own isolated SQLite database via Cloudflare Durable Objects. Maximum data privacy, zero noisy-neighbor problems.",
              icon: <Cpu className="h-6 w-6 text-blue-600" />
            },
            {
              title: "Unified Checkout",
              desc: "Pre-integrated checkout workflows with Stripe and Razorpay. Support currency management, secure processing, and immediate order placement.",
              icon: <CreditCard className="h-6 w-6 text-blue-600" />
            },
            {
              title: "Order Fulfillment",
              desc: "Fulfill orders, track shipping states (paid, shipped, delivered, cancelled), write tracking numbers, and email PDF receipts automatically.",
              icon: <ShoppingCart className="h-6 w-6 text-blue-600" />
            },
            {
              title: "Advanced Analytics",
              desc: "Get real-time indicators for total revenue, average order value (AOV), total order count, and sales trends from the control panel.",
              icon: <TrendingUp className="h-6 w-6 text-blue-600" />
            },
            {
              title: "Team Permissions",
              desc: "Invite colleagues to help manage your catalog and orders with roles like Manager or Billing Agent, keeping sensitive settings protected.",
              icon: <Users className="h-6 w-6 text-blue-600" />
            },
            {
              title: "Security Shield",
              desc: "Automatic SSL, DDoS mitigation, and global distribution via Cloudflare's edge network, guaranteeing 99.9% availability.",
              icon: <ShieldCheck className="h-6 w-6 text-blue-600" />
            }
          ].map((feat, idx) => (
            <div key={idx} className="bg-white border border-slate-100 p-8 rounded-2xl hover:shadow-xl hover:border-slate-200 transition-all group duration-300">
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 max-w-5xl mx-auto text-center">
        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-10 lg:p-12 space-y-6">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Experience the performance of Basecart</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Start your 14-day free trial today. No credit card required, set up in under 2 minutes.</p>
          <a 
            href="/signup" 
            className="inline-flex items-center gap-1.5 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all active:scale-95 shadow-md shadow-blue-500/10"
          >
            Get started for free <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
