"use client";

import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Lock, AlertCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";
const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL || "http://localhost:3000";

export default function ResetPasswordPage() {
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (!tokenParam) {
      setErrorMsg("Password reset token is missing. Please request a new password reset link.");
    } else {
      setToken(tokenParam);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!token) return;
    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/merchant/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password reset failed");
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-card border border-slate-200 shadow-card select-none">
        
        {/* Logo */}
        <div 
          onClick={() => { window.location.href = MARKETING_URL; }}
          className="flex items-center justify-center gap-2.5 cursor-pointer mb-6"
        >
          <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            <span className="text-sm">B</span>
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">basecart</span>
        </div>

        {errorMsg && !token ? (
          <div className="text-center space-y-5 py-6">
            <div className="bg-red-50 text-red-700 p-3.5 rounded-button text-xs border border-red-100 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => { window.location.href = "/login"; }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-sm"
            >
              Back to Sign In
            </button>
          </div>
        ) : success ? (
          <div className="text-center space-y-5 py-6">
            <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">Password Reset Complete</h2>
              <p className="text-xs text-slate-500 font-semibold font-sans">Your password has been successfully updated.</p>
            </div>
            <button
              onClick={() => { window.location.href = "/login"; }}
              className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-sm shadow"
            >
              Sign In with New Password
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-1 text-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Reset Password</h2>
              <p className="text-xs text-slate-500 font-semibold font-sans">Choose a new secure password for your account</p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-700 p-3.5 rounded-button text-xs border border-red-100 flex items-center gap-2 animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm"
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm"
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-sm shadow flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
