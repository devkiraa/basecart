"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Save, RefreshCw, CheckCircle, AlertCircle, Eye, Palette, Globe, Mail, Image as ImageIcon } from "lucide-react";

interface BrandIdentityTabProps {
  token: string;
  API_URL: string;
  settings: any;
  onUpdateSettings?: (newSettings: any) => void;
}

const PRESET_PALETTES = [
  { name: "Royal Indigo", primary: "#4F46E5", accent: "#4338CA" },
  { name: "Emerald Teal", primary: "#0D9488", accent: "#0F766E" },
  { name: "Crimson Rose", primary: "#E11D48", accent: "#BE123C" },
  { name: "Midnight Obsidian", primary: "#0F172A", accent: "#1E293B" },
  { name: "Violet Amethyst", primary: "#7C3AED", accent: "#6D28D9" },
  { name: "Sunset Gold", primary: "#D97706", accent: "#B45309" },
];

export default function BrandIdentityTab({ token, API_URL, settings, onUpdateSettings }: BrandIdentityTabProps) {
  const [formData, setFormData] = useState({
    storeName: settings?.storeName || "",
    tagline: settings?.branding?.tagline || "Premium quality goods & fast checkout.",
    logoUrl: settings?.branding?.logoUrl || "",
    primaryColor: settings?.branding?.primaryColor || "#4F46E5",
    accentColor: settings?.branding?.accentColor || "#4338CA",
    emailSignature: settings?.branding?.emailSignature || `${settings?.storeName || "Basecart"} Team • Customer Support`,
  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [previewTab, setPreviewTab] = useState<"storefront" | "email">("storefront");
  const [previewBgDark, setPreviewBgDark] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        storeName: settings.storeName || "",
        tagline: settings.branding?.tagline || "Premium quality goods & fast checkout.",
        logoUrl: settings.branding?.logoUrl || "",
        primaryColor: settings.branding?.primaryColor || "#4F46E5",
        accentColor: settings.branding?.accentColor || "#4338CA",
        emailSignature: settings.branding?.emailSignature || `${settings.storeName || "Basecart"} Team • Customer Support`,
      });
    }
  }, [settings]);

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // 1. Sync store settings & branding JSON
      const resSettings = await fetch(`${API_URL}/store/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          storeName: formData.storeName,
          branding: {
            logoUrl: formData.logoUrl,
            primaryColor: formData.primaryColor,
            accentColor: formData.accentColor,
            tagline: formData.tagline,
            emailSignature: formData.emailSignature,
          },
        }),
        credentials: "include",
      });

      if (!resSettings.ok) {
        const errData = await resSettings.json();
        throw new Error(errData.error || "Failed to update store branding");
      }

      const updatedStoreData = await resSettings.json();

      // 2. Sync email settings for unified email template rendering
      await fetch(`${API_URL}/store/emails/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email_color_primary: formData.primaryColor,
          email_logo_url: formData.logoUrl,
          email_signature: formData.emailSignature,
        }),
        credentials: "include",
      });

      setSuccessMessage("Brand Identity saved & synchronized across all emails and store designs!");
      if (onUpdateSettings) {
        onUpdateSettings(updatedStoreData);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while saving brand identity.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-1 text-slate-900">Brand & Identity</h2>
        <p className="text-xs text-slate-500">
          Centralize your store name, logo, color palette, and email signatures. All changes dynamically apply across your store themes and transactional email templates.
        </p>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-100 text-red-800 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Brand Configuration Form */}
        <form onSubmit={handleSaveBrand} className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="h-4.5 w-4.5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">Brand Core Identity</h3>
          </div>

          {/* Store Name & Tagline */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Official Store Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                placeholder="e.g. Pixelart Store"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Store Slogan / Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g. Premium handcrafted goods & digital art"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Brand Logo URL */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700">Brand Logo Image URL</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                <ImageIcon className="h-4 w-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">Used for email headers and store navigation logos. Recommended size: 512x512 transparent PNG/SVG.</p>
          </div>

          {/* Color Palette */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700">Primary Brand Palette</label>
            
            {/* Presets */}
            <div className="grid grid-cols-3 gap-2">
              {PRESET_PALETTES.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setFormData({ ...formData, primaryColor: p.primary, accentColor: p.accent })}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                    formData.primaryColor === p.primary ? "border-indigo-600 bg-indigo-50/50 shadow-sm" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="h-4 w-4 rounded-full shrink-0 border border-slate-300" style={{ backgroundColor: p.primary }}></span>
                  <span className="text-[11px] font-bold text-slate-700 truncate">{p.name}</span>
                </button>
              ))}
            </div>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-600">Primary Color (Hex)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="h-8 w-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-600">Accent Color (Hex)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="h-8 w-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Email Footer & Signature */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700">Email Footer & Signature Text</label>
            <input
              type="text"
              value={formData.emailSignature}
              onChange={(e) => setFormData({ ...formData, emailSignature: e.target.value })}
              placeholder="e.g. The Pixelart Team • Support: hello@pixelart.app"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-400">Appears at the bottom of all outbound order confirmations and marketing broadcasts.</p>
          </div>

          {/* Save Action */}
          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:bg-indigo-400"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Synchronizing Brand Identity...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Brand Identity
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Unified Multi-Preview Display */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800">Unified Real-Time Brand Preview</span>
            </div>

            {/* Toggle Preview Mode */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => setPreviewTab("storefront")}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  previewTab === "storefront" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Globe className="h-3.5 w-3.5" /> Storefront
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("email")}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  previewTab === "email" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Mail className="h-3.5 w-3.5" /> Email Notification
              </button>
            </div>
          </div>

          {/* PREVIEW CONTAINER */}
          <div className="bg-slate-900/5 p-4 rounded-2xl border border-slate-200/60 shadow-inner min-h-[440px]">
            {previewTab === "storefront" ? (
              /* STOREFRONT PREVIEW CARD */
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden text-left font-sans">
                {/* Store Header Navigation */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Store Logo" className="h-8 w-8 object-contain rounded-md" />
                    ) : (
                      <div className="h-8 w-8 rounded-md flex items-center justify-center font-bold text-white text-xs" style={{ backgroundColor: formData.primaryColor }}>
                        {(formData.storeName || "B").substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 tracking-tight leading-none">{formData.storeName || "Your Store"}</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{formData.tagline}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                    <span>Catalog</span>
                    <span>Collections</span>
                    <button className="px-3 py-1.5 text-white rounded-lg font-bold text-xs shadow-sm transition-all" style={{ backgroundColor: formData.primaryColor }}>
                      Bag (0)
                    </button>
                  </div>
                </div>

                {/* Hero Banner Showcase */}
                <div className="p-8 text-center space-y-4" style={{ backgroundColor: `${formData.primaryColor}0D` }}>
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase border" style={{ color: formData.primaryColor, borderColor: `${formData.primaryColor}30`, backgroundColor: `${formData.primaryColor}15` }}>
                    Featured Collection
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Welcome to {formData.storeName || "Our Store"}</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">{formData.tagline}</p>
                  <div className="pt-2 flex justify-center gap-3">
                    <button className="px-5 py-2 text-white font-bold text-xs rounded-xl shadow-md" style={{ backgroundColor: formData.primaryColor }}>
                      Shop Now
                    </button>
                    <button className="px-5 py-2 font-bold text-xs text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
                      Explore Catalog
                    </button>
                  </div>
                </div>

                {/* Product Card Grid */}
                <div className="p-6 grid grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="border border-slate-100 rounded-lg p-3 space-y-2">
                      <div className="h-24 bg-slate-100 rounded-md flex items-center justify-center text-slate-300 text-xs font-bold">
                        Product Image #{i}
                      </div>
                      <h5 className="text-xs font-bold text-slate-800">Sample Item #{i}</h5>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900">₹1,299</span>
                        <button className="text-[10px] font-bold px-2 py-1 rounded text-white" style={{ backgroundColor: formData.primaryColor }}>
                          + Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* EMAIL PREVIEW CARD */
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden text-left font-sans max-w-md mx-auto">
                {/* Email Banner Header */}
                <div className="p-6 text-center text-white" style={{ backgroundColor: formData.primaryColor }}>
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo" className="h-10 mx-auto object-contain mb-2 bg-white/10 p-1.5 rounded-lg" />
                  ) : (
                    <div className="h-10 w-10 mx-auto rounded-lg bg-white/20 flex items-center justify-center font-bold text-white text-sm mb-2">
                      {(formData.storeName || "B").substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <h4 className="font-extrabold text-base tracking-tight">{formData.storeName || "Basecart Store"}</h4>
                  <p className="text-[11px] text-white/80 font-medium">Order Confirmation #INV-2026-9921</p>
                </div>

                {/* Email Body */}
                <div className="p-6 space-y-4 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">Hello Customer,</p>
                  <p className="leading-relaxed">
                    Thank you for your order! Your purchase has been confirmed and is currently being processed by {formData.storeName || "our team"}.
                  </p>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5">
                    <div className="flex justify-between font-bold text-slate-800 text-[11px]">
                      <span>Order #ord_9921</span>
                      <span style={{ color: formData.primaryColor }}>₹2,499.00</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Payment method: Razorpay Standard (Paid)</div>
                  </div>

                  <div className="text-center pt-2">
                    <button className="px-5 py-2 text-white font-bold text-xs rounded-lg shadow-sm" style={{ backgroundColor: formData.primaryColor }}>
                      View Order Status
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center space-y-1">
                    <p className="font-semibold text-slate-600">{formData.emailSignature || `${formData.storeName} Team`}</p>
                    <p>Powered by Basecart E-Commerce Engine</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
