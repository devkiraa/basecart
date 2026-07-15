import React, { useState } from "react";
import { ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

interface StepVerificationProps {
  data: any;
  onChange: (fields: any) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading?: boolean;
  error?: string;
}

export default function StepVerification({ data, onChange, onSubmit, onBack, loading, error }: StepVerificationProps) {
  const [localError, setLocalError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    const code = data.otpCode || "";
    if (code.trim() !== "000000") {
      setLocalError("Invalid verification code. Please use 000000 for mock verification.");
      return;
    }

    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left font-sans animate-fade-in">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Verify email</h2>
        <p className="text-xs text-slate-500">We have sent a mock 6-digit verification code to <span className="font-semibold text-slate-800">{data.email}</span>.</p>
      </div>

      {(localError || error) && (
        <div className="bg-red-50 text-red-700 border border-red-100 p-3 rounded-button text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{localError || error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 text-center">
            Verification Code
          </label>
          <div className="flex justify-center">
            <input
              type="text"
              maxLength={6}
              required
              value={data.otpCode || ""}
              onChange={(e) => onChange({ otpCode: e.target.value.replace(/[^0-9]/g, "") })}
              className="w-48 text-center px-4 py-3 border border-slate-305 tracking-[0.75em] text-xl font-black rounded-button text-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
              placeholder="000000"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-2 block text-center leading-normal">
            Enter the default sandbox verification code: <strong className="text-indigo-650">000000</strong>
          </span>
        </div>

        <div className="text-center">
          <button
            type="button"
            disabled
            className="text-xs text-slate-400 font-bold bg-slate-50 border border-slate-200 px-3 py-1.5 rounded cursor-not-allowed uppercase tracking-wider"
          >
            Resend Code (Mock)
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          disabled={loading}
          onClick={onBack}
          className="w-1/3 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-button text-sm transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-2/3 py-2.5 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-button text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Verify & Launch
            </>
          )}
        </button>
      </div>
    </form>
  );
}
