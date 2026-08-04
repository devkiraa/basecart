"use client";

import React, { useState } from "react";
import { FileText, Shield, Save, CheckCircle2 } from "lucide-react";

export default function LegalSettingsTab() {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");
  const [termsContent, setTermsContent] = useState(
    `# Terms of Service\n\nWelcome to our store. By purchasing products from us, you agree to the following terms:\n1. Orders are subject to stock availability.\n2. Returns are accepted within 7 days of delivery in original condition.\n3. Shipping fees are non-refundable.`
  );
  const [privacyContent, setPrivacyContent] = useState(
    `# Privacy Policy\n\nWe value your privacy. We collect customer name, email, shipping address, and phone number strictly for order processing and delivery purposes. We do not sell or rent customer information to third parties.`
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Legal Documents & Policies</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage public Terms of Service and Privacy Policy rendered on your storefront checkout and footer.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          <Save size={14} /> Save Legal Settings
        </button>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          Terms and Privacy Policy successfully saved!
        </div>
      )}

      {/* Tabs selector */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab("terms")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
            activeTab === "terms" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText size={14} /> Terms of Service
        </button>
        <button
          onClick={() => setActiveTab("privacy")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
            activeTab === "privacy" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Shield size={14} /> Privacy Policy
        </button>
      </div>

      {/* Policy Editor */}
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400">
          {activeTab === "terms" ? "Terms of Service Content (Markdown / Text)" : "Privacy Policy Content (Markdown / Text)"}
        </label>
        <textarea
          rows={12}
          value={activeTab === "terms" ? termsContent : privacyContent}
          onChange={(e) =>
            activeTab === "terms" ? setTermsContent(e.target.value) : setPrivacyContent(e.target.value)
          }
          className="w-full p-4 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
        />
      </div>
    </div>
  );
}
