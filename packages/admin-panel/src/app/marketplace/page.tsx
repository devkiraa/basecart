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
  Plus
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
      fetch(`${API_URL}/admin/marketplace/themes`, { credentials: "include" }).then(res => res.json()),
      fetch(`${API_URL}/admin/marketplace/apps`, { credentials: "include" }).then(res => res.json())
    ])
      .then(([themeData, appData]) => {
        if (Array.isArray(themeData)) setThemes(themeData);
        if (Array.isArray(appData)) setApps(appData);
        setLoading(false);
      })
      .catch(err => {
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
      credentials: "include"
    });
    loadData();
  };

  const handleRejectTheme = async (id: string) => {
    await fetch(`${API_URL}/admin/marketplace/themes/${id}`, {
      method: "DELETE",
      credentials: "include"
    });
    loadData();
  };

  const handleToggleFeaturedTheme = async (id: string) => {
    const theme = themes.find(t => t.id === id);
    if (!theme) return;
    const isFeatured = !theme.isFeatured;
    await fetch(`${API_URL}/admin/marketplace/themes/${id}/feature`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured }),
      credentials: "include"
    });
    loadData();
  };

  const handleApproveApp = async (id: string) => {
    await fetch(`${API_URL}/admin/marketplace/apps/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
      credentials: "include"
    });
    loadData();
  };

  const handleRejectApp = async (id: string) => {
    await fetch(`${API_URL}/admin/marketplace/apps/${id}`, {
      method: "DELETE",
      credentials: "include"
    });
    loadData();
  };

  return (
    <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Theme & App Marketplace</h1>
            <p className="text-sm text-slate-500 mt-1">
              Approve merchant templates, check webhook API permissions, features directory, and monitor ratings.
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
              Theme Gallery
            </button>
            <button
              onClick={() => setActiveTab("apps")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "apps" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <AppWindow className="w-3.5 h-3.5" />
              App Store Integration
            </button>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === "themes" ? (
          <div className="space-y-6">
            
            {/* Pending Approvals */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Submitted Themes (Approval Queue)</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {themes.filter(t => t.status === "pending").length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">No themes waiting in the queue.</div>
                ) : (
                  themes.filter(t => t.status === "pending").map((theme) => (
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

            {/* Active themes registry */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Active Storefront Themes</h2>
                <span className="text-xs text-slate-400 font-semibold">{themes.filter(t => t.status === "published").length} active</span>
              </div>
              <div className="divide-y divide-slate-100">
                {themes.filter(t => t.status === "published").map((theme) => (
                  <div key={theme.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-800">{theme.name}</h4>
                        {theme.isFeatured && (
                          <span className="px-2 py-0.5 text-[8px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-semibold">Dev: {theme.developer} • Ver: {theme.version}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                      <div className="flex items-center gap-1">
                        <Star className="w-4.5 h-4.5 text-amber-400 fill-amber-400" />
                        <span>{theme.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4 text-slate-400" />
                        <span>{theme.downloads}</span>
                      </div>
                      <button
                        onClick={() => handleToggleFeaturedTheme(theme.id)}
                        className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all active:scale-95 ${
                          theme.isFeatured 
                            ? "bg-slate-100 border-slate-350 text-slate-700 hover:bg-slate-200" 
                            : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        {theme.isFeatured ? "Unfeature" : "Feature"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="space-y-6">
            
            {/* App Approvals queue */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Submitted Apps (API Permission Verification)</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {apps.filter(a => a.status === "pending").length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">No applications waiting in the queue.</div>
                ) : (
                  apps.filter(a => a.status === "pending").map((app) => (
                    <div key={app.id} className="p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                      <div className="space-y-2">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{app.name}</h4>
                          <p className="text-xs text-slate-400 font-semibold">Integrator: {app.developer} • Ver: {app.version}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {app.scopes.map(s => (
                            <span key={s} className="px-1.5 py-0.5 rounded font-mono text-[9px] bg-slate-150 text-slate-650 border border-slate-250">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApproveApp(app.id)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Publish App
                        </button>
                        <button
                          onClick={() => handleRejectApp(app.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Reject App
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Published Apps Registry */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Active Platform Integrations</h2>
                <span className="text-xs text-slate-400 font-semibold">{apps.filter(a => a.status === "published").length} active</span>
              </div>
              <div className="divide-y divide-slate-100">
                {apps.filter(a => a.status === "published").map((app) => (
                  <div key={app.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-slate-800">{app.name}</h4>
                      <p className="text-xs text-slate-400 font-semibold">Developer: {app.developer} • Ver: {app.version}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {app.scopes.map(s => (
                          <span key={s} className="px-1.5 py-0.5 rounded font-mono text-[9px] bg-slate-100 text-slate-500 border border-slate-200/80">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Validated
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
  );
}
