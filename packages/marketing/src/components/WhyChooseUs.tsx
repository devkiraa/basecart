import React from "react";
import { ArrowRight, ShieldCheck, Zap, Percent, Globe } from "lucide-react";

export default function WhyChooseUs() {
  const points = [
    {
      title: "0% Transaction Fees",
      desc: "Keep 100% of your hard-earned profits. Pay only standard Razorpay payment gateway MDR.",
      icon: <Percent className="w-5 h-5 text-blue-600" />,
    },
    {
      title: "Native Shiprocket AWBs",
      desc: "Generate shipping labels and schedule local doorstep pickup across Kerala & India in 1-click.",
      icon: <Zap className="w-5 h-5 text-blue-600" />,
    },
    {
      title: "Isolated Tenant Security",
      desc: "Every store runs inside its own private Cloudflare SQLite database isolate with AES-256 encryption.",
      icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
    },
    {
      title: "Multi-Language Ready",
      desc: "Offer customer checkout and WhatsApp notifications in Malayalam, Tamil, and English.",
      icon: <Globe className="w-5 h-5 text-blue-600" />,
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-16 bg-slate-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Left Column: Heading & Primary CTA */}
        <div className="w-full lg:w-5/12 space-y-6 text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">WHY BASECART</span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Built for Growth Without Platform Taxes
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
            Stop losing 2% per order to international platform transaction fees. Basecart provides enterprise-grade infrastructure tailored for Indian merchants at flat, predictable pricing.
          </p>
          <div className="pt-2">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-500/10 active:scale-95"
            >
              <span>Start 3-Month Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Right Column: 2x2 Grid */}
        <div className="w-full lg:w-7/12 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {points.map((pt, idx) => (
            <div key={idx} className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                {pt.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900">{pt.title}</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">{pt.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
