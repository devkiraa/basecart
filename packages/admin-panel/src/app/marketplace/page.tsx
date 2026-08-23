"use client";

import React, { useState, useEffect } from "react";
import { 
  Palette, 
  AppWindow, 
  Check, 
  X, 
  Star,
  Download,
  ShieldCheck,
  Plus,
  Sparkles,
  CheckCircle2,
  Layers,
  Code2,
  ExternalLink,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

interface Theme {
  id: string;
  name: string;
  developer: string;
  status: string;
  rating: number;
  downloads: number;
  isFeatured: boolean | number;
  version: string;
}

interface AppItem {
  id: string;
  name: string;
  developer: string;
  status: string;
  scopes: string[];
  version: string;
}

export default function MarketplaceManager() {
  const [activeTab, setActiveTab] = useState("themes");
  const [themes, setThemes] = useState<Theme[]>([]);
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([
      fetch(`${API_URL}/admin/marketplace/themes`, { credentials: "include" }).then((res) => res.json()),
      fetch(`${API_URL}/admin/marketplace/apps`, { credentials: "include" }).then((res) => res.json()),
    ])
      .then(([themeData, appData]) => {
        if (Array.isArray(themeData)) setThemes(themeData);
        if (Array.isArray(appData)) setApps(appData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load marketplace items:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveTheme = async (id: string) => {
    await fetch(`${API_URL}/admin/marketplace/themes/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
      credentials: "include",
    });
    loadData();
  };

  const handleRejectTheme = async (id: string) => {
    await fetch(`${API_URL}/admin/marketplace/themes/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    loadData();
  };

  const handleToggleFeaturedTheme = async (id: string) => {
    const theme = themes.find((t) => t.id === id);
    if (!theme) return;
    const isFeatured = !theme.isFeatured;
    await fetch(`${API_URL}/admin/marketplace/themes/${id}/feature`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured }),
      credentials: "include",
    });
    loadData();
  };

  const handleApproveApp = async (id: string) => {
    await fetch(`${API_URL}/admin/marketplace/apps/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
      credentials: "include",
    });
    loadData();
  };

  const handleRejectApp = async (id: string) => {
    await fetch(`${API_URL}/admin/marketplace/apps/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    loadData();
  };

  const satoshiTheme = themes.find((t) => t.id === "satoshi") || null;
  const submittedThemes = themes.filter((t) => t.id !== "satoshi" && t.status === "pending");
  const otherActiveThemes = themes.filter((t) => t.id !== "satoshi" && t.status === "published");

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Theme & App Marketplace</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage storefront themes, audit developer app permissions, and oversee marketplace integrations.
          </p>
        </div>

        {/* Toggle Tab */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl select-none shrink-0 border border-slate-200/40">
          <button
            onClick={() => setActiveTab("themes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "themes" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Storefront Theme (1 Active)
          </button>
          <button
            onClick={() => setActiveTab("apps")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "apps" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <AppWindow className="w-3.5 h-3.5" />
            App Store Integrations
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "themes" ? (
        <div className="space-y-6">
          {/* Active Core Theme Card — Satoshi */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    Official Core System Theme
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Active on all Storefronts
                  </span>
                </div>

                <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                  {satoshiTheme?.name || "Satoshi"}
                  <span className="text-xs font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-700/50">
                    v{satoshiTheme?.version || "1.0.0"}
                  </span>
                </h2>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Basecart&apos;s flagship storefront design system engineered specifically for Indian SMB merchants. Optimized for mobile conversions, lightning-fast edge rendering, instant search drawers, Razorpay inline checkouts, and native WhatsApp Business order confirmations.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-2.5 py-1 bg-white/10 text-slate-200 rounded-md text-[10px] font-semibold border border-white/10">
                    Plus Jakarta Sans Typography
                  </span>
                  <span className="px-2.5 py-1 bg-white/10 text-slate-200 rounded-md text-[10px] font-semibold border border-white/10">
                    Mobile Bottom Drawer Cart
                  </span>
                  <span className="px-2.5 py-1 bg-white/10 text-slate-200 rounded-md text-[10px] font-semibold border border-white/10">
                    Razorpay Webhooks Native
                  </span>
                  <span className="px-2.5 py-1 bg-white/10 text-slate-200 rounded-md text-[10px] font-semibold border border-white/10">
                    Zero CJS / Clean Edge Hydration
                  </span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3 shrink-0 md:w-64 text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400 font-medium">Developer</span>
                  <span className="font-bold text-white">{satoshiTheme?.developer || "Basecart Core Team"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400 font-medium">Rating</span>
                  <div className="flex items-center gap-1 font-bold text-amber-300">
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                    <span>{satoshiTheme?.rating || 5.0} / 5.0</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400 font-medium">Stores Installed</span>
                  <span className="font-mono font-bold text-white">
                    {loading ? "..." : (satoshiTheme?.downloads || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">License</span>
                  <span className="font-bold text-emerald-400">Included Core</span>
                </div>
              </div>
            </div>
          </div>

          {/* Third-Party Submitted Themes Queue (If any developers submit) */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Submitted Marketplace Themes</h3>
                <p className="text-xs text-slate-500 mt-0.5">Community developer submitted storefront templates pending review.</p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                {submittedThemes.length} Pending Approval
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {submittedThemes.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <Palette className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">No additional theme submissions in the review queue.</p>
                  <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                    All merchant storefront subdomains are currently powered by Basecart&apos;s official <strong>Satoshi</strong> system theme.
                  </p>
                </div>
              ) : (
                submittedThemes.map((theme) => (
                  <div key={theme.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800">{theme.name}</h4>
                      <p className="text-xs text-slate-400 font-semibold">Submitted by {theme.developer} • Ver: {theme.version}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveTheme(theme.id)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectTheme(theme.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* App Approvals queue */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Submitted Ecosystem Apps</h3>
                <p className="text-xs text-slate-500 mt-0.5">Integrations requiring API permission & webhook verification.</p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                {apps.filter((a) => a.status === "pending").length} Pending Review
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {apps.filter((a) => a.status === "pending").length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">No third-party applications waiting in the approval queue.</div>
              ) : (
                apps.filter((a) => a.status === "pending").map((app) => (
                  <div key={app.id} className="p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{app.name}</h4>
                        <p className="text-xs text-slate-400 font-semibold">Integrator: {app.developer} • Ver: {app.version}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {app.scopes?.map((scope) => (
                          <span key={scope} className="px-2 py-0.5 text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 rounded">
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveApp(app.id)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Approve Scope
                      </button>
                      <button
                        onClick={() => handleRejectApp(app.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Published Apps registry */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Active Platform Integrations</h3>
              <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                {apps.filter((a) => a.status === "published").length} Live Extensions
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {apps.filter((a) => a.status === "published").map((app) => (
                <div key={app.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-800">{app.name}</h4>
                    <p className="text-xs text-slate-400 font-semibold">Dev: {app.developer} • Ver: {app.version}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {app.scopes?.map((scope) => (
                        <span key={scope} className="px-2 py-0.5 text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 rounded">
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full flex items-center gap-1 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Extension
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
