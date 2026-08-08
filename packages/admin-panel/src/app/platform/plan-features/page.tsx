"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Plus,
  Trash2,
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
  featuresList: string[];
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
          data.map((p: any) => {
            let parsedFeatures: string[] = [];
            if (Array.isArray(p.featuresList)) {
              parsedFeatures = p.featuresList;
            } else if (p.featuresJson) {
              try {
                parsedFeatures = typeof p.featuresJson === "string" ? JSON.parse(p.featuresJson) : p.featuresJson;
              } catch (e) {
                parsedFeatures = [];
              }
            }

            return {
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
              featuresList: parsedFeatures,
            };
          })
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

  const updateFeatureItem = (planId: string, index: number, text: string) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.planId !== planId) return p;
        const updatedList = [...(p.featuresList || [])];
        updatedList[index] = text;
        return { ...p, featuresList: updatedList };
      })
    );
  };

  const addFeatureItem = (planId: string) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.planId !== planId) return p;
        return { ...p, featuresList: [...(p.featuresList || []), "New Plan Feature"] };
      })
    );
  };

  const removeFeatureItem = (planId: string, index: number) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.planId !== planId) return p;
        const updatedList = [...(p.featuresList || [])];
        updatedList.splice(index, 1);
        return { ...p, featuresList: updatedList };
      })
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
      setMessage("Plan names, taglines, prices, features, and gateway settings persisted to D1 control database and synced live!");
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

  const trialPlan = plans.find((p) => p.planId === "trial") || {
    planId: "trial",
    name: "Free Acquisition Trial",
    price: 0,
    billingPeriod: "trial",
    targetAudience: "New Signup Merchants",
    orderCap: 100,
    gmvCap: 25000,
    productCap: -1,
    allowCustomDomain: true,
    allowAutomatedGateways: true,
    allowAutomatedShipping: true,
    allowAbandonedCart: true,
    allowAiWriter: true,
    allowStaffSeats: true,
    maxStaffSeats: 1,
    allowDeveloperApi: false,
    allowCustomCssJs: false,
    allowGstInvoices: false,
    platformFeePercent: 0,
    paywallMessage: "You've earned ₹25,000 using Basecart! Select a plan to continue scaling.",
    featuresList: ["Growth Tier Full Access", "First 100 Orders OR ₹25,000 GMV", "Razorpay & Stripe Gateways Enabled"],
  };

  const basicPlan = plans.find((p) => p.planId === "tier1" || p.planId === "basic") || {
    planId: "tier1",
    name: "BASIC",
    price: 99,
    billingPeriod: "monthly",
    targetAudience: "Ideal for Instagram sellers & WhatsApp order intake.",
    orderCap: -1,
    gmvCap: -1,
    productCap: 100,
    allowCustomDomain: false,
    allowAutomatedGateways: true,
    allowAutomatedShipping: false,
    allowAbandonedCart: false,
    allowAiWriter: false,
    allowStaffSeats: false,
    maxStaffSeats: 1,
    allowDeveloperApi: false,
    allowCustomCssJs: false,
    allowGstInvoices: false,
    platformFeePercent: 0,
    paywallMessage: "",
    featuresList: [
      "Up to 100 Product Listings",
      "Direct WhatsApp Checkout",
      "Razorpay & Stripe Payment Gateways",
      "Manual UPI & COD Order Tracking",
      "Standard Storefront Theme",
      "0% Platform Transaction Fees",
    ],
  };

  const plusPlan = plans.find((p) => p.planId === "tier2" || p.planId === "plus") || {
    planId: "tier2",
    name: "PLUS",
    price: 499,
    billingPeriod: "monthly",
    targetAudience: "Full custom domain website for growing D2C stores.",
    orderCap: -1,
    gmvCap: -1,
    productCap: 500,
    allowCustomDomain: true,
    allowAutomatedGateways: true,
    allowAutomatedShipping: false,
    allowAbandonedCart: false,
    allowAiWriter: false,
    allowStaffSeats: false,
    maxStaffSeats: 1,
    allowDeveloperApi: false,
    allowCustomCssJs: false,
    allowGstInvoices: false,
    platformFeePercent: 0,
    paywallMessage: "",
    featuresList: [
      "Custom Domain Mapping (yourbrand.com)",
      "Razorpay & Stripe Payment Gateways",
      "Up to 500 Product Listings",
      "Custom Storefront Themes",
      "Direct WhatsApp & Email Notifications",
      "0% Platform Transaction Fees",
    ],
  };

  const growthPlan = plans.find((p) => p.planId === "tier3" || p.planId === "growth") || {
    planId: "tier3",
    name: "GROWTH ⭐",
    price: 1499,
    billingPeriod: "monthly",
    targetAudience: "Built for scaling D2C brands with automated shipping.",
    orderCap: -1,
    gmvCap: -1,
    productCap: -1,
    allowCustomDomain: true,
    allowAutomatedGateways: true,
    allowAutomatedShipping: true,
    allowAbandonedCart: true,
    allowAiWriter: true,
    allowStaffSeats: true,
    maxStaffSeats: 3,
    allowDeveloperApi: false,
    allowCustomCssJs: false,
    allowGstInvoices: true,
    platformFeePercent: 0,
    paywallMessage: "",
    featuresList: [
      "Custom Domain Mapping (yourbrand.com)",
      "Razorpay & Stripe Payment Gateways",
      "Unlimited Products & Orders",
      "Shiprocket Automated Shipping & AWBs",
      "Abandoned Cart Recovery (WhatsApp & Email)",
      "AI Description Writer & Marketing Tools",
      "Product Options Matrix (Sizes, Colors, Variants)",
      "0% Platform Transaction Fees",
    ],
  };

  const businessPlan = plans.find((p) => p.planId === "tier4" || p.planId === "business") || {
    planId: "tier4",
    name: "BUSINESS",
    price: 2999,
    billingPeriod: "monthly",
    targetAudience: "For high-volume brands and multi-member teams.",
    orderCap: -1,
    gmvCap: -1,
    productCap: -1,
    allowCustomDomain: true,
    allowAutomatedGateways: true,
    allowAutomatedShipping: true,
    allowAbandonedCart: true,
    allowAiWriter: true,
    allowStaffSeats: true,
    maxStaffSeats: 5,
    allowDeveloperApi: true,
    allowCustomCssJs: true,
    allowGstInvoices: true,
    platformFeePercent: 0,
    paywallMessage: "",
    featuresList: [
      "Multi-Staff Accounts (5 Team Seats)",
      "Developer REST API & Custom Webhooks",
      "Custom CSS / JS Code Injection (Pixel & Scripts)",
      "Automated GST Invoices & PDF Export",
      "Dedicated Account Manager & Priority 24/7 Support",
      "0% Platform Transaction Fees",
    ],
  };

  const editablePlans = [basicPlan, plusPlan, growthPlan, businessPlan];

  return (
    <form onSubmit={handleSaveAll} className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Plan Features & Dynamic Content Customization</h1>
          <p className="text-sm text-slate-500 mt-1">
            Edit plan names, taglines, prices, feature bullets, and payment gateway options. Payment gateways (Razorpay/Stripe) enabled for all order checkouts.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 active:scale-95 disabled:opacity-50 cursor-pointer"
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

      {/* Umbrella Free Trial Hook Banner Section */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Umbrella Free Trial Hook Configuration</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every merchant starts free with full Growth-tier access. Order or GMV caps trigger celebratory paywall prompts automatically.
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
              <Zap className="w-4 h-4 text-amber-400 fill-amber-300" />
              <span>Full Growth-Tier Features Unlocked</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Maximum platform value experience</span>
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

      {/* Editable 3-Plan Cards Matrix */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <span>Editable Subscription Tiers & Feature Bullet Content</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {editablePlans.map((plan) => (
            <div
              key={plan.planId}
              className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-5 ${
                plan.planId === "tier3" || plan.planId === "growth"
                  ? "border-2 border-indigo-600 shadow-md"
                  : "border-slate-200"
              }`}
            >
              <div className="space-y-4">
                {/* Header / Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Plan Name</label>
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => updatePlanField(plan.planId, "name", e.target.value)}
                    className="w-full font-black text-slate-900 text-base bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Tagline / Audience */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tagline / Description</label>
                  <input
                    type="text"
                    value={plan.targetAudience}
                    onChange={(e) => updatePlanField(plan.planId, "targetAudience", e.target.value)}
                    className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                  />
                </div>

                {/* Price */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Price (₹)</label>
                  <div className="flex items-center gap-1 font-bold text-lg text-slate-900">
                    <span>₹</span>
                    <input
                      type="number"
                      value={plan.price}
                      onChange={(e) => updatePlanField(plan.planId, "price", Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Feature Toggles */}
                <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600 font-semibold">Payment Gateway (Razorpay/Stripe)</span>
                    <input
                      type="checkbox"
                      checked={Boolean(plan.allowAutomatedGateways)}
                      onChange={(e) => updatePlanField(plan.planId, "allowAutomatedGateways", e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600 font-semibold">Custom Domain (`brand.com`)</span>
                    <input
                      type="checkbox"
                      checked={Boolean(plan.allowCustomDomain)}
                      onChange={(e) => updatePlanField(plan.planId, "allowCustomDomain", e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600 font-semibold">Shiprocket Automated Shipping</span>
                    <input
                      type="checkbox"
                      checked={Boolean(plan.allowAutomatedShipping)}
                      onChange={(e) => updatePlanField(plan.planId, "allowAutomatedShipping", e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Editable Bullet Feature Items */}
                <div className="space-y-2.5 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">
                      Feature Bullets ({plan.featuresList?.length || 0})
                    </label>
                    <button
                      type="button"
                      onClick={() => addFeatureItem(plan.planId)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Feature</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {(plan.featuresList || []).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeatureItem(plan.planId, idx, e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-400"
                        />
                        <button
                          type="button"
                          onClick={() => removeFeatureItem(plan.planId, idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
