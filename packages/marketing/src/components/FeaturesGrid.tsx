"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  MessageCircle,
  Truck,
  BarChart3,
  Globe,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: CreditCard,
    title: "Instant UPI & COD",
    desc: "Accept Razorpay, Cashfree, UPI payments instantly. Offer Cash on Delivery with automated verification for local customers.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Automation",
    desc: "Auto-dispatch order confirmations, payment receipts, and shipping updates via WhatsApp. No manual DM management.",
  },
  {
    icon: Truck,
    title: "Shiprocket & Local Courier",
    desc: "One-click AWB generation with Shiprocket, Delhivery, DTDC. Schedule doorstep pickups across Kerala & South India.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    desc: "Track revenue, orders, and customer behavior with live real-time analytics. Make data-driven decisions instantly.",
  },
  {
    icon: Globe,
    title: "Custom Domain & SSL",
    desc: "Connect yourbrand.in or yourbrand.com in under 2 minutes. Free auto-provisioned SSL certificate for secure browsing.",
  },
  {
    icon: Shield,
    title: "Zero Transaction Fees",
    desc: "Unlike Shopify's 2% transaction fees, Basecart charges absolutely zero. Keep 100% of your hard-earned revenue.",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="py-28 px-6 lg:px-16 bg-white border-b border-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-5"
        >
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Features
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Everything you need to sell online{" "}
            <span className="text-blue-600">in India</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
            Built from the ground up for Indian merchants. No bloat, no
            complexity—just the tools that actually matter for your business.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="group bg-white border border-slate-200 rounded-2xl p-7 space-y-4 transition-colors duration-300 hover:border-slate-300 cursor-default"
              >
                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Icon className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
