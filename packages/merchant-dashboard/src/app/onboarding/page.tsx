"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  ShoppingBag,
  Sparkles,
  Store,
  MapPin,
  User,
  Phone,
  Package,
  BarChart2,
  CheckCircle2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/* ─────────────────────────────────────────────
   Question definitions
───────────────────────────────────────────── */
type QuestionType = "text" | "subdomain" | "choice" | "multi-choice" | "tel" | "done";

interface Question {
  id: string;
  type: QuestionType;
  icon: React.ReactNode;
  heading: string;
  subtext: string;
  placeholder?: string;
  choices?: { label: string; emoji?: string }[];
  stateKey?: string;
}

const QUESTIONS: Question[] = [
  {
    id: "storeName",
    type: "text",
    icon: <Store className="h-6 w-6 text-blue-600" />,
    heading: "What's your store called?",
    subtext: "Pick a name your customers will remember. You can always change it later.",
    placeholder: "e.g. Kochi Fresh Picks, Anjali Jewels…",
    stateKey: "storeName",
  },
  {
    id: "subdomain",
    type: "subdomain",
    icon: <ShoppingBag className="h-6 w-6 text-blue-600" />,
    heading: "Choose your store URL.",
    subtext: "This is your free storefront link on Basecart. Short and simple works best.",
    placeholder: "yourstore",
    stateKey: "subdomain",
  },
  {
    id: "businessCategory",
    type: "choice",
    icon: <Package className="h-6 w-6 text-blue-600" />,
    heading: "What do you sell?",
    subtext: "We'll personalise your dashboard based on your category.",
    stateKey: "businessCategory",
    choices: [
      { label: "Fashion & Clothing", emoji: "👗" },
      { label: "Food & Beverages", emoji: "🍱" },
      { label: "Electronics", emoji: "📱" },
      { label: "Beauty & Wellness", emoji: "💄" },
      { label: "Home & Decor", emoji: "🏡" },
      { label: "Jewellery & Accessories", emoji: "💍" },
      { label: "Groceries & Daily Essentials", emoji: "🛒" },
      { label: "Other", emoji: "📦" },
    ],
  },
  {
    id: "businessType",
    type: "choice",
    icon: <BarChart2 className="h-6 w-6 text-blue-600" />,
    heading: "How do you sell today?",
    subtext: "Pick the option that describes your current setup.",
    stateKey: "businessType",
    choices: [
      { label: "Instagram / WhatsApp only", emoji: "📲" },
      { label: "Physical shop / kiosk", emoji: "🏪" },
      { label: "Both online & offline", emoji: "🔄" },
      { label: "I'm just starting out", emoji: "🚀" },
    ],
  },
  {
    id: "state",
    type: "choice",
    icon: <MapPin className="h-6 w-6 text-blue-600" />,
    heading: "Which state are you in?",
    subtext: "We use this to tailor GST and shipping integrations for you.",
    stateKey: "state",
    choices: [
      { label: "Kerala", emoji: "🌴" },
      { label: "Tamil Nadu", emoji: "🏛️" },
      { label: "Karnataka", emoji: "🌆" },
      { label: "Maharashtra", emoji: "🌊" },
      { label: "Delhi / NCR", emoji: "🏙️" },
      { label: "Other", emoji: "📍" },
    ],
  },
  {
    id: "ownerName",
    type: "text",
    icon: <User className="h-6 w-6 text-blue-600" />,
    heading: "What's your name?",
    subtext: "We'll use this to personalise your dashboard and invoices.",
    placeholder: "Your full name",
    stateKey: "ownerName",
  },
  {
    id: "phone",
    type: "tel",
    icon: <Phone className="h-6 w-6 text-blue-600" />,
    heading: "Best phone number to reach you?",
    subtext: "For order alerts and support — we'll never spam you.",
    placeholder: "+91 98765 43210",
    stateKey: "phone",
  },
  {
    id: "done",
    type: "done",
    icon: <Sparkles className="h-6 w-6 text-amber-500" />,
    heading: "You're all set! 🎉",
    subtext: "Your store is live. Let's take you to your dashboard.",
  },
];

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function toSubdomain(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 30);
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const STORAGE_KEY = "basecart_onboarding_progress";

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [visible, setVisible] = useState(true);
  const [resumed, setResumed] = useState(false);
  const [resumeBannerVisible, setResumeBannerVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState({
    storeName: "",
    subdomain: "",
    businessCategory: "",
    businessType: "",
    state: "",
    ownerName: "",
    phone: "",
  });

  // Auth guard — bounce if not logged in
  useEffect(() => {
    fetch(`${API_URL}/auth/merchant/me`, { credentials: "include" })
      .then((r) => { if (!r.ok) window.location.href = "/signup"; })
      .catch(() => { window.location.href = "/signup"; });
  }, []);

  // Restore progress from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { step: savedStep, data: savedData } = JSON.parse(saved);
        if (typeof savedStep === "number" && savedStep > 0 && savedData) {
          setData((d) => ({ ...d, ...savedData }));
          setStep(savedStep);
          setResumed(true);
          setResumeBannerVisible(true);
          // Auto-hide banner after 4s
          setTimeout(() => setResumeBannerVisible(false), 4000);
        }
      }
    } catch (_) {}
  }, []);

  // Persist progress to localStorage whenever step or data changes
  useEffect(() => {
    if (step === 0 && !data.storeName) return; // don't persist blank initial state
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, data }));
    } catch (_) {}
  }, [step, data]);

  // Auto-focus input on step change
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, [step]);

  // Auto-fill subdomain from storeName (only if subdomain is still empty)
  useEffect(() => {
    if (data.storeName && step === 0 && !data.subdomain) {
      setData((d) => ({ ...d, subdomain: toSubdomain(data.storeName) }));
    }
  }, [data.storeName]);

  const q = QUESTIONS[step];
  const progress = Math.round((step / (QUESTIONS.length - 1)) * 100);

  const transition = (toStep: number, dir: "forward" | "back") => {
    setDirection(dir);
    setVisible(false);
    setTimeout(() => {
      setStep(toStep);
      setVisible(true);
    }, 220);
  };

  const currentValue = q.stateKey ? (data as any)[q.stateKey] ?? "" : "";

  const canAdvance = () => {
    if (q.type === "done") return true;
    const v = currentValue;
    if (q.id === "subdomain") return v && v.length >= 2;
    if (q.type === "choice") return !!v;
    if (q.type === "tel") return v.replace(/\D/g, "").length >= 10;
    return v && v.trim().length >= 2;
  };

  const handleNext = useCallback(async () => {
    if (!canAdvance()) return;

    if (q.type === "done") {
      setFinishing(true);
      try {
        await fetch(`${API_URL}/store/settings`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            storeName: data.storeName || undefined,
            ownerName: data.ownerName || undefined,
            phone: data.phone || undefined,
            state: data.state || undefined,
            businessCategory: data.businessCategory || undefined,
            businessType: data.businessType || undefined,
          }),
        });
      } catch (_) {}
      // Clear saved progress — onboarding complete
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      window.location.href = "/dashboard";
      return;
    }

    // Persist subdomain change if on that step
    if (q.id === "subdomain" || q.id === "storeName") {
      setSaving(true);
      try {
        await fetch(`${API_URL}/store/settings`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ storeName: data.storeName }),
        });
      } catch (_) {}
      setSaving(false);
    }

    transition(step + 1, "forward");
  }, [step, data, q]);

  const handleBack = () => {
    if (step === 0) return;
    transition(step - 1, "back");
  };

  const handleChoiceSelect = (val: string) => {
    if (!q.stateKey) return;
    setData((d) => ({ ...d, [q.stateKey!]: val }));
    // Auto-advance after choice
    setTimeout(() => transition(step + 1, "forward"), 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); handleNext(); }
  };

  const slideClass = visible
    ? "opacity-100 translate-y-0"
    : direction === "forward"
      ? "opacity-0 -translate-y-4"
      : "opacity-0 translate-y-4";

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Progress bar */}
      <div className="h-1 w-full bg-slate-100">
        <div
          className="h-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Resume banner */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          resumeBannerVisible ? "max-h-12 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-blue-600 text-white text-xs font-semibold text-center py-2.5 px-4 flex items-center justify-center gap-2">
          <span>👋</span>
          <span>Welcome back! Picked up right where you left off.</span>
          <button
            onClick={() => setResumeBannerVisible(false)}
            className="ml-2 text-blue-200 hover:text-white font-bold text-sm leading-none"
          >
            ×
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ShoppingBag className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-black text-slate-900">basecart</span>
        </div>
        <div className="text-xs text-slate-400 font-semibold">
          Step {Math.min(step + 1, QUESTIONS.length - 1)} of {QUESTIONS.length - 1}
        </div>
      </header>

      {/* Main question area — centered */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div
          className={`w-full max-w-lg space-y-8 transition-all duration-220 ease-out ${slideClass}`}
        >
          {/* Icon + Question */}
          <div className="space-y-4">
            <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center">
              {q.icon}
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                {q.heading}
              </h1>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{q.subtext}</p>
            </div>
          </div>

          {/* Input area */}
          {(q.type === "text" || q.type === "tel") && (
            <div className="space-y-3">
              <input
                ref={inputRef}
                type={q.type === "tel" ? "tel" : "text"}
                value={currentValue}
                placeholder={q.placeholder}
                onChange={(e) => q.stateKey && setData((d) => ({ ...d, [q.stateKey!]: e.target.value }))}
                onKeyDown={handleKeyDown}
                className="w-full px-5 py-4 text-lg font-semibold text-slate-900 border-2 border-slate-200 rounded-2xl placeholder:text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
              />
              <p className="text-xs text-slate-400 font-medium">Press Enter ↵ to continue</p>
            </div>
          )}

          {q.type === "subdomain" && (
            <div className="space-y-3">
              <div className="flex items-center border-2 border-slate-200 rounded-2xl overflow-hidden focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all bg-white">
                <span className="pl-5 text-slate-400 text-sm font-semibold whitespace-nowrap select-none">
                  basecart.app/
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentValue}
                  placeholder="yourstore"
                  onChange={(e) =>
                    setData((d) => ({ ...d, subdomain: toSubdomain(e.target.value) }))
                  }
                  onKeyDown={handleKeyDown}
                  className="flex-1 pr-5 py-4 text-lg font-semibold text-slate-900 focus:outline-none bg-transparent placeholder:text-slate-300"
                />
              </div>
              {currentValue && (
                <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                  <Check className="h-3 w-3" /> Your store will be live at{" "}
                  <strong>basecart.app/{currentValue}</strong>
                </p>
              )}
              <p className="text-xs text-slate-400 font-medium">Press Enter ↵ to continue</p>
            </div>
          )}

          {q.type === "choice" && (
            <div className="grid grid-cols-2 gap-3">
              {q.choices!.map((c) => {
                const selected = currentValue === c.label;
                return (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => handleChoiceSelect(c.label)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3 font-semibold text-sm active:scale-[.98] ${
                      selected
                        ? "border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/10"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {c.emoji && <span className="text-xl">{c.emoji}</span>}
                    <span className="leading-snug">{c.label}</span>
                    {selected && <Check className="h-4 w-4 text-blue-600 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {q.type === "done" && (
            <div className="space-y-6">
              {/* Offer recap */}
              <div className="bg-gradient-to-br from-blue-950 to-indigo-950 text-white rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-5 w-5 text-amber-400 fill-amber-400" />
                  <span className="font-black text-base">Your 3-month free trial is active.</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Process your first <strong className="text-white">1,000 orders</strong> or reach{" "}
                  <strong className="text-white">₹25,000 in order value</strong> on us — no card required.
                  After that, choose a plan starting at{" "}
                  <strong className="text-white">₹99/month</strong>.
                </p>
                <div className="grid grid-cols-3 gap-3 pt-1">
                  {[
                    { label: "1,000", sub: "Orders free" },
                    { label: "₹25K", sub: "GMV on us" },
                    { label: "3 mo", sub: "No limits" },
                  ].map((s) => (
                    <div key={s.label} className="text-center bg-white/10 rounded-xl py-3">
                      <div className="text-lg font-black text-white">{s.label}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{s.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2.5">
                {[
                  "Store URL configured",
                  "Product catalog ready",
                  "Razorpay payments supported",
                  "WhatsApp order alerts",
                  "Free SSL + CDN included",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-slate-700 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation buttons (non-choice steps) */}
          {q.type !== "choice" && (
            <div className="flex items-center justify-between pt-2">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-sm text-slate-500 font-bold hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={!canAdvance() || saving || finishing}
                className={`flex items-center gap-2 px-7 py-3 rounded-2xl font-extrabold text-sm transition-all active:scale-[.98] shadow-sm ${
                  canAdvance() && !saving && !finishing
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                {saving || finishing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : q.type === "done" ? (
                  <>Go to my dashboard <ArrowRight className="h-4 w-4" /></>
                ) : (
                  <>Continue <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </div>
          )}

          {/* Skip link for optional steps */}
          {q.type !== "done" && q.type !== "subdomain" && q.id !== "storeName" && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => transition(step + 1, "forward")}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold underline-offset-2 hover:underline transition-colors"
              >
                Skip for now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
