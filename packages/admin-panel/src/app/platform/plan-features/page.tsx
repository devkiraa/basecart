"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  ShieldCheck,
  Zap,
  TrendingUp,
  Globe,
  Truck,
  Bot,
  Users,
  Code,
  FileSpreadsheet,
  HelpCircle,
  Loader2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface PlanConfig {
  planId: string;
  name: string;
  price: number;
  billingPeriod: string;
  targetAudience: string;
  orderCap: number;
  gmvCap: number;
  productCap: number;
  allowCustomDomain: boolean | number;
  allowAutomatedGateways: boolean | number;
  allowAutomatedShipping: boolean | number;
  allowAbandonedCart: boolean | number;
  allowAiWriter: boolean | number;
  allowStaffSeats: boolean | number;
  maxStaffSeats: number;
  allowDeveloperApi: boolean | number;
  allowCustomCssJs: boolean | number;
  allowGstInvoices: boolean | number;
  platformFeePercent: number;
  paywallMessage: string;
}

export default function PlanFeaturesConsole() {
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/plan-configs`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load plan configurations");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setPlans(
          data.map((p: any) => ({
            ...p,
            allowCustomDomain: Boolean(p.allowCustomDomain),
            allowAutomatedGateways: Boolean(p.allowAutomatedGateways),
            allowAutomatedShipping: Boolean(p.allowAutomatedShipping),
            allowAbandonedCart: Boolean(p.allowAbandonedCart),
            allowAiWriter: Boolean(p.allowAiWriter),
            allowStaffSeats: Boolean(p.allowStaffSeats),
            allowDeveloperApi: Boolean(p.allowDeveloperApi),
            allowCustomCssJs: Boolean(p.allowCustomCssJs),
            allowGstInvoices: Boolean(p.allowGstInvoices),
          }))
        );
      }
    } catch (err) {
      console.error(err);
      setError("Unable to retrieve plan configurations registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const updatePlanField = (planId: string, field: keyof PlanConfig, val: any) => {
    setPlans((prev) =>
      prev.map((p) => (p.planId === planId ? { ...p, [field]: val } : p))
    );
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_URL}/admin/plan-configs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plans),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to persist plan configuration matrix");
      setMessage("All 4-tier plan features & trial paywall caps persisted to D1 control database and synced live!");
    } catch (err) {
      console.error(err);
      setError("Error saving plan feature configurations.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-500">Loading Basecart Tier Pricing & Features Matrix...</p>
      </div>
    );
  }

  const trialPlan = plans.find((p) => p.planId === "trial");
  const tier1 = plans.find((p) => p.planId === "tier1");
  const tier2 = plans.find((p) => p.planId === "tier2");
  const tier3 = plans.find((p) => p.planId === "tier3");
  const tier4 = plans.find((p) => p.planId === "tier4");

  return (
    <form onSubmit={handleSaveAll} className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Plan Features & Dynamic Tier Customization</h1>
          <p className="text-sm text-slate-500 mt-1">
            Customize 4-tier prices, trial paywall triggers, catalog caps, and feature gates. Changes sync instantly across storefronts & dashboards.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save & Deploy Plan Changes</span>
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-850 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-850 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Acquisition Hook (Trial Strategy) Section */}
      {trialPlan && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Acquisition Hook — Free Trial Strategy</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full Growth-tier features during trial. Paywall triggers automatically when caps are reached.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-extrabold uppercase tracking-wider">
              Zero Upfront Risk
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Order Cap Trigger (# orders)
              </label>
              <input
                type="number"
                value={trialPlan.orderCap}
                onChange={(e) => updatePlanField("trial", "orderCap", Number(e.target.value))}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-indigo-400"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: First 100 orders</span>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                GMV Revenue Cap Trigger (₹)
              </label>
              <input
                type="number"
                value={trialPlan.gmvCap}
                onChange={(e) => updatePlanField("trial", "gmvCap", Number(e.target.value))}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-2.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-indigo-400"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: ₹25,000 total revenue</span>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Trial Access Tier
              </label>
              <div className="p-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Full Growth-Tier Features Included</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Maximizes platform value experience</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Celebratory Paywall Prompt Message
            </label>
            <input
              type="text"
              value={trialPlan.paywallMessage}
              onChange={(e) => updatePlanField("trial", "paywallMessage", e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>
      )}

      {/* 4-Tier Pricing Structure Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <span>Basecart 4-Tier Pricing Structure & Feature Matrix</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tier 1 — ₹99 / mo */}
          {tier1 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                    Tier 1
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Order Receiver</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{tier1.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{tier1.targetAudience}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price (₹/mo)</label>
                  <div className="flex items-center gap-1 font-bold text-lg text-slate-900">
                    <span>₹</span>
                    <input
                      type="number"
                      value={tier1.price}
                      onChange={(e) => updatePlanField("tier1", "price", Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-semibold">Catalog Limit</span>
                    <input
                      type="number"
                      value={tier1.productCap}
                      onChange={(e) => updatePlanField("tier1", "productCap", Number(e.target.value))}
                      className="w-16 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-right font-bold"
                    />
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-semibold">Custom Domain</span>
                    <input
                      type="checkbox"
                      checked={Boolean(tier1.allowCustomDomain)}
                      onChange={(e) => updatePlanField("tier1", "allowCustomDomain", e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-semibold">Automated Gateways</span>
                    <input
                      type="checkbox"
                      checked={Boolean(tier1.allowAutomatedGateways)}
                      onChange={(e) => updatePlanField("tier1", "allowAutomatedGateways", e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-semibold">Shiprocket Shipping</span>
                    <input
                      type="checkbox"
                      checked={Boolean(tier1.allowAutomatedShipping)}
                      onChange={(e) => updatePlanField("tier1", "allowAutomatedShipping", e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl text-[11px] text-amber-850 space-y-1">
                <span className="font-bold block">Protected Upgrade Value:</span>
                <p>Razorpay & custom domains gated off ₹99 plan to drive organic tier upgrades.</p>
              </div>
            </div>
          )}

          {/* Tier 2 — ₹399 / mo */}
          {tier2 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                    Tier 2
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Starter</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{tier2.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{tier2.targetAudience}</p>
                </div>

                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 space-y-2">
                  <label className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Price (₹/mo)</label>
                  <div className="flex items-center gap-1 font-bold text-lg text-slate-900">
                    <span>₹</span>
                    <input
                      type="number"
                      value={tier2.price}
                      onChange={(e) => updatePlanField("tier2", "price", Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-semibold">Catalog Limit</span>
                    <input
                      type="number"
                      value={tier2.productCap}
                      onChange={(e) => updatePlanField("tier2", "productCap", Number(e.target.value))}
                      className="w-16 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-right font-bold"
                    />
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-semibold">Custom Domain (`brand.com`)</span>
                    <input
                      type="checkbox"
                      checked={Boolean(tier2.allowCustomDomain)}
                      onChange={(e) => updatePlanField("tier2", "allowCustomDomain", e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-semibold">Razorpay & Stripe</span>
                    <input
                      type="checkbox"
                      checked={Boolean(tier2.allowAutomatedGateways)}
                      onChange={(e) => updatePlanField("tier2", "allowAutomatedGateways", e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-semibold">Shiprocket Shipping</span>
                    <input
                      type="checkbox"
                      checked={Boolean(tier2.allowAutomatedShipping)}
                      onChange={(e) => updatePlanField("tier2", "allowAutomatedShipping", e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-900 space-y-1">
                <span className="font-bold block">Shopify Starter Killer:</span>
                <p>Full hosted website at ₹399 vs Shopify limiting to simple buy buttons.</p>
              </div>
            </div>
          )}

          {/* Tier 3 — ₹1,499 / mo */}
          {tier3 && (
            <div className="bg-white border-2 border-indigo-600 rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-5 relative">
              <div className="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">
                Recommended
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Tier 3
                  </span>
                  <span className="text-[10px] font-bold text-indigo-600">Growth</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{tier3.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{tier3.targetAudience}</p>
                </div>

                <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 space-y-2">
                  <label className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Price (₹/mo)</label>
                  <div className="flex items-center gap-1 font-bold text-lg text-slate-900">
                    <span>₹</span>
                    <input
                      type="number"
                      value={tier3.price}
                      onChange={(e) => updatePlanField("tier3", "price", Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-semibold">Unlimited Products</span>
                    <span className="font-bold text-emerald-600">Yes</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-semibold">Shiprocket Shipping</span>
                    <input
                      type="checkbox"
                      checked={Boolean(tier3.allowAutomatedShipping)}
                      onChange={(e) => updatePlanField("tier3", "allowAutomatedShipping", e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-semibold">Abandoned Cart Recovery</span>
                    <input
                      type="checkbox"
                      checked={Boolean(tier3.allowAbandonedCart)}
                      onChange={(e) => updatePlanField("tier3", "allowAbandonedCart", e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-semibold">AI Description Writer</span>
                    <input
                      type="checkbox"
                      checked={Boolean(tier3.allowAiWriter)}
                      onChange={(e) => updatePlanField("tier3", "allowAiWriter", e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 space-y-1">
                <span className="font-bold block">Ad Scaler Choice:</span>
                <p>Complete D2C tech stack at half the overall cost of Shopify Basic app add-ons.</p>
              </div>
            </div>
          )}

          {/* Tier 4 — ₹2,999 / mo */}
          {tier4 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                    Tier 4
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Business / Pro</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{tier4.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{tier4.targetAudience}</p>
                </div>

                <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100 space-y-2">
                  <label className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Price (₹/mo)</label>
                  <div className="flex items-center gap-1 font-bold text-lg text-slate-900">
                    <span>₹</span>
                    <input
                      type="number"
                      value={tier4.price}
                      onChange={(e) => updatePlanField("tier4", "price", Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-semibold">Max Staff Seats</span>
                    <input
                      type="number"
                      value={tier4.maxStaffSeats}
                      onChange={(e) => updatePlanField("tier4", "maxStaffSeats", Number(e.target.value))}
                      className="w-16 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-right font-bold"
                    />
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-semibold">Developer API & Webhooks</span>
                    <input
                      type="checkbox"
                      checked={Boolean(tier4.allowDeveloperApi)}
                      onChange={(e) => updatePlanField("tier4", "allowDeveloperApi", e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-semibold">Custom CSS/JS Injection</span>
                    <input
                      type="checkbox"
                      checked={Boolean(tier4.allowCustomCssJs)}
                      onChange={(e) => updatePlanField("tier4", "allowCustomCssJs", e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-semibold">Automated GST Invoices</span>
                    <input
                      type="checkbox"
                      checked={Boolean(tier4.allowGstInvoices)}
                      onChange={(e) => updatePlanField("tier4", "allowGstInvoices", e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl text-[11px] text-purple-900 space-y-1">
                <span className="font-bold block">Enterprise Team Workflows:</span>
                <p>Multi-staff seats, custom tracking scripts, and developer API access.</p>
              </div>
            </div>
          )}
        </div>
      </div>


    </form>
  );
}
