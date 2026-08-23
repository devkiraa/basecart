"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Mail, Send, Eye, Code, FileText, Settings,
  RefreshCw, CheckCircle2, XCircle, Edit2, Save, X
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

const DEFAULT_MOCKS: Record<string, Record<string, any>> = {
  otp: { code: "887722", expiresMinutes: 15, storeName: "Basecart" },
  welcome: { userName: "Kiran G", verifyLink: "https://basecart.app/verify?token=example-token", storeName: "Basecart" },
  "password-reset": { userName: "Kiran G", resetLink: "https://basecart.app/reset-password?token=example-token", storeName: "Basecart" },
  "order-confirmation": { orderId: "ord_d8a29a", customerName: "Kiran G", total: 1299, invoiceNumber: "INV-2026-0001", storeName: "Fashion Hub" },
  "order-shipped": { orderId: "ord_d8a29a", customerName: "Kiran G", trackingNumber: "TRK-BLUEDART-88912", carrier: "BlueDart", trackingLink: "https://track.bluedart.com/TRK-BLUEDART-88912", storeName: "Fashion Hub" },
  invoice: { invoiceNumber: "INV-2026-0001", customerName: "Kiran G", total: 1299, dueDate: "2026-08-23", paymentLink: "https://basecart.app/pay/INV-2026-0001", storeName: "Fashion Hub" },
  "payment-failed": { orderId: "ord_d8a29a", customerName: "Kiran G", total: 1299, retryLink: "https://basecart.app/checkout/ord_d8a29a", storeName: "Fashion Hub" },
  subscription: { planName: "Growth Plan", customerName: "Kiran G", renewalDate: "2026-09-16", amount: 4999, storeName: "Basecart" },
  "team-invite": { inviteLink: "https://basecart.app/accept-invite?token=invite-token", inviterName: "Admin", role: "Manager", storeName: "Basecart" },
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

// ─── Toast ────────────────────────────────────────────────────────────────────
interface Toast { id: number; type: "success" | "error"; message: string }
let toastCounter = 0;

function ToastStack({ toasts, remove }: { toasts: Toast[]; remove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold min-w-[300px] max-w-md animate-fade-in transition-all ${
            t.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {t.type === "success"
            ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)} className="opacity-50 hover:opacity-100 transition-opacity">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Sender ID Editor ─────────────────────────────────────────────────────────
interface AliasEntry { address: string; name: string }
type AliasMap = Record<string, AliasEntry>;

function SenderIdEditor({ aliases }: { aliases: AliasMap }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<AliasEntry>({ address: "", name: "" });

  const startEdit = (key: string) => {
    setDraft({ ...aliases[key] });
    setEditing(key);
  };

  const cancelEdit = () => setEditing(null);

  const NOTE_KEYS = ["otp", "welcome", "password-reset", "order-confirmation", "order-shipped", "invoice", "payment-failed", "subscription", "team-invite", "default"];
  const rows = NOTE_KEYS.filter((k) => aliases[k]);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[120px_1fr_1fr_36px] text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pb-1 border-b border-slate-100">
        <span>Template</span>
        <span>From Address</span>
        <span>Sender Name</span>
        <span></span>
      </div>

      {rows.map((key) => {
        const alias = aliases[key];
        const isEditing = editing === key;

        return (
          <div
            key={key}
            className={`grid grid-cols-[120px_1fr_1fr_36px] items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
              isEditing ? "bg-indigo-50 border border-indigo-200" : "hover:bg-slate-50"
            }`}
          >
            <span className="text-[10px] font-bold text-slate-600 truncate capitalize">
              {key === "default" ? "Default" : TEMPLATE_NAMES[key] || key}
            </span>

            {isEditing ? (
              <>
                <input
                  type="email"
                  value={draft.address}
                  onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                  className="px-2 py-1.5 border border-indigo-300 rounded-md text-[11px] font-mono focus:outline-none focus:border-indigo-500 bg-white"
                  placeholder="email@basecart.app"
                />
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="px-2 py-1.5 border border-indigo-300 rounded-md text-[11px] font-semibold focus:outline-none focus:border-indigo-500 bg-white"
                  placeholder="Sender Name"
                />
                <div className="flex gap-1">
                  <button
                    onClick={cancelEdit}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="text-[11px] font-mono text-slate-700 truncate">{alias.address}</span>
                <span className="text-[11px] font-semibold text-slate-500 truncate">{alias.name}</span>
                <button
                  onClick={() => startEdit(key)}
                  className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="Edit sender"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        );
      })}

      {editing && (
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          <div className="flex-1 text-[10px] text-slate-400">
            ⚠️ To persist changes, update the <code className="font-bold bg-slate-100 px-1 rounded">EMAIL_ALIASES</code> variable in your Cloudflare Worker settings.
          </div>
          <button
            onClick={cancelEdit}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
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

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load backend variables
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(`${API_URL}/admin/emails/settings`, { credentials: "include" });
        if (res.ok) setSettings(await res.json());
      } catch (err) {
        console.error("Failed to load email configurations:", err);
      } finally {
        setLoadingSettings(false);
      }
    }
    loadSettings();
  }, []);

  // Re-fetch template preview when selected type or mock data changes
  useEffect(() => {
    let active = true;
    async function loadPreview() {
      setLoadingPreview(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set("type", selectedType);
        Object.entries(mockData).forEach(([k, v]) => queryParams.set(k, String(v)));

        const res = await fetch(`${API_URL}/admin/emails/templates?${queryParams}`, { credentials: "include" });
        if (res.ok && active) setRendered(await res.json());
      } catch (err) {
        console.error("Failed to fetch template preview:", err);
      } finally {
        if (active) setLoadingPreview(false);
      }
    }
    loadPreview();
    return () => { active = false; };
  }, [selectedType, mockData]);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setMockData(DEFAULT_MOCKS[type] || {});
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient) return;
    setSendingTest(true);
    try {
      const res = await fetch(`${API_URL}/admin/emails/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType, to: testRecipient, mockData }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        addToast("success", `✅ Test email dispatched to ${testRecipient}`);
      } else {
        addToast("error", `❌ ${data.error || "Failed to send test email"}`);
      }
    } catch (err: any) {
      addToast("error", `❌ ${err.message || String(err)}`);
    } finally {
      setSendingTest(false);
    }
  };

  const formatLabel = (key: string) => {
    const spaced = key.replace(/([A-Z])/g, " $1");
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };

  // Parse alias map for the editor
  const aliasMap: AliasMap = settings?.EMAIL_ALIASES
    ? (typeof settings.EMAIL_ALIASES === "string"
        ? JSON.parse(settings.EMAIL_ALIASES)
        : settings.EMAIL_ALIASES)
    : {};

  return (
    <>
      <ToastStack toasts={toasts} remove={removeToast} />

      <div className="space-y-8 animate-fade-in pb-12">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Mail className="w-6 h-6 text-indigo-600" />
            Mail Settings &amp; Templates
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure sender addresses, preview transactional templates, and dispatch test emails.
          </p>
        </div>

        {/* ── Sender ID Configuration ─────────────────────────────────────── */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-500" />
            Sender ID Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">
                Default From Address
              </label>
              <div className="text-xs font-mono text-slate-700 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                {settings?.MAIL_FROM_ADDRESS || "noreply@basecart.app"}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">
                Default Sender Name
              </label>
              <div className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                {settings?.MAIL_FROM_NAME || "Basecart"}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">
                Alias Config Source
              </label>
              <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Hardcoded platform defaults active
              </div>
            </div>
          </div>

          {loadingSettings ? (
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
              Loading sender configurations...
            </div>
          ) : Object.keys(aliasMap).length > 0 ? (
            <SenderIdEditor aliases={aliasMap} />
          ) : (
            <div className="text-xs text-slate-400">No aliases loaded.</div>
          )}
        </div>

        {/* ── Main Workspace ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left column */}
          <div className="lg:col-span-5 space-y-5">

            {/* Template list */}
            <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Select Email Template
              </h3>
              <div className="grid grid-cols-1 gap-1.5 max-h-64 overflow-y-auto pr-1">
                {Object.entries(TEMPLATE_NAMES).map(([type, label]) => (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between border ${
                      selectedType === type
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                        : "bg-white border-slate-200/60 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{label}</span>
                    <span className="text-[10px] font-mono opacity-50 uppercase">{type.replace("-", "·")}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mock data editor */}
            <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Customize Template Parameters
              </h3>
              <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                {Object.entries(mockData).map(([key, val]) => (
                  <div key={key}>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      {formatLabel(key)}
                    </label>
                    <input
                      type={typeof val === "number" ? "number" : "text"}
                      value={val}
                      onChange={(e) =>
                        setMockData({
                          ...mockData,
                          [key]: typeof val === "number" ? parseFloat(e.target.value) || 0 : e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:border-indigo-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Send Test Email */}
            <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-indigo-500" />
                Dispatch Test Email
              </h3>
              <form onSubmit={handleSendTest} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="recipient@example.com"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:border-indigo-500 focus:outline-none bg-slate-50/50"
                />
                <button
                  type="submit"
                  disabled={sendingTest}
                  className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {sendingTest
                    ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                    : <><Send className="w-3.5 h-3.5" /> Send Test to {testRecipient || "recipient"}</>}
                </button>
              </form>
            </div>
          </div>

          {/* Right column – preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-center bg-white border border-slate-200/80 rounded-xl p-2 shadow-xs">
              <div className="flex gap-1.5">
                {(["preview", "html", "text"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSubTab(tab)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeSubTab === tab ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab === "preview" && <Eye className="w-3.5 h-3.5" />}
                    {tab === "html" && <Code className="w-3.5 h-3.5" />}
                    {tab === "text" && <FileText className="w-3.5 h-3.5" />}
                    {tab === "preview" ? "Visual Preview" : tab === "html" ? "HTML Output" : "Plain Text"}
                  </button>
                ))}
              </div>
              {rendered && (
                <span className="text-[10px] font-bold text-slate-500 px-3 bg-slate-50 border border-slate-100 py-1.5 rounded-md truncate max-w-xs">
                  Subject: {rendered.subject}
                </span>
              )}
            </div>

            <div className="relative">
              {loadingPreview && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center rounded-xl z-10">
                  <RefreshCw className="w-7 h-7 text-indigo-500 animate-spin" />
                </div>
              )}

              {rendered ? (
                <>
                  {activeSubTab === "preview" && (
                    <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
                      <iframe srcDoc={rendered.html} title="Email Preview" className="w-full h-[620px] border-none bg-white" />
                    </div>
                  )}
                  {activeSubTab === "html" && (
                    <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 shadow-sm">
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
                <div className="w-full h-[620px] bg-slate-50 border border-slate-200/60 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                  <RefreshCw className="w-7 h-7 text-slate-300 animate-spin" />
                  Retrieving active template layout...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
