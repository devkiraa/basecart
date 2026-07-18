"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Palette,
  Save,
  Loader2,
  Eye,
  Star,
  Layout,
  Type,
  Megaphone,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Globe,
  Paintbrush,
  Sparkles,
  CheckCircle2,
  MonitorSmartphone,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const STOREFRONT_DOMAIN = (
  process.env.NEXT_PUBLIC_STOREFRONT_DOMAIN || "basecart.app"
).replace(/^(https?:\/\/)/, "");

interface Merchant {
  tenantId: string;
  storeName: string;
  subdomain: string;
  plan: "starter" | "growth" | "pro";
  status: "active" | "suspended";
  createdAt: string;
}

interface MerchantDesign {
  allowDesignCustomization: boolean;
  overrideTheme: string | null;
}

interface PlatformDefaults {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  buttonRadius: string;
  announcementBar: { enabled: boolean; text: string };
  stickyHeader: boolean;
  defaultTemplate: string;
  customerCustomization: {
    enabled: boolean;
    allowColors: boolean;
    allowFonts: boolean;
    allowLayout: boolean;
    allowAnnouncementBar: boolean;
  };
}

const TEMPLATES = [
  {
    id: "aura",
    name: "Aura",
    description: "Clean and minimal with soft gradients and airy spacing.",
    colors: ["#6366f1", "#f8fafc", "#0f172a"],
  },
  {
    id: "pulse",
    name: "Pulse",
    description: "Bold and energetic with vibrant accent colors and sharp edges.",
    colors: ["#ef4444", "#fef2f2", "#1c1917"],
  },
  {
    id: "origin",
    name: "Origin",
    description: "Classic and trustworthy with warm neutrals and serif accents.",
    colors: ["#b45309", "#fef3c7", "#451a03"],
  },
  {
    id: "stride",
    name: "Stride",
    description: "Modern and technical with monochrome tones and geometric shapes.",
    colors: ["#059669", "#ecfdf5", "#022c22"],
  },
];

const FONTS = [
  { id: "sans", label: "Sans-Serif" },
  { id: "serif", label: "Serif" },
  { id: "mono", label: "Monospace" },
];

const RADII = [
  { value: "0px", label: "Square" },
  { value: "4px", label: "Slight" },
  { value: "8px", label: "Rounded" },
  { value: "9999px", label: "Pill" },
];

export default function StorefrontDesignPage() {
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Platform defaults
  const [defaults, setDefaults] = useState<PlatformDefaults>({
    primaryColor: "#6366f1",
    accentColor: "#818cf8",
    fontFamily: "sans",
    buttonRadius: "8px",
    announcementBar: { enabled: false, text: "Welcome to our store!" },
    stickyHeader: true,
    defaultTemplate: "aura",
    customerCustomization: {
      enabled: false,
      allowColors: true,
      allowFonts: true,
      allowLayout: false,
      allowAnnouncementBar: true,
    },
  });

  // Merchants
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [merchantDesigns, setMerchantDesigns] = useState<
    Record<string, MerchantDesign>
  >({});
  const [expandedMerchant, setExpandedMerchant] = useState<string | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [savingDefaults, setSavingDefaults] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savingMerchant, setSavingMerchant] = useState<string | null>(null);

  // Fetch merchants
  useEffect(() => {
    fetch(`${API_URL}/admin/merchants`, { credentials: "include" })
      .then((r) => r.json())
      .then((data: Merchant[]) => {
        setMerchants(data);
        const designs: Record<string, MerchantDesign> = {};
        data.forEach((m) => {
          designs[m.tenantId] = {
            allowDesignCustomization: true,
            overrideTheme: null,
          };
        });
        setMerchantDesigns(designs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Send theme to preview iframe
  useEffect(() => {
    if (previewRef.current?.contentWindow) {
      previewRef.current.contentWindow.postMessage(
        { type: "theme-update", theme: defaults },
        "*"
      );
    }
  }, [defaults]);

  const handleSaveDefaults = async () => {
    setSavingDefaults(true);
    setSaveSuccess(false);
    try {
      await fetch(`${API_URL}/admin/storefront-design`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defaults),
        credentials: "include",
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save defaults:", err);
    } finally {
      setSavingDefaults(false);
    }
  };

  const handleSetDefaultTemplate = async (templateId: string) => {
    setDefaults((prev) => ({ ...prev, defaultTemplate: templateId }));
  };

  const handleToggleMerchantDesign = async (
    tenantId: string,
    allowed: boolean
  ) => {
    setMerchantDesigns((prev) => ({
      ...prev,
      [tenantId]: { ...prev[tenantId], allowDesignCustomization: allowed },
    }));
    setSavingMerchant(tenantId);
    try {
      await fetch(`${API_URL}/admin/storefront-design/merchant/${tenantId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allowDesignCustomization: allowed,
          overrideTheme: merchantDesigns[tenantId]?.overrideTheme,
        }),
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to update merchant design:", err);
    } finally {
      setSavingMerchant(null);
    }
  };

  const handleOverrideTheme = async (tenantId: string, template: string) => {
    setMerchantDesigns((prev) => ({
      ...prev,
      [tenantId]: {
        ...prev[tenantId],
        overrideTheme: template || null,
      },
    }));
    setSavingMerchant(tenantId);
    try {
      await fetch(`${API_URL}/admin/storefront-design/merchant/${tenantId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allowDesignCustomization:
            merchantDesigns[tenantId]?.allowDesignCustomization ?? true,
          overrideTheme: template || null,
        }),
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to override theme:", err);
    } finally {
      setSavingMerchant(null);
    }
  };

  const handleResetMerchant = async (tenantId: string) => {
    setMerchantDesigns((prev) => ({
      ...prev,
      [tenantId]: { allowDesignCustomization: true, overrideTheme: null },
    }));
    setSavingMerchant(tenantId);
    try {
      await fetch(`${API_URL}/admin/storefront-design/merchant/${tenantId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allowDesignCustomization: true,
          overrideTheme: null,
        }),
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to reset merchant design:", err);
    } finally {
      setSavingMerchant(null);
    }
  };

  const planBadge = (plan: string) =>
    plan === "pro"
      ? "bg-purple-50 text-purple-700 border border-purple-100"
      : plan === "growth"
      ? "bg-blue-50 text-blue-700 border border-blue-100"
      : "bg-slate-100 text-slate-600 border border-slate-200/55";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Storefront Design Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure platform-wide theme defaults, manage page templates, and
            control per-merchant design customization permissions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column — Settings */}
        <div className="xl:col-span-2 space-y-6">
          {/* Platform Defaults */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-500" />
              Platform Defaults
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Color */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">
                  Default Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={defaults.primaryColor}
                    onChange={(e) =>
                      setDefaults((p) => ({
                        ...p,
                        primaryColor: e.target.value,
                      }))
                    }
                    className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={defaults.primaryColor}
                    onChange={(e) =>
                      setDefaults((p) => ({
                        ...p,
                        primaryColor: e.target.value,
                      }))
                    }
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">
                  Default Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={defaults.accentColor}
                    onChange={(e) =>
                      setDefaults((p) => ({
                        ...p,
                        accentColor: e.target.value,
                      }))
                    }
                    className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={defaults.accentColor}
                    onChange={(e) =>
                      setDefaults((p) => ({
                        ...p,
                        accentColor: e.target.value,
                      }))
                    }
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Font Family */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">
                  Default Font Family
                </label>
                <select
                  value={defaults.fontFamily}
                  onChange={(e) =>
                    setDefaults((p) => ({
                      ...p,
                      fontFamily: e.target.value,
                    }))
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none"
                >
                  {FONTS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Button Radius */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">
                  Default Button Radius
                </label>
                <div className="flex gap-2">
                  {RADII.map((r) => (
                    <button
                      key={r.value}
                      onClick={() =>
                        setDefaults((p) => ({ ...p, buttonRadius: r.value }))
                      }
                      className={`flex-1 py-2 text-xs font-semibold border rounded-lg transition-colors ${
                        defaults.buttonRadius === r.value
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Announcement Bar */}
            <div className="border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-slate-400" />
                  Announcement Bar
                </label>
                <button
                  onClick={() =>
                    setDefaults((p) => ({
                      ...p,
                      announcementBar: {
                        ...p.announcementBar,
                        enabled: !p.announcementBar.enabled,
                      },
                    }))
                  }
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    defaults.announcementBar.enabled
                      ? "bg-indigo-600"
                      : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      defaults.announcementBar.enabled
                        ? "translate-x-5"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              {defaults.announcementBar.enabled && (
                <input
                  type="text"
                  value={defaults.announcementBar.text}
                  onChange={(e) =>
                    setDefaults((p) => ({
                      ...p,
                      announcementBar: {
                        ...p.announcementBar,
                        text: e.target.value,
                      },
                    }))
                  }
                  placeholder="Enter announcement text..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                />
              )}
            </div>

            {/* Sticky Header */}
            <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Layout className="w-4 h-4 text-slate-400" />
                Sticky Header
              </label>
              <button
                onClick={() =>
                  setDefaults((p) => ({ ...p, stickyHeader: !p.stickyHeader }))
                }
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  defaults.stickyHeader ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    defaults.stickyHeader
                      ? "translate-x-5"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Save */}
            <div className="border-t border-slate-100 pt-5 flex items-center gap-3">
              <button
                onClick={handleSaveDefaults}
                disabled={savingDefaults}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                {savingDefaults ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {savingDefaults ? "Saving..." : "Save Defaults"}
              </button>
              {saveSuccess && (
                <span className="text-sm text-emerald-600 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Saved successfully
                </span>
              )}
            </div>
          </div>

          {/* Page Templates */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Page Templates
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TEMPLATES.map((t) => (
                <div
                  key={t.id}
                  className={`border rounded-xl p-5 transition-all ${
                    defaults.defaultTemplate === t.id
                      ? "border-indigo-300 bg-indigo-50/30 ring-1 ring-indigo-200"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* Color swatches */}
                  <div className="flex gap-1.5 mb-3">
                    {t.colors.map((c, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-md border border-slate-200/60"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  <h4 className="font-bold text-slate-800 text-sm">{t.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {t.description}
                  </p>

                  {defaults.defaultTemplate === t.id && (
                    <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                      <Star className="w-3 h-3" />
                      Default
                    </span>
                  )}

                  <div className="flex gap-2 mt-4">
                    <a
                      href={`/?previewThemeBase=${t.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </a>
                    {defaults.defaultTemplate !== t.id && (
                      <button
                        onClick={() => handleSetDefaultTemplate(t.id)}
                        className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Per-Merchant Design Control */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <Paintbrush className="w-4 h-4 text-indigo-500" />
              Per-Merchant Design Control
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-slate-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : merchants.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No merchants found.
              </div>
            ) : (
              <div className="space-y-3">
                {merchants.map((m) => {
                  const design = merchantDesigns[m.tenantId];
                  const expanded = expandedMerchant === m.tenantId;
                  return (
                    <div
                      key={m.tenantId}
                      className="border border-slate-200 rounded-lg overflow-hidden"
                    >
                      {/* Row */}
                      <div className="flex items-center gap-4 px-4 py-3 bg-white">
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() =>
                              setExpandedMerchant(
                                expanded ? null : m.tenantId
                              )
                            }
                            className="text-left flex items-center gap-2 hover:text-indigo-600 transition-colors"
                          >
                            <span className="font-semibold text-sm text-slate-800 truncate">
                              {m.storeName}
                            </span>
                            {expanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                          </button>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                            {m.subdomain}.{STOREFRONT_DOMAIN.replace(/:[0-9]+$/, "")}
                          </p>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${planBadge(
                            m.plan
                          )}`}
                        >
                          {m.plan}
                        </span>

                        {/* Toggle */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">
                            {design?.allowDesignCustomization
                              ? "Custom"
                              : "Locked"}
                          </span>
                          <button
                            onClick={() =>
                              handleToggleMerchantDesign(
                                m.tenantId,
                                !design?.allowDesignCustomization
                              )
                            }
                            disabled={savingMerchant === m.tenantId}
                            className={`relative w-9 h-5 rounded-full transition-colors ${
                              design?.allowDesignCustomization
                                ? "bg-indigo-600"
                                : "bg-slate-300"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                design?.allowDesignCustomization
                                  ? "translate-x-4"
                                  : "translate-x-0.5"
                              }`}
                            />
                          </button>
                          {design?.allowDesignCustomization ? (
                            <Unlock className="w-3.5 h-3.5 text-indigo-500" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expanded && (
                        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-4 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Theme Preview */}
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">
                                Current Theme Preview
                              </label>
                              <div className="w-full h-28 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
                                <div className="text-center">
                                  <MonitorSmartphone className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                                  <span className="text-xs text-slate-400 font-medium">
                                    {design?.overrideTheme
                                      ? TEMPLATES.find(
                                          (t) => t.id === design.overrideTheme
                                        )?.name || design.overrideTheme
                                      : TEMPLATES.find(
                                          (t) => t.id === defaults.defaultTemplate
                                        )?.name || "Aura"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Override Theme */}
                            <div className="space-y-3">
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">
                                  Override Theme
                                </label>
                                <select
                                  value={design?.overrideTheme || ""}
                                  onChange={(e) =>
                                    handleOverrideTheme(
                                      m.tenantId,
                                      e.target.value
                                    )
                                  }
                                  disabled={
                                    !design?.allowDesignCustomization ||
                                    savingMerchant === m.tenantId
                                  }
                                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                                >
                                  <option value="">
                                    Use Platform Default
                                  </option>
                                  {TEMPLATES.map((t) => (
                                    <option key={t.id} value={t.id}>
                                      {t.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <button
                                onClick={() => handleResetMerchant(m.tenantId)}
                                disabled={savingMerchant === m.tenantId}
                                className="px-3 py-1.5 border border-slate-200 hover:bg-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 text-slate-600"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Reset to Defaults
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Customer Design Settings */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" />
              Customer Design Settings
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Allow Customers to Customize Storefront
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  When enabled, customers see a &quot;Customize&quot; button on their
                  storefront.
                </p>
              </div>
              <button
                onClick={() =>
                  setDefaults((p) => ({
                    ...p,
                    customerCustomization: {
                      ...p.customerCustomization,
                      enabled: !p.customerCustomization.enabled,
                    },
                  }))
                }
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  defaults.customerCustomization.enabled
                    ? "bg-indigo-600"
                    : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    defaults.customerCustomization.enabled
                      ? "translate-x-5"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {defaults.customerCustomization.enabled && (
              <div className="border-t border-slate-100 pt-4 space-y-3">
                {[
                  {
                    key: "allowColors" as const,
                    label: "Allow Color Customization",
                  },
                  {
                    key: "allowFonts" as const,
                    label: "Allow Font Customization",
                  },
                  {
                    key: "allowLayout" as const,
                    label: "Allow Layout Customization",
                  },
                  {
                    key: "allowAnnouncementBar" as const,
                    label: "Allow Announcement Bar Editing",
                  },
                ].map((opt) => (
                  <div
                    key={opt.key}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm text-slate-600">{opt.label}</span>
                    <button
                      onClick={() =>
                        setDefaults((p) => ({
                          ...p,
                          customerCustomization: {
                            ...p.customerCustomization,
                            [opt.key]: !p.customerCustomization[opt.key],
                          },
                        }))
                      }
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        defaults.customerCustomization[opt.key]
                          ? "bg-indigo-600"
                          : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          defaults.customerCustomization[opt.key]
                            ? "translate-x-4"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column — Live Preview */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden sticky top-6">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-500" />
                Live Preview
              </h3>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Real-time
              </span>
            </div>
            <div className="p-3">
              <div className="w-full aspect-[4/5] rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                <iframe
                  ref={previewRef}
                  src="/"
                  title="Storefront Preview"
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>
            </div>
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-[10px] text-slate-400 text-center">
                Preview updates as you modify settings on the left.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
