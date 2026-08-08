"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  Lock as LockIcon,
  Server,
  Shield,
  ShoppingBag,
  Grid,
  Info
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    // Check existing admin session
    let cancelled = false;
    const checkAdminSession = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/me`, { credentials: "include" });
        if (res.ok && !cancelled) {
          window.location.href = "/";
          return;
        }
        // Fallback check localStorage token for dev
        const storedToken = localStorage.getItem("basecart_admin_token");
        if (storedToken && !cancelled) {
          const meRes = await fetch(`${API_URL}/admin/me`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          if (meRes.ok) {
            window.location.href = "/";
          } else {
            localStorage.removeItem("basecart_admin_token");
          }
        }
      } catch {}
    };
    checkAdminSession();
    return () => { cancelled = true; };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    // Input sanitization & client validation
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setAuthError("Email address and password are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error(data.error || "Too many failed attempts. Account temporarily locked for security.");
        }
        throw new Error(data.error || "Invalid administrator credentials.");
      }

      // Store token as fallback for dev environments
      if (data.accessToken) {
        localStorage.setItem("basecart_admin_token", data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem("basecart_admin_refresh_token", data.refreshToken);
      }

      // Redirect to Admin Panel Dashboard
      window.location.href = "/";
    } catch (err: any) {
      if (err.message === "Failed to fetch") {
        setAuthError("Unable to connect to the central authentication service. Please check your network connection.");
      } else {
        setAuthError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row bg-white font-sans lg:overflow-hidden select-none">
      {/* Left Column - Hero Marketing Block (Identical to Merchant Dashboard UI & Colors) */}
      <div className="hidden lg:flex w-[45%] bg-[#F8FAFC] p-12 flex-col justify-between border-r border-slate-100 relative overflow-hidden h-full">
        {/* Soft Ambient Light Glows */}
        <div className="absolute top-[-10%] right-[-20%] w-[500px] h-[500px] rounded-full bg-blue-50/60 filter blur-3xl opacity-80 -z-10"></div>
        <div className="absolute bottom-[-10%] left-[-20%] w-[400px] h-[400px] rounded-full bg-indigo-50/50 filter blur-3xl opacity-70 -z-10"></div>

        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { window.location.href = "/"; }}>
          <img src="/logo.svg" alt="Basecart Logo" className="h-[48px] w-auto object-contain shrink-0" />
        </div>

        {/* Content Block */}
        <div className="my-auto space-y-6 max-w-md pt-2">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
              Central <span className="text-blue-600 font-black">Super-Admin</span> Console
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed font-semibold">
              Manage platform tenants, plan tier matrices, dynamic pricing, and system configurations.
            </p>
          </div>

          {/* Bullet Points */}
          <div className="space-y-5">
            {[
              {
                title: "Complete Tenant Management",
                desc: "Monitor merchant stores, active subdomains, and custom domain routing.",
                icon: <ShoppingBag className="h-4.5 w-4.5 text-blue-600" />
              },
              {
                title: "Dynamic Plan Customization",
                desc: "Configure pricing tiers, resource quotas, and feature availability matrix.",
                icon: <Grid className="h-4.5 w-4.5 text-blue-600" />
              },
              {
                title: "Fast, Reliable Infrastructure",
                desc: "Real-time data synchronization and instant platform management capabilities.",
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

      {/* Right Column - Authentication Form (Identical to Merchant Dashboard UI & Colors) */}
      <div className="flex-1 flex flex-col justify-center py-6 px-6 sm:px-16 lg:px-24 bg-white relative min-h-screen lg:h-full overflow-y-auto">
        <div className="max-w-[440px] w-full mx-auto space-y-6">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2 mb-4 select-none cursor-pointer" onClick={() => { window.location.href = "/"; }}>
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <span className="text-lg font-black text-slate-900">basecart admin</span>
          </div>

          {authError && (
            <div className="bg-red-50 text-red-700 p-3.5 rounded-button text-xs border border-red-100 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Super-Admin Console</h2>
              <p className="text-xs text-slate-500 font-semibold font-sans">Authenticate to access the Basecart administration platform</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Admin Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    id="admin-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
                    placeholder="admin@basecart.app"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Security Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    required
                    id="admin-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
                    placeholder="••••••••••••"
                    autoComplete="current-password"
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
                id="admin-signin-btn"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-sm shadow-sm flex justify-center items-center gap-2 active:scale-[0.99]"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In to Console"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
