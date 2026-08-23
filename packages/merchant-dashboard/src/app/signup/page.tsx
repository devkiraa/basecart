"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, ShoppingBag, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const PERKS = [
  { emoji: "🎁", text: "First 1,000 orders free" },
  { emoji: "💰", text: "₹25,000 GMV on us" },
  { emoji: "📅", text: "Full 3 months, no catch" },
  { emoji: "🚫", text: "No credit card ever" },
];

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/auth/merchant/me`, { credentials: "include" })
      .then((r) => { if (r.ok) window.location.href = "/dashboard"; })
      .catch(() => { });
    // Restore email from previous session
    try {
      const saved = localStorage.getItem("basecart_signup_email");
      if (saved) setEmail(saved);
    } catch (_) { }
  }, []);

  // Persist email as user types (never store password)
  useEffect(() => {
    try {
      if (email) localStorage.setItem("basecart_signup_email", email);
      else localStorage.removeItem("basecart_signup_email");
    } catch (_) { }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { setError("Please accept the terms to continue."); return; }
    setError("");
    setLoading(true);

    try {
      // Generate a temporary store name + subdomain from email prefix
      const emailPrefix = email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 20) || "mystore";
      const tempStoreName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) + " Store";
      const tempSubdomain = emailPrefix + Math.floor(Math.random() * 900 + 100);

      const res = await fetch(`${API_URL}/auth/merchant/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          storeName: tempStoreName,
          subdomain: tempSubdomain,
          selectedPlan: "free",
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      // Mark that we just signed up — tells /onboarding to trust the session
      try { localStorage.setItem("basecart_just_signed_up", "1"); } catch (_) { }
      // Clear saved email — account created
      try { localStorage.removeItem("basecart_signup_email"); } catch (_) { }
      // Account created — go to onboarding to personalise the store
      window.location.href = "/onboarding";
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pct = Math.min(100, (email.length > 3 ? 34 : 0) + (password.length >= 8 ? 33 : 0) + (agreed ? 33 : 0));

  return (
    <div className="min-h-screen bg-white font-sans flex items-stretch">

      {/* ── Left: Value Prop ── */}
      <div className="hidden lg:flex w-[44%] bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex-col justify-between p-12 relative overflow-hidden select-none">
        {/* ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer z-10" onClick={() => { window.location.href = "/"; }}>
          <div className="h-9 w-9 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">basecart</span>
        </div>

        {/* Hero Copy */}
        <div className="z-10 space-y-8 my-auto">
          {/* Offer pill */}
          <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/20 text-blue-300 text-xs font-bold px-4 py-1.5 rounded-full">
            🎉 Limited early-access offer — Kerala merchants only
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-black text-white leading-[1.1] tracking-tight">
              Your first<br />
              <span className="text-blue-400">3 months</span><br />
              are on us.
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed font-medium max-w-xs">
              Process up to <strong className="text-white">1,000 orders</strong> or reach{" "}
              <strong className="text-white">₹25,000 in order value</strong> — whichever comes first — completely free. No credit card. No strings.
            </p>
          </div>

          {/* Perks list */}
          <div className="space-y-3">
            {PERKS.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{p.emoji}</span>
                <span className="text-sm text-slate-300 font-semibold">{p.text}</span>
                <CheckCircle2 className="h-4 w-4 text-blue-400 ml-auto shrink-0" />
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-slate-500 font-medium">
              After your free period, continue with plans from{" "}
              <span className="text-white font-bold">₹99/month</span>. Cancel anytime.
            </p>
          </div>
        </div>

        {/* Bottom quote */}
        <div className="z-10 border-t border-white/10 pt-6">
          <p className="text-xs text-slate-500 italic leading-relaxed">
            "I had my store live in under 10 minutes. First order came the same day."
          </p>
          <p className="text-xs text-slate-400 font-bold mt-1">— Anjali T., Kochi</p>
        </div>
      </div>

      {/* ── Right: Signup Form ── */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 cursor-pointer" onClick={() => { window.location.href = "/"; }}>
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-black text-slate-900">basecart</span>
          </div>
          <div className="hidden lg:block" />
          <p className="text-xs text-slate-500 font-semibold">
            Already selling?{" "}
            <a href="/login" className="text-blue-600 font-bold hover:underline">Sign in</a>
          </p>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md space-y-8">

            {/* Heading */}
            <div className="space-y-2">
              {/* Mobile offer pill */}
              <div className="flex lg:hidden items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full w-fit mb-3">
                🎁 3 months free · 1,000 orders · ₹25,000 GMV
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Create your free store.
              </h2>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Takes 60 seconds. Your store is live instantly — no setup fees.
              </p>
            </div>

            {/* Progress strip */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Account setup</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-semibold p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="you@yourbrand.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password.length > 0 && password.length < 8 && (
                  <p className="text-[10px] text-amber-600 font-semibold">Need {8 - password.length} more characters</p>
                )}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <div
                  onClick={() => setAgreed((a) => !a)}
                  className={`mt-0.5 h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${agreed ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white hover:border-blue-400"
                    }`}
                >
                  {agreed && <CheckCircle2 className="h-3 w-3 text-white" />}
                </div>
                <span className="text-xs text-slate-500 font-medium leading-relaxed">
                  I agree to Basecart's{" "}
                  <a href="#" className="text-blue-600 underline font-semibold">Terms of Service</a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-600 underline font-semibold">Privacy Policy</a>.
                </span>
              </label>

              {/* CTA */}
              <button
                type="submit"
                disabled={loading || !email || password.length < 8 || !agreed}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-sm rounded-xl shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-[.99]"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Claim my 3-month free store
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 pt-1 text-[10px] text-slate-400 font-semibold">
                <span>🔒 Secure &amp; encrypted</span>
                <span>·</span>
                <span>📦 Live in 60 seconds</span>
                <span>·</span>
                <span>✅ No card needed</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
