import React, { useEffect, useState } from "react";
import { Check, Loader2, Sparkles, Layers } from "lucide-react";

interface StepPlanProps {
  data: any;
  onChange: (fields: any) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

const DEFAULT_PLANS = [
  {
    id: "trial",
    name: "Free Acquisition Trial (Growth Tier Features)",
    price: "₹0",
    period: "first 100 orders or ₹25k GMV",
    badge: "Recommended",
    features: [
      "No credit card required",
      "Full access to Growth-tier features",
      "First 100 orders OR ₹25,000 GMV processed",
      "Razorpay checkout & custom domain mapping",
    ],
  },
  {
    id: "tier1",
    name: "Basic (Order Receiver)",
    price: "₹99",
    period: "month",
    features: [
      "Simple catalog (up to 100 items)",
      "Direct WhatsApp checkout link",
      "Manual UPI & COD order tracking",
      "Low-cost retention tier",
    ],
  },
  {
    id: "tier2",
    name: "Starter",
    price: "₹399",
    period: "month",
    features: [
      "Full website (`yourbrand.com`)",
      "Razorpay & Stripe automated payment gateways",
      "Up to 250 active products",
      "Standard themes & basic analytics",
    ],
  },
  {
    id: "tier3",
    name: "Growth (Recommended)",
    price: "₹1,499",
    period: "month",
    badge: "Most Popular",
    features: [
      "Unlimited products & orders",
      "Shiprocket automated shipping & AWB",
      "Abandoned cart recovery (WhatsApp/Email)",
      "AI description writer & product variants",
    ],
  },
  {
    id: "tier4",
    name: "Business (Pro)",
    price: "₹2,999",
    period: "month",
    features: [
      "Multi-staff accounts (5-10 seats)",
      "Developer REST API & Webhooks",
      "Custom CSS/JS script injection",
      "Automated GST invoices & PDF exports",
    ],
  },
];

export default function StepPlan({ data, onChange, onNext, onBack, loading }: StepPlanProps) {
  const [plansList, setPlansList] = useState(DEFAULT_PLANS);
  const selectedPlanId = data.selectedPlan || "trial";

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    fetch(`${apiUrl}/public/plan-configs`)
      .then((res) => res.json())
      .then((configs) => {
        if (Array.isArray(configs) && configs.length > 0) {
          const mapped = configs.map((c: any) => ({
            id: c.planId,
            name: c.name,
            price: `₹${c.price}`,
            period: c.planId === "trial" ? "first 100 orders / ₹25k GMV" : "month",
            badge: c.planId === "trial" || c.planId === "tier3" ? "Recommended" : undefined,
            features:
              c.planId === "trial"
                ? ["No credit card required", "Full access to Growth-tier features", `First ${c.orderCap || 100} orders OR ₹${c.gmvCap || 25000} GMV`, "Razorpay checkout & custom domain"]
                : c.planId === "tier1"
                ? ["Up to 100 products", "Direct WhatsApp checkout link", "Manual UPI & COD tracking", "0% platform fees"]
                : c.planId === "tier2"
                ? ["Full website domain (`brand.com`)", "Razorpay & Stripe automated gateways", "Up to 250 products", "0% platform fees"]
                : c.planId === "tier3"
                ? ["Unlimited products & orders", "Shiprocket automated shipping & AWB", "Abandoned cart recovery", "AI description writer"]
                : ["Multi-staff team seats", "Developer REST API & Webhooks", "Custom CSS/JS injection", "Automated GST invoices"],
          }));
          setPlansList(mapped);
        }
      })
      .catch((e) => {});
  }, []);

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
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Select your plan</h2>
        <p className="text-xs text-slate-500">
          Pick a subscription that aligns with your scale. Start with the free acquisition trial today with zero upfront risk.
        </p>
      </div>

      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {plansList.map((plan) => {
          const active = selectedPlanId === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => !loading && handleSelectPlan(plan.id)}
              className={`p-4 border rounded-2xl cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                active
                  ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                  : "border-slate-200 hover:border-slate-350 bg-white"
              } ${loading ? "pointer-events-none opacity-80" : ""}`}
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
                  <h3 className="text-sm font-bold text-slate-900">{plan.name}</h3>
                  {plan.badge && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-extrabold uppercase">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                  {plan.features.map((f) => (
                    <span key={f} className="flex items-center gap-1">
                      • {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0 md:pl-4">
                <div className="text-lg font-black text-slate-950">{plan.price}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">{plan.period}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 flex justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue with Selected Plan"}
        </button>
      </div>
    </form>
  );
}
