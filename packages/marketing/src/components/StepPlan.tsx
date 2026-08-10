import React from "react";
import { Check, Sparkles, ArrowRight } from "lucide-react";

interface StepPlanProps {
  data: any;
  onChange: (fields: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const PLANS = [
  {
    id: "basic",
    name: "BASIC",
    price: "₹99",
    period: "month",
    tagline: "Ideal for Instagram sellers & WhatsApp order intake.",
    features: [
      "Up to 100 Product Listings",
      "Direct WhatsApp Checkout",
      "Razorpay & Stripe Payment Gateways",
      "Manual UPI & COD Order Tracking",
      "0% Platform Transaction Fees",
    ],
  },
  {
    id: "plus",
    name: "PLUS",
    price: "₹499",
    period: "month",
    tagline: "Full custom domain website for growing D2C stores.",
    features: [
      "Custom Domain Mapping (yourbrand.com)",
      "Razorpay & Stripe Payment Gateways",
      "Up to 500 Product Listings",
      "Custom Storefront Themes",
      "0% Platform Transaction Fees",
    ],
  },
  {
    id: "growth",
    name: "GROWTH ⭐",
    price: "₹1,499",
    period: "month",
    badge: "Recommended ⭐",
    tagline: "Built for scaling D2C brands with automated shipping.",
    features: [
      "Custom Domain Mapping (yourbrand.com)",
      "Razorpay & Stripe Payment Gateways",
      "Unlimited Products & Orders",
      "Shiprocket Automated Shipping & AWBs",
      "Abandoned Cart Recovery (WhatsApp & Email)",
      "AI Description Writer & Marketing Tools",
      "0% Platform Transaction Fees",
    ],
  },
  {
    id: "business",
    name: "BUSINESS",
    price: "₹2,999",
    period: "month",
    tagline: "For high-volume brands and multi-member teams.",
    features: [
      "Multi-Staff Accounts (5 Team Seats)",
      "Developer REST API & Custom Webhooks",
      "Custom CSS / JS Code Injection",
      "Automated GST Invoices & PDF Export",
      "0% Platform Transaction Fees",
    ],
  },
];

export default function StepPlan({ data, onChange, onNext, onBack }: StepPlanProps) {
  const selectedPlanId = data.selectedPlan || "free";
  // Signup defaults to "free"/"trial" — highlight Growth as the trial anchor
  const isTrialAnchor = selectedPlanId === "free" || selectedPlanId === "trial";

  const handleSelectPlan = (id: string) => {
    onChange({ selectedPlan: id });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left font-sans animate-fade-in">
      {/* Top Free Trial Hook Umbrella Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-md space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-blue-500/20 rounded-lg text-amber-300">
            <Sparkles className="w-4 h-4 fill-amber-300" />
          </span>
          <h3 className="text-sm font-extrabold text-white">Start Free. Pay Only When You Scale.</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white font-bold">Zero risk upfront.</strong> Experience full{" "}
          <span className="text-amber-300 font-bold">Growth-tier features</span> for{" "}
          <strong className="text-white font-bold">60 days</strong>, or your{" "}
          <strong className="text-white font-bold">first 100 orders / ₹25,000 in sales</strong>{" "}
          (whichever comes first). No credit card required today.
        </p>
      </div>

      <div className="space-y-1">
        <h2 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">Select Your Post-Trial Plan Anchor</h2>
        <p className="text-xs text-slate-500">
          Choose which subscription plan tier you wish to unlock after your free trial expires.
        </p>
      </div>

      <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
        {PLANS.map((plan) => {
          const active = selectedPlanId === plan.id || (isTrialAnchor && plan.id === "growth");
          return (
            <div
              key={plan.id}
              onClick={() => handleSelectPlan(plan.id)}
              className={`p-4 border rounded-2xl cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                active
                  ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20 shadow-sm"
                  : "border-slate-200 hover:border-slate-350 bg-white"
              }`}
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      active ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white"
                    }`}
                  >
                    {active && <Check className="h-2.5 w-2.5 stroke-[4]" />}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">{plan.name}</h3>
                  {plan.badge && (
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[10px] font-extrabold uppercase">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium">{plan.tagline}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
                  {plan.features.slice(0, 4).map((f) => (
                    <span key={f} className="flex items-center gap-1">
                      • {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0 md:pl-4">
                <div className="text-lg font-black text-slate-950">{plan.price}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">/ {plan.period}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 flex justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
        >
          Start 60-Day Free Trial
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
