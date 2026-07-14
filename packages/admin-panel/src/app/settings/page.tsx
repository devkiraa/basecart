"use client";

export const runtime = "edge";

import React, { useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { Settings, Save, Sparkles } from "lucide-react";

export default function SettingsPage() {
  const [StarterPrice, setStarterPrice] = useState("999");
  const [GrowthPrice, setGrowthPrice] = useState("4999");
  const [ProPrice, setProPrice] = useState("9999");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("System configurations and limits saved successfully.");
    }, 800);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure SaaS subscription pricing plans, default product storage ceilings, and legal pages.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-1.5 shadow-sm"
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Settings */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            SaaS Pricing & Plan Allocations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                Starter Price (INR / mo)
              </label>
              <input
                type="number"
                value={StarterPrice}
                onChange={(e) => setStarterPrice(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                Growth Price (INR / mo)
              </label>
              <input
                type="number"
                value={GrowthPrice}
                onChange={(e) => setGrowthPrice(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                Pro Price (INR / mo)
              </label>
              <input
                type="number"
                value={ProPrice}
                onChange={(e) => setProPrice(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
            <span className="text-xs font-bold text-slate-650 block">Feature limit guidelines:</span>
            <ul className="text-xs text-slate-500 list-disc pl-5 space-y-1">
              <li>Starter Plan: Up to 50 products catalog capacity, 100 maximum orders.</li>
              <li>Growth Plan: Up to 500 products catalog capacity, 1,000 maximum orders.</li>
              <li>Pro Plan: Unlimited products, unlimited orders, 0.5% transaction commission fee.</li>
            </ul>
          </div>
        </div>

        {/* Quick Settings Panels */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
            Global Platform Ceilings
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                Storage limit per store (R2)
              </label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none">
                <option value="1">1 GB (Starter)</option>
                <option value="5">5 GB (Growth)</option>
                <option value="25">25 GB (Pro)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                Commission fee per transaction
              </label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none">
                <option value="2">2.0% (Starter)</option>
                <option value="1">1.0% (Growth)</option>
                <option value="0">0% (Pro)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
