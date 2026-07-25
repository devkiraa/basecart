"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  Package,
  CreditCard,
  Grid,
  Info
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [backendReady, setBackendReady] = useState(true);
  
  // Forgot password flow
  const [showForgotView, setShowForgotView] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  useEffect(() => {
    // Wait for backend to be reachable, then check existing session
    let cancelled = false;
    const waitForBackend = async () => {
      const maxRetries = 15;
      for (let i = 0; i < maxRetries; i++) {
        if (cancelled) return;
        try {
          const res = await fetch(`${API_URL}/auth/merchant/me`, { credentials: "include" });
          if (res.ok) { window.location.href = "/dashboard"; return; }
          // Got a response (401 etc.) — backend is up
          setBackendReady(true);

          // Fallback: check localStorage token (local dev)
          const storedToken = localStorage.getItem("basecart_token");
          if (storedToken) {
            try {
              const meRes = await fetch(`${API_URL}/auth/merchant/me`, {
                headers: { Authorization: `Bearer ${storedToken}` },
              });
              if (meRes.ok) { window.location.href = "/dashboard"; return; }
              else { localStorage.removeItem("basecart_token"); }
            } catch {}
          }
          return;
        } catch {
          // Connection refused — backend not ready yet, retry
          await new Promise(r => setTimeout(r, 1500));
        }
      }
      // After all retries, show the form anyway
      setBackendReady(true);
    };
    waitForBackend();
    return () => { cancelled = true; };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/merchant/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      // Store tokens in localStorage as fallback for local dev (cross-origin cookies)
      if (data.accessToken) {
        localStorage.setItem("basecart_token", data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem("basecart_refresh_token", data.refreshToken);
      }
      if (data.tenantId) {
        localStorage.setItem("basecart_tenant_id", data.tenantId);
      }

      // Redirect to dashboard on success
      window.location.href = "/dashboard";
    } catch (err: any) {
      if (err.message === "Failed to fetch") {
        setAuthError("Server is starting up, please try again in a few seconds...");
      } else {
        setAuthError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };


  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/merchant/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setForgotPasswordSent(true);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };



  if (showForgotView) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-card border border-slate-200 shadow-card">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Basecart</h1>
            <p className="mt-2 text-sm text-slate-500">Recover Account Access</p>
          </div>

          {authError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-card text-sm border border-red-100">
              {authError}
            </div>
          )}

          {forgotPasswordSent ? (
            <div className="space-y-4 text-center">
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-card border border-emerald-100 text-sm">
                ✓ If the email is registered, we have sent a password reset link. Please check your inbox.
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotView(false);
                  setForgotPasswordSent(false);
                  setAuthError("");
                  setForgotPasswordEmail("");
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-button transition-colors text-sm shadow-sm"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm"
                  placeholder="name@store.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-button transition-colors text-sm shadow-sm flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForgotView(false);
                  setAuthError("");
                }}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-700 font-semibold"
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row bg-white font-sans lg:overflow-hidden">
      {/* Left Column - Hero Marketing Block */}
      <div className="hidden lg:flex w-[45%] bg-[#F8FAFC] p-12 flex-col justify-between border-r border-slate-100 select-none relative overflow-hidden h-full">
        <div className="absolute top-[-10%] right-[-20%] w-[500px] h-[500px] rounded-full bg-blue-50/60 filter blur-3xl opacity-80 -z-10"></div>
        <div className="absolute bottom-[-10%] left-[-20%] w-[400px] h-[400px] rounded-full bg-indigo-50/50 filter blur-3xl opacity-70 -z-10"></div>

        {/* Logo */}
        <div 
          onClick={() => { window.location.href = process.env.NEXT_PUBLIC_MARKETING_URL || "http://localhost:3000"; }}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">basecart</span>
        </div>

        {/* Content Block */}
        <div className="my-auto space-y-6 max-w-md pt-2">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
              The <span className="text-blue-600 font-black">all-in-one</span> commerce platform
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed font-semibold">
              Build, manage, and grow your online business with ease.
            </p>
          </div>

          {/* Bullet Points */}
          <div className="space-y-5">
            {[
              {
                title: "Launch your store in minutes",
                desc: "Get fully provisioned isolated database setups and premium Watchroom templates.",
                icon: <ShoppingBag className="h-4.5 w-4.5 text-blue-600" />
              },
              {
                title: "Powerful tools to scale",
                desc: "Integrated invoice engines, advanced discounts, and standard payment processors.",
                icon: <Grid className="h-4.5 w-4.5 text-blue-600" />
              },
              {
                title: "Secure, reliable, and fast",
                desc: "Powered by Cloudflare Durable Objects and SQLite D1 high-performance architecture.",
                icon: <Info className="h-4.5 w-4.5 text-blue-600" />
              }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-normal font-semibold">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-semibold">
          © {new Date().getFullYear()} Basecart Inc. All rights reserved.
        </div>
      </div>

      {/* Right Column - Authentication forms */}
      <div className="flex-1 flex flex-col justify-center py-6 px-6 sm:px-16 lg:px-24 bg-white relative min-h-screen lg:h-full overflow-y-auto">
        <div className="absolute top-8 right-8 sm:right-16 text-xs text-slate-500 font-semibold flex items-center gap-1.5 select-none">
          Don't have an account?{" "}
          <button 
            onClick={() => { window.location.href = "/signup"; }}
            className="text-blue-600 font-bold hover:underline"
          >
            Sign up
          </button>
        </div>

        <div className="max-w-[440px] w-full mx-auto space-y-6">
          <div className="flex lg:hidden items-center gap-2 mb-4 select-none cursor-pointer" onClick={() => { window.location.href = process.env.NEXT_PUBLIC_MARKETING_URL || "http://localhost:3000"; }}>
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
            <span className="text-lg font-black text-slate-900">basecart</span>
          </div>

          {authError && (
            <div className="bg-red-50 text-red-700 p-3.5 rounded-button text-xs border border-red-100 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome back</h2>
              <p className="text-xs text-slate-500 font-semibold font-sans">Login to your Basecart account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotView(true);
                      setAuthError("");
                    }}
                    className="text-xs text-blue-600 hover:underline font-bold"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 select-none pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-500 font-semibold cursor-pointer">
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-sm shadow-sm flex justify-center items-center gap-2 active:scale-[0.99]"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
