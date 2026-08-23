"use client";

import React, { useEffect, useState } from "react";
import { Settings, Save, Shield, Database, Activity, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

interface ConfigState {
  starterPrice: string;
  growthPrice: string;
  proPrice: string;
  starterStorage: string;
  growthStorage: string;
  proStorage: string;
  commissionStarter: string;
  commissionGrowth: string;
  commissionPro: string;
  defaultCurrency: string;
  maintenanceMode: string;
  edgeRegion: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ConfigState>({
    starterPrice: "299",
    growthPrice: "699",
    proPrice: "1499",
    starterStorage: "1",
    growthStorage: "5",
    proStorage: "25",
    commissionStarter: "2.0",
    commissionGrowth: "1.0",
    commissionPro: "0.0",
    defaultCurrency: "INR",
    maintenanceMode: "false",
    edgeRegion: "global",
  });

  const [activeTab, setActiveTab] = useState<"pricing" | "limits" | "edge">("pricing");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(`${API_URL}/admin/system-settings`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load platform settings");
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (err: any) {
        console.error(err);
        setError("Could not retrieve system configurations.");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`${API_URL}/admin/system-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update system settings");
      setMessage("System settings successfully persisted to D1 Control database.");
    } catch (err: any) {
      console.error(err);
      setError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof ConfigState, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mr-2" />
        <span className="text-slate-500 text-sm font-semibold">Loading system settings...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Advanced System Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Global configurations for subscription models, storage limits, and server-side edge behaviors.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all inline-flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Save Configuration</span>
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-850 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-850 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 flex flex-row lg:flex-col gap-2 border-b lg:border-b-0 lg:border-r border-slate-200 pb-4 lg:pb-0 lg:pr-6 overflow-x-auto whitespace-nowrap">
          <button
            type="button"
            onClick={() => setActiveTab("pricing")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "pricing"
                ? "bg-indigo-50 text-indigo-700 shadow-sm"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Pricing Plans</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("limits")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "limits"
                ? "bg-indigo-50 text-indigo-700 shadow-sm"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Storage & Commission</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("edge")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "edge"
                ? "bg-indigo-50 text-indigo-700 shadow-sm"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Edge Infrastructure</span>
          </button>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {activeTab === "pricing" && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
                SaaS Subscription Pricing
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                    Starter Price (INR / Month)
                  </label>
                  <input
                    type="number"
                    value={settings.starterPrice}
                    onChange={(e) => updateSetting("starterPrice", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                    Growth Price (INR / Month)
                  </label>
                  <input
                    type="number"
                    value={settings.growthPrice}
                    onChange={(e) => updateSetting("growthPrice", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                    Pro Price (INR / Month)
                  </label>
                  <input
                    type="number"
                    value={settings.proPrice}
                    onChange={(e) => updateSetting("proPrice", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 text-xs">
                <span className="font-bold text-slate-700 block">SaaS guidelines:</span>
                <ul className="text-slate-500 list-disc pl-5 space-y-1">
                  <li>Starter: Recommended for small shops (up to 50 items).</li>
                  <li>Growth: Recommended for scaling boutiques (up to 500 items).</li>
                  <li>Pro: Recommended for enterprise catalog scale.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "limits" && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
                Global Platform Ceilings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                    Starter Max Storage (R2 GB)
                  </label>
                  <input
                    type="number"
                    value={settings.starterStorage}
                    onChange={(e) => updateSetting("starterStorage", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                    Starter Commission Fee (%)
                  </label>
                  <input
                    type="text"
                    value={settings.commissionStarter}
                    onChange={(e) => updateSetting("commissionStarter", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                    Growth Max Storage (R2 GB)
                  </label>
                  <input
                    type="number"
                    value={settings.growthStorage}
                    onChange={(e) => updateSetting("growthStorage", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                    Growth Commission Fee (%)
                  </label>
                  <input
                    type="text"
                    value={settings.commissionGrowth}
                    onChange={(e) => updateSetting("commissionGrowth", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                    Pro Max Storage (R2 GB)
                  </label>
                  <input
                    type="number"
                    value={settings.proStorage}
                    onChange={(e) => updateSetting("proStorage", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                    Pro Commission Fee (%)
                  </label>
                  <input
                    type="text"
                    value={settings.commissionPro}
                    onChange={(e) => updateSetting("commissionPro", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "edge" && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
                Edge Routing & Mode Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                    Default Platform Currency
                  </label>
                  <select
                    value={settings.defaultCurrency}
                    onChange={(e) => updateSetting("defaultCurrency", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                    System Maintenance Mode
                  </label>
                  <select
                    value={settings.maintenanceMode}
                    onChange={(e) => updateSetting("maintenanceMode", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="false">Operational (Online)</option>
                    <option value="true">Under Maintenance (Offline)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                    Primary Route Target Region
                  </label>
                  <select
                    value={settings.edgeRegion}
                    onChange={(e) => updateSetting("edgeRegion", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="global">Edge Global Anycast</option>
                    <option value="in">India Primary Regions</option>
                    <option value="us">United States Regions</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
