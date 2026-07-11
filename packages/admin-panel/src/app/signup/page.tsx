"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, Loader2, CheckCircle2 } from "lucide-react";

const API_URL = "http://localhost:3001";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/admin/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to register super-admin account.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      console.error("Signup failed:", err);
      setError("Unable to connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
            <ShieldAlert className="w-7 h-7 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Bootstrap Admin Account</h1>
          <p className="text-sm text-slate-500 mt-1">Register the primary administrator account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center text-center p-6 bg-emerald-50 border border-emerald-100 rounded-xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-2 animate-bounce" />
            <h3 className="font-bold text-emerald-800">Super-Admin Provisioned!</h3>
            <p className="text-xs text-emerald-600 mt-1">Redirecting you to the dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="admin@basecart.io"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Super-Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="Minimum 8 characters"
                required
                disabled={loading}
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-lg text-xs text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-700">Security Warning:</span> Super-admin signup is open ONLY for bootstrap. Once the first administrator registers, this route will be permanently locked out.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Provisioning...
                </>
              ) : (
                "Bootstrap Administrator"
              )}
            </button>
          </form>
        )}

        {!success && (
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <Link href="/login" className="text-xs text-blue-600 hover:underline">
              Return to admin login page &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
