import React from "react";
import { Check, Loader2 } from "lucide-react";

interface StepPlanProps {
  data: any;
  onChange: (fields: any) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    features: ["1 Storefront subdomain", "50 Products listing limit", "Stripe & Razorpay integrations", "Standard template themes"]
  },
  {
    id: "starter",
    name: "Starter",
    price: "₹299",
    period: "month",
    features: ["Custom domain support", "Unlimited product listings", "Standard template themes", "Stripe & Razorpay integrations"]
  },
  {
    id: "growth",
    name: "Growth",
    price: "₹699",
    period: "month",
    features: ["Everything in Starter", "Premium Aura Watchroom Theme", "Fulfillment integrations", "Advanced analytics metrics"]
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹1499",
    period: "month",
    features: ["Everything in Growth", "Platform API access keys", "Prioritized merchant support", "Isolated high-scale limits"]
  },
  {
    id: "agency",
    name: "Agency",
    price: "Custom",
    period: "contact sales",
    features: ["Multi-store operations console", "Custom theme creation", "Dedicated account managers", "White label integrations"]
  }
];

export default function StepPlan({ data, onChange, onNext, onBack, loading }: StepPlanProps) {
  const selectedPlanId = data.selectedPlan || "free";

  const handleSelectPlan = (id: string) => {
    onChange({ selectedPlan: id });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left font-sans animate-fade-in">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Select plan</h2>
        <p className="text-xs text-slate-500">Pick a subscription that aligns with your scale. No payment required today.</p>
      </div>

      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
        {PLANS.map((plan) => {
          const active = selectedPlanId === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => !loading && handleSelectPlan(plan.id)}
              className={`p-4 border rounded-card cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                active
                  ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                  : "border-slate-200 hover:border-slate-350 bg-white"
              } ${loading ? "pointer-events-none opacity-80" : ""}`}
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    active ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white"
                  }`}>
                    {active && <Check className="h-2.5 w-2.5 stroke-[4]" />}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{plan.name}</h3>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                  {plan.features.slice(0, 3).map((f) => (
                    <span key={f} className="flex items-center gap-1">
                       {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0 md:pl-4">
                <div className="text-base font-black text-slate-900">{plan.price}</div>
                <div className="text-[10px] text-slate-400 capitalize">{plan.period}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="w-1/3 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-button text-sm transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-button text-sm transition-colors shadow-sm text-center flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Launching...
            </>
          ) : (
            "Verify & Launch"
          )}
        </button>
      </div>
    </form>
  );
}
