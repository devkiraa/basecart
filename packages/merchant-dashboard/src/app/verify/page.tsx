"use client";

import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";
const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL || "http://localhost:3000";

export default function VerifyPage() {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const verified = params.get("verified");

    if (verified === "true") {
      setSuccess(true);
      setLoading(false);
      return;
    }

    if (!token) {
      setErrorMsg("Verification token is missing. Please check your verification email link.");
      setLoading(false);
      return;
    }

    const performVerification = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/merchant/verify-email?token=${token}`, {
          headers: {
            "Accept": "application/json"
          }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Email verification failed");
        setSuccess(true);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to verify email address.");
      } finally {
        setLoading(false);
      }
    };

    performVerification();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-card border border-slate-200 shadow-card text-center select-none">

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

        {loading ? (
          <div className="space-y-4 py-8">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">Verifying your email...</h2>
            <p className="text-xs text-slate-500 font-semibold">Please wait while we confirm your account registry.</p>
          </div>
        ) : success ? (
          <div className="space-y-5 py-6">
            <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">Email Verified Successfully!</h2>
              <p className="text-xs text-slate-500 font-semibold">Your merchant account is now active and fully verified.</p>
            </div>
            <button
              onClick={() => { window.location.href = "/login?verified=true"; }}
              className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-sm shadow shadow-blue-500/10"
            >
              Go to Workspace Log In
            </button>
          </div>
        ) : (
          <div className="space-y-5 py-6">
            <XCircle className="h-14 w-14 text-red-500 mx-auto" />
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">Verification Failed</h2>
              <p className="text-xs text-red-650 text-red-600 font-bold">{errorMsg}</p>
            </div>
            <button
              onClick={() => { window.location.href = "/login"; }}
              className="w-full mt-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold rounded-lg transition-colors text-sm"
            >
              Back to Sign In
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
