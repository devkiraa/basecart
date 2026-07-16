"use client";

import React, { useState, useEffect } from "react";
import { Mail, Send, Eye, Code, FileText, CheckCircle2, AlertTriangle, Settings, RefreshCw } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const DEFAULT_MOCKS: Record<string, Record<string, any>> = {
  otp: {
    code: "887722",
    expiresMinutes: 15,
    storeName: "Basecart",
  },
  welcome: {
    userName: "Kiran G",
    verifyLink: "https://basecart.app/verify?token=example-token",
    storeName: "Basecart",
  },
  "password-reset": {
    userName: "Kiran G",
    resetLink: "https://basecart.app/reset-password?token=example-token",
    storeName: "Basecart",
  },
  "order-confirmation": {
    orderId: "ord_d8a29a",
    customerName: "Kiran G",
    total: 1299,
    invoiceNumber: "INV-2026-0001",
    storeName: "Fashion Hub",
  },
  "order-shipped": {
    orderId: "ord_d8a29a",
    customerName: "Kiran G",
    trackingNumber: "TRK-BLUEDART-88912",
    carrier: "BlueDart",
    trackingLink: "https://track.bluedart.com/TRK-BLUEDART-88912",
    storeName: "Fashion Hub",
  },
  invoice: {
    invoiceNumber: "INV-2026-0001",
    customerName: "Kiran G",
    total: 1299,
    dueDate: "2026-08-23",
    paymentLink: "https://basecart.app/pay/INV-2026-0001",
    storeName: "Fashion Hub",
  },
  "payment-failed": {
    orderId: "ord_d8a29a",
    customerName: "Kiran G",
    total: 1299,
    retryLink: "https://basecart.app/checkout/ord_d8a29a",
    storeName: "Fashion Hub",
  },
  subscription: {
    planName: "Growth Plan",
    customerName: "Kiran G",
    renewalDate: "2026-09-16",
    amount: 4999,
    storeName: "Basecart",
  },
  "team-invite": {
    inviteLink: "https://basecart.app/accept-invite?token=invite-token",
    inviterName: "Admin",
    role: "Manager",
    storeName: "Basecart",
  },
};

const TEMPLATE_NAMES: Record<string, string> = {
  otp: "OTP / Verification",
  welcome: "Welcome Email",
  "password-reset": "Password Reset",
  "order-confirmation": "Order Confirmation",
  "order-shipped": "Order Shipped",
  invoice: "Customer Invoice",
  "payment-failed": "Payment Failed",
  subscription: "Subscription Billing",
  "team-invite": "Team Invitation",
};

export default function EmailsSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string>("otp");
  const [mockData, setMockData] = useState<Record<string, any>>(DEFAULT_MOCKS.otp);
  const [rendered, setRendered] = useState<any>(null);
  
  const [activeSubTab, setActiveSubTab] = useState<"preview" | "html" | "text">("preview");
  const [testRecipient, setTestRecipient] = useState("");
  
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  // Load backend variables
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(`${API_URL}/admin/emails/settings`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error("Failed to load email configurations:", err);
      } finally {
        setLoadingSettings(false);
      }
    }
    loadSettings();
  }, []);

  // Update mock data when template type changes
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setMockData(DEFAULT_MOCKS[type] || {});
  };

  // Re-fetch template preview when selected type or mock parameters change
  useEffect(() => {
    let active = true;
    async function loadPreview() {
      setLoadingPreview(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set("type", selectedType);
        Object.entries(mockData).forEach(([key, val]) => {
          queryParams.set(key, String(val));
        });

        const res = await fetch(`${API_URL}/admin/emails/templates?${queryParams.toString()}`, {
          credentials: "include",
        });
        if (res.ok && active) {
          const data = await res.json();
          setRendered(data);
        }
      } catch (err) {
        console.error("Failed to fetch template preview:", err);
      } finally {
        if (active) setLoadingPreview(false);
      }
    }

    loadPreview();
    return () => {
      active = false;
    };
  }, [selectedType, mockData]);

  // Handle send test email
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient) return;

    setSendingTest(true);
    try {
      const res = await fetch(`${API_URL}/admin/emails/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          to: testRecipient,
          mockData,
        }),
        credentials: "include",
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

  // Helper to format camelCase keys to nice labels
  const formatLabel = (key: string) => {
    const spaced = key.replace(/([A-Z])/g, " $1");
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Mail className="w-6 h-6 text-indigo-600" />
          Mail Settings & Templates
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor environment variables and live preview or test transactional email layouts.
        </p>
      </div>

      {/* Configurations Overview */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-indigo-500" />
          Mail Configurations (Variables)
        </h2>

        {loadingSettings ? (
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" />
            Loading active configuration variables...
          </div>
        ) : settings ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">
                  Fallback From Address
                </label>
                <div className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                  {settings.MAIL_FROM_ADDRESS || "noreply@basecart.app (Default)"}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">
                  Fallback Sender Name
                </label>
                <div className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                  {settings.MAIL_FROM_NAME || "Basecart (Default)"}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                EMAIL_ALIASES JSON Bindings
              </label>
              {settings.EMAIL_ALIASES ? (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 overflow-x-auto text-[10px] text-emerald-400 font-mono max-h-36 overflow-y-auto">
                  <pre>{JSON.stringify(typeof settings.EMAIL_ALIASES === "string" ? JSON.parse(settings.EMAIL_ALIASES) : settings.EMAIL_ALIASES, null, 2)}</pre>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-250 p-4 rounded-xl text-amber-800 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">No EMAIL_ALIASES configured.</span>
                    <p className="mt-0.5 text-amber-700/90 leading-normal">
                      The mail service is utilizing the single fallback address. You can define a JSON variable named <code className="font-bold bg-amber-100 px-1 rounded">EMAIL_ALIASES</code> in Cloudflare settings to configure custom senders per template.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-xs text-red-500">Failed to load active variables from the backend server.</div>
        )}
      </div>

      {/* Main visualizer workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Template list, mock editor, and test email sending */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Templates list */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Select Email Template
            </h3>
            <div className="grid grid-cols-1 gap-1.5 max-h-60 overflow-y-auto pr-1">
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
                  <span className="text-[10px] font-mono opacity-60 uppercase">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Customizer parameters editor */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Customize Template Parameters (Mock Data)
            </h3>
            
            <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
              {Object.entries(mockData).map(([key, val]) => (
                <div key={key}>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
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
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-indigo-500" />
              Dispatch Test Email
            </h3>
            
            <form onSubmit={handleSendTest} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="recipient@example.com"
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
          
          <div className="flex justify-between items-center bg-white border border-slate-200/80 rounded-xl p-2 shadow-xs">
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
                  <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
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
                  <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm min-h-[620px] font-mono text-xs text-slate-600 whitespace-pre-wrap">
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
