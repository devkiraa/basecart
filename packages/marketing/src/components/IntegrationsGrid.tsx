import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, MessageCircle, Cloud, Truck, Mail } from "lucide-react";

export default function IntegrationsGrid() {
  const partners = [
    { name: "UPI", category: "Instant Payments", color: "bg-blue-50 text-blue-600 border-blue-100", logo: "/logos/upi.svg" },
    { name: "Razorpay", category: "UPI & Payments", color: "bg-indigo-50 text-indigo-600 border-indigo-100", logo: "/logos/razorpay.svg" },
    { name: "Shiprocket", category: "Logistics & AWBs", color: "bg-orange-50 text-orange-600 border-orange-100", logo: "/logos/shiprocket.svg" },
    { name: "WhatsApp", category: "Orders & Alerts", color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: MessageCircle },
    { name: "Speed Post & DTDC", category: "Regional Courier", color: "bg-amber-50 text-amber-600 border-amber-100", icon: Truck },
    { name: "Delhivery", category: "Pan-India Courier", color: "bg-red-50 text-red-600 border-red-100", icon: Truck },
    { name: "Resend", category: "PDF Invoices & Mail", color: "bg-slate-100 text-slate-800 border-slate-200", icon: Mail },
  ];

  return (
    <section className="py-24 px-6 lg:px-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Left Column: 3x2 Grid of Partners */}
        <div className="w-full lg:w-1/2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {partners.map((p, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border ${p.color} flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition-all`}
            >
              <div className="w-12 h-12 rounded-lg bg-white/80 shadow-sm flex items-center justify-center">
                {p.logo ? (
                  <Image
                    src={p.logo}
                    alt={`${p.name} logo`}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                ) : p.icon ? (
                  <p.icon className="w-5 h-5 text-current" />
                ) : (
                  <div className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                <span className="text-[10px] font-semibold text-slate-500">{p.category}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Copy & CTA */}
        <div className="w-full lg:w-1/2 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Connected Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Pre-Integrated with India&apos;s Best Infrastructure
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
            Zero custom coding or expensive app marketplace plugins. Connect your existing Razorpay, Shiprocket, and WhatsApp credentials in under 2 minutes.
          </p>
          <div className="pt-2">
            <Link
              href="/integrations"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>Explore All 15+ Integrations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
