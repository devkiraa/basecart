"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Loader2, Zap } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const DEMO_EMAIL = "superadmin@basecart.io";
const DEMO_PASSWORD = "adminpassword";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    const res = await fetch(`${API_URL}/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 429) {
        throw new Error("Too many login attempts. Please wait 1 minute before retrying.");
      }
      throw new Error(data.error || "Invalid administrator credentials.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await performLogin(email, password);
      router.push("/");
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Unable to connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setError("");
    try {
      // 1. Try to register the demo admin (silently ignored if already exists)
      await fetch(`${API_URL}/admin/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
        credentials: "include",
      }).catch(() => {});

      // 2. Login with demo credentials
      await performLogin(DEMO_EMAIL, DEMO_PASSWORD);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Demo login failed. Please try the manual login.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
            <ShieldCheck className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Super-Admin Access</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to manage the Basecart platform</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Demo access button */}
        <button
          type="button"
          id="admin-demo-login-btn"
          onClick={handleDemoLogin}
          disabled={demoLoading || loading}
          className="w-full mb-6 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
        >
          {demoLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Entering demo console...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Access as Demo Admin
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 font-medium">Or sign in manually</span>
          </div>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Admin Email Address
            </label>
            <input
              type="email"
              id="admin-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="admin@basecart.io"
              required
              disabled={loading || demoLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Security Password
            </label>
            <input
              type="password"
              id="admin-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="••••••••••••"
              required
              disabled={loading || demoLoading}
            />
          </div>

          <button
            type="submit"
            id="admin-signin-btn"
            disabled={loading || demoLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              "Sign In to Console"
            )}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div className="mt-4 p-3 bg-violet-50 border border-violet-100 rounded-lg text-xs text-violet-700">
          <span className="font-semibold">Demo credentials:</span>{" "}
          <span className="font-mono">{DEMO_EMAIL}</span> / <span className="font-mono">{DEMO_PASSWORD}</span>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <Link href="/signup" className="text-xs text-blue-600 hover:underline">
            Bootstrap initial super-admin account &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
