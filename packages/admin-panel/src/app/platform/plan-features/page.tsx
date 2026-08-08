"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Globe,
  Truck,
  Bot,
  Users,
  Code,
  FileSpreadsheet,
  HelpCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
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
      setMessage("Streamlined 3-tier plan features & trial paywall caps persisted to D1 control database and synced live!");
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
    allowAutomatedGateways: false,
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
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Plan Features & Dynamic Tier Customization</h1>
          <p className="text-sm text-slate-500 mt-1">
            Customize 3-tier prices (Basic ₹99, Growth ₹1,499, Business ₹2,999), free trial paywall triggers, and feature toggles. Changes sync live across the storefront & merchant dashboard.
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

      {/* Streamlined 3-Tier Pricing Structure Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <span>Streamlined 3-Tier Pricing Structure & Feature Matrix</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: BASIC (₹99 / mo) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                  Basic Tier
                </span>
                <span className="text-[10px] font-bold text-slate-400">Order Receiver</span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">{basicPlan.name}</h3>
                <input
                  type="text"
                  value={basicPlan.targetAudience}
                  onChange={(e) => updatePlanField(basicPlan.planId, "targetAudience", e.target.value)}
                  className="w-full text-xs text-slate-500 mt-1 bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-none"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price (₹/mo)</label>
                <div className="flex items-center gap-1 font-bold text-lg text-slate-900">
                  <span>₹</span>
                  <input
                    type="number"
                    value={basicPlan.price}
                    onChange={(e) => updatePlanField(basicPlan.planId, "price", Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600 font-semibold">Catalog Limit</span>
                  <input
                    type="number"
                    value={basicPlan.productCap}
                    onChange={(e) => updatePlanField(basicPlan.planId, "productCap", Number(e.target.value))}
                    className="w-16 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-right font-bold"
                  />
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600 font-semibold">Custom Domain (`brand.com`)</span>
                  <input
                    type="checkbox"
                    checked={Boolean(basicPlan.allowCustomDomain)}
                    onChange={(e) => updatePlanField(basicPlan.planId, "allowCustomDomain", e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600 font-semibold">Automated Gateways (Razorpay/Stripe)</span>
                  <input
                    type="checkbox"
                    checked={Boolean(basicPlan.allowAutomatedGateways)}
                    onChange={(e) => updatePlanField(basicPlan.planId, "allowAutomatedGateways", e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600 font-semibold">Shiprocket Automated Shipping</span>
                  <input
                    type="checkbox"
                    checked={Boolean(basicPlan.allowAutomatedShipping)}
                    onChange={(e) => updatePlanField(basicPlan.planId, "allowAutomatedShipping", e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 space-y-1">
              <span className="font-bold block">Entry Point Tier:</span>
              <p>Direct WhatsApp checkout & manual UPI order tracking at ₹99/mo.</p>
            </div>
          </div>

          {/* Card 2: GROWTH ⭐ (RECOMMENDED) (₹1,499 / mo) */}
          <div className="bg-white border-2 border-indigo-600 rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-5 relative scale-102 z-10">
            <div className="absolute -top-3.5 right-6 bg-indigo-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">
              Recommended ⭐
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Growth Tier
                </span>
                <span className="text-[10px] font-bold text-indigo-600">Scaling Brands</span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">{growthPlan.name}</h3>
                <input
                  type="text"
                  value={growthPlan.targetAudience}
                  onChange={(e) => updatePlanField(growthPlan.planId, "targetAudience", e.target.value)}
                  className="w-full text-xs text-slate-500 mt-1 bg-indigo-50/50 border border-indigo-200 rounded px-2 py-1 focus:outline-none"
                />
              </div>

              <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 space-y-2">
                <label className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Price (₹/mo)</label>
                <div className="flex items-center gap-1 font-bold text-lg text-slate-900">
                  <span>₹</span>
                  <input
                    type="number"
                    value={growthPlan.price}
                    onChange={(e) => updatePlanField(growthPlan.planId, "price", Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600 font-semibold">Unlimited Products</span>
                  <span className="font-bold text-emerald-600">Yes (-1)</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600 font-semibold">Custom Domain (`yourbrand.com`)</span>
                  <input
                    type="checkbox"
                    checked={Boolean(growthPlan.allowCustomDomain)}
                    onChange={(e) => updatePlanField(growthPlan.planId, "allowCustomDomain", e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600 font-semibold">Razorpay & Stripe Gateways</span>
                  <input
                    type="checkbox"
                    checked={Boolean(growthPlan.allowAutomatedGateways)}
                    onChange={(e) => updatePlanField(growthPlan.planId, "allowAutomatedGateways", e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600 font-semibold">Shiprocket Automated Shipping</span>
                  <input
                    type="checkbox"
                    checked={Boolean(growthPlan.allowAutomatedShipping)}
                    onChange={(e) => updatePlanField(growthPlan.planId, "allowAutomatedShipping", e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600 font-semibold">Abandoned Cart Recovery</span>
                  <input
                    type="checkbox"
                    checked={Boolean(growthPlan.allowAbandonedCart)}
                    onChange={(e) => updatePlanField(growthPlan.planId, "allowAbandonedCart", e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600 font-semibold">AI Description Writer</span>
                  <input
                    type="checkbox"
                    checked={Boolean(growthPlan.allowAiWriter)}
                    onChange={(e) => updatePlanField(growthPlan.planId, "allowAiWriter", e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 space-y-1">
              <span className="font-bold block">Recommended Choice:</span>
              <p>Complete automated D2C tech stack with zero transaction fees.</p>
            </div>
          </div>

          {/* Card 3: BUSINESS (₹2,999 / mo) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                  Business Tier
                </span>
                <span className="text-[10px] font-bold text-purple-600">Enterprise Workflows</span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">{businessPlan.name}</h3>
                <input
                  type="text"
                  value={businessPlan.targetAudience}
                  onChange={(e) => updatePlanField(businessPlan.planId, "targetAudience", e.target.value)}
                  className="w-full text-xs text-slate-500 mt-1 bg-purple-50/50 border border-purple-200 rounded px-2 py-1 focus:outline-none"
                />
              </div>

              <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100 space-y-2">
                <label className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Price (₹/mo)</label>
                <div className="flex items-center gap-1 font-bold text-lg text-slate-900">
                  <span>₹</span>
                  <input
                    type="number"
                    value={businessPlan.price}
                    onChange={(e) => updatePlanField(businessPlan.planId, "price", Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600 font-semibold">Max Staff Seats</span>
                  <input
                    type="number"
                    value={businessPlan.maxStaffSeats}
                    onChange={(e) => updatePlanField(businessPlan.planId, "maxStaffSeats", Number(e.target.value))}
                    className="w-16 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-right font-bold"
                  />
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600 font-semibold">Developer REST API & Webhooks</span>
                  <input
                    type="checkbox"
                    checked={Boolean(businessPlan.allowDeveloperApi)}
                    onChange={(e) => updatePlanField(businessPlan.planId, "allowDeveloperApi", e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600 font-semibold">Custom CSS / JS Injection</span>
                  <input
                    type="checkbox"
                    checked={Boolean(businessPlan.allowCustomCssJs)}
                    onChange={(e) => updatePlanField(businessPlan.planId, "allowCustomCssJs", e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600 font-semibold">Automated GST Invoices & PDF Export</span>
                  <input
                    type="checkbox"
                    checked={Boolean(businessPlan.allowGstInvoices)}
                    onChange={(e) => updatePlanField(businessPlan.planId, "allowGstInvoices", e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl text-[11px] text-purple-900 space-y-1">
              <span className="font-bold block">Enterprise Pro:</span>
              <p>Multi-staff accounts, developer REST APIs, tracking pixels & 24/7 priority support.</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
