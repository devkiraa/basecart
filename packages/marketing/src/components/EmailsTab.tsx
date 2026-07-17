"use client";

import React, { useState, useEffect } from "react";
import { Mail, Send, Eye, Code, FileText, CheckCircle2, AlertTriangle, Settings, RefreshCw, Save } from "lucide-react";

interface EmailsTabProps {
  token: string;
  API_URL: string;
  storeName: string;
}

const DEFAULT_MOCKS: Record<string, Record<string, any>> = {
  "order-confirmation": {
    orderId: "ord_e4892c",
    customerName: "Rohan K",
    total: 1450,
    invoiceNumber: "INV-2026-0089",
  },
  "order-shipped": {
    orderId: "ord_e4892c",
    customerName: "Rohan K",
    trackingNumber: "TRK-DELHIVERY-99881",
    carrier: "Delhivery",
    trackingUrl: "https://delhivery.com/track/TRK-DELHIVERY-99881",
  },
  invoice: {
    invoiceNumber: "INV-2026-0089",
    billingMonth: "July 2026",
    amount: 1450,
    paymentDueDate: "2026-08-01",
    downloadUrl: "https://basecart.app/invoice/download",
  },
};

const TEMPLATE_NAMES: Record<string, string> = {
  "order-confirmation": "Order Confirmation",
  "order-shipped": "Order Shipped Notification",
  invoice: "Customer Tax Invoice",
};

export default function EmailsTab({ token, API_URL, storeName }: EmailsTabProps) {
  const [emailSettings, setEmailSettings] = useState({
    email_color_primary: "",
    email_logo_url: "",
    email_signature: "",
  });

  const [selectedType, setSelectedType] = useState<string>("order-confirmation");
  const [mockData, setMockData] = useState<Record<string, any>>(DEFAULT_MOCKS["order-confirmation"]);
  const [rendered, setRendered] = useState<any>(null);

  const [activeSubTab, setActiveSubTab] = useState<"preview" | "html" | "text">("preview");
  const [testRecipient, setTestRecipient] = useState("");

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  // Load custom email settings
  useEffect(() => {
    async function loadEmailSettings() {
      try {
        const res = await fetch(`${API_URL}/store/email-settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setEmailSettings({
            email_color_primary: data.email_color_primary || "",
            email_logo_url: data.email_logo_url || "",
            email_signature: data.email_signature || "",
          });
        }
      } catch (err) {
        console.error("Failed to load email configurations:", err);
      } finally {
        setLoadingSettings(false);
      }
    }
    if (token) {
      loadEmailSettings();
    }
  }, [token, API_URL]);

  // Update mock data template type
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setMockData(DEFAULT_MOCKS[type] || {});
  };

  // Re-fetch template preview when customizers change
  useEffect(() => {
    let active = true;
    async function loadPreview() {
      setLoadingPreview(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set("type", selectedType);
        queryParams.set("email_color_primary", emailSettings.email_color_primary);
        queryParams.set("email_logo_url", emailSettings.email_logo_url);
        queryParams.set("email_signature", emailSettings.email_signature);
        
        Object.entries(mockData).forEach(([key, val]) => {
          queryParams.set(key, String(val));
        });

        const res = await fetch(`${API_URL}/store/email-templates?${queryParams.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok && active) {
          const data = await res.json();
          setRendered(data);
        }
      } catch (err) {
        console.error("Failed to fetch store template preview:", err);
      } finally {
        if (active) setLoadingPreview(false);
      }
    }

    if (token) {
      loadPreview();
    }
    return () => {
      active = false;
    };
  }, [selectedType, mockData, emailSettings, token, API_URL]);

  // Handle save email branding
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch(`${API_URL}/store/email-settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(emailSettings),
      });

      if (res.ok) {
        alert("Email branding saved successfully!");
      } else {
        alert("Failed to save email settings.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving email settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Handle send test email
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient) return;

    setSendingTest(true);
    try {
      const res = await fetch(`${API_URL}/store/email-templates/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: selectedType,
          to: testRecipient,
          mockData,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.error || "Failed to send test email"}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message || String(err)}`);
    } finally {
      setSendingTest(false);
    }
  };

  const formatLabel = (key: string) => {
    const spaced = key.replace(/([A-Z])/g, " $1");
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-2">Email Templates</h2>
        <p className="text-sm text-slate-500">
          Configure custom logos, colors, signatures and live preview transactional email templates sent to your customers.
        </p>
      </div>

      {/* Brand Customizer Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Settings className="w-4 h-4 text-indigo-500" />
          Email Template Branding
        </h3>

        {loadingSettings ? (
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" />
            Loading custom email settings...
          </div>
        ) : (
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wide block mb-1">
                    Custom Email Logo URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={emailSettings.email_logo_url}
                    onChange={(e) => setEmailSettings({ ...emailSettings, email_logo_url: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:border-indigo-500 focus:outline-none bg-slate-50/50"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    If not specified, falls back to your active storefront theme logo.
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wide block mb-1">
                    Primary Brand Color (Hex)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={emailSettings.email_color_primary || "#2563EB"}
                      onChange={(e) => setEmailSettings({ ...emailSettings, email_color_primary: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="#2563EB"
                      value={emailSettings.email_color_primary}
                      onChange={(e) => setEmailSettings({ ...emailSettings, email_color_primary: e.target.value })}
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:border-indigo-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wide block mb-1">
                  Custom Email Footer Signature
                </label>
                <textarea
                  rows={4}
                  placeholder={`Best regards,\nThe ${storeName} Team`}
                  value={emailSettings.email_signature}
                  onChange={(e) => setEmailSettings({ ...emailSettings, email_signature: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:border-indigo-500 focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                {savingSettings ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Branding Configurations
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Main visualizer workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Template list, mock editor, and test email sending */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Templates list */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider block mb-1">
              Select Customer Template
            </h3>
            <div className="grid grid-cols-1 gap-1.5">
              {Object.entries(TEMPLATE_NAMES).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between border ${
                    selectedType === type
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                      : "bg-white border-slate-200/60 text-slate-650 hover:bg-slate-50"
                  }`}
                >
                  <span>{label}</span>
                  <span className="text-[10px] font-mono opacity-60 uppercase">{type.split("-")[1] || type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Customizer parameters editor */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider block mb-1">
              Template Test Parameters (Mock Data)
            </h3>
            
            <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
              {Object.entries(mockData).map(([key, val]) => (
                <div key={key}>
                  <label className="text-[10px] font-bold text-slate-550 uppercase block mb-1">
                    {formatLabel(key)}
                  </label>
                  {typeof val === "number" ? (
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => setMockData({ ...mockData, [key]: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:border-indigo-500 focus:outline-none bg-slate-50/50"
                    />
                  ) : (
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => setMockData({ ...mockData, [key]: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:border-indigo-500 focus:outline-none bg-slate-50/50"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Send Test Email form */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-indigo-500" />
              Dispatch Test Email
            </h3>
            
            <form onSubmit={handleSendTest} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="owner@mybusiness.com"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:border-indigo-500 focus:outline-none bg-slate-50/50"
              />
              <button
                type="submit"
                disabled={sendingTest}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {sendingTest ? "Sending..." : "Send Test"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Visualizer View & Code Viewers */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-2 shadow-xs">
            <div className="flex gap-1.5">
              <button
                onClick={() => setActiveSubTab("preview")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeSubTab === "preview"
                    ? "bg-slate-100 text-slate-800"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Visual Preview
              </button>
              <button
                onClick={() => setActiveSubTab("html")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeSubTab === "html"
                    ? "bg-slate-100 text-slate-800"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                HTML Output
              </button>
              <button
                onClick={() => setActiveSubTab("text")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeSubTab === "text"
                    ? "bg-slate-100 text-slate-800"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Plain Text
              </button>
            </div>

            {rendered && (
              <span className="text-[10px] font-bold text-slate-500 px-3 bg-slate-50 border border-slate-100 py-1.5 rounded-md truncate max-w-xs">
                Subject: {rendered.subject}
              </span>
            )}
          </div>

          <div className="relative">
            {loadingPreview && (
              <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-xs flex items-center justify-center rounded-xl z-10">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            )}

            {rendered ? (
              <>
                {activeSubTab === "preview" && (
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <iframe
                      srcDoc={rendered.html}
                      title="Email Preview"
                      className="w-full h-[620px] border-none bg-white"
                    />
                  </div>
                )}

                {activeSubTab === "html" && (
                  <div className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden p-4 shadow-sm">
                    <textarea
                      readOnly
                      value={rendered.html}
                      className="w-full h-[588px] bg-transparent text-[11px] text-slate-300 font-mono resize-none focus:outline-none"
                      onClick={(e) => (e.target as any).select()}
                    />
                  </div>
                )}

                {activeSubTab === "text" && (
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm min-h-[620px] font-mono text-xs text-slate-650 whitespace-pre-wrap">
                    {rendered.text}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-[620px] bg-slate-50 border border-slate-200/60 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs">
                <RefreshCw className="w-8 h-8 text-slate-300 animate-spin mb-2" />
                Retrieving active template layout...
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
