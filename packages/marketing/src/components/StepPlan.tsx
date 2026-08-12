import React from "react";
import { CheckCircle2, Sparkles, ArrowRight, Gift } from "lucide-react";

interface StepPlanProps {
  data: any;
  onChange: (fields: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const GROWTH_FEATURES = [
  "Unlimited Products & Orders",
  "Custom Domain Mapping (yourbrand.com)",
  "Razorpay & Stripe Payment Gateways",
  "Shiprocket Automated Shipping & AWBs",
  "Abandoned Cart Recovery (WhatsApp & Email)",
  "AI Product Description Writer",
  "Automated GST Invoices & PDF Export",
  "0% Platform Transaction Fees",
];

export default function StepPlan({ data, onChange, onNext, onBack }: StepPlanProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({ selectedPlan: "free" });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left font-sans animate-fade-in">

      {/* Hero value banner */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-amber-400/20 rounded-lg">
            <Gift className="w-4 h-4 text-amber-300" />
          </span>
          <h3 className="text-sm font-extrabold text-white">You're getting this — completely free.</h3>
        </div>

        {/* Value pill */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-white">₹1,499</span>
          <span className="text-slate-400 text-sm font-semibold line-through">/month</span>
          <span className="ml-1 bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">FREE for 3 months</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Process your first <strong className="text-white">1,000 orders</strong> or reach{" "}
          <strong className="text-white">₹25,000 in order value</strong> — on us.{" "}
          No credit card. No strings. Cancel anytime.
        </p>
      </div>

      {/* What's included */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" /> What's included in your free trial
        </p>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2.5">
          {GROWTH_FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Reassurance line */}
      <p className="text-[10px] text-slate-400 font-medium text-center leading-relaxed">
        After your free period, pick a plan starting at <strong className="text-slate-600">₹99/month</strong>.
        Your store stays live and your data is always yours.
      </p>

      {/* Nav buttons */}
      <div className="pt-1 flex justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-[.99]"
        >
          Claim my free trial
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
