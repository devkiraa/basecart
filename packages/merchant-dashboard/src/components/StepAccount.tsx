import React, { useState } from "react";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";

const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL || "https://basecart.app";

interface StepAccountProps {
  data: any;
  onChange: (fields: any) => void;
  onNext: () => void;
  loading?: boolean;
}

export default function StepAccount({ data, onChange, onNext, loading }: StepAccountProps) {
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const password = data.password || "";
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const isSatisfied = hasMinLength && hasNumber && hasUppercase;
  const showRequirements = password.length > 0 && !isSatisfied;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!data.email || !data.password) {
      setLocalError("Please fill in all required fields.");
      return;
    }

    if (!hasMinLength || !hasNumber || !hasUppercase) {
      setLocalError("Password must be at least 8 characters and include a number and an uppercase letter.");
      return;
    }

    if (!data.acceptTerms) {
      setLocalError("You must agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left font-sans animate-fade-in">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create your account</h2>
        <p className="text-xs text-slate-500">Start your 14-day free trial. No credit card required.</p>
      </div>

      {localError && (
        <div className="bg-red-50 text-red-700 border border-red-100 p-3.5 rounded-button text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{localError}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Mail className="h-4 w-4" />
            </span>
            <input
              type="email"
              required
              value={data.email || ""}
              onChange={(e) => onChange({ email: e.target.value })}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Lock className="h-4 w-4" />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={data.password || ""}
              onChange={(e) => onChange({ password: e.target.value })}
              className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm"
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-700"
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>

          {/* Animated Checklist Indicator */}
          <div 
            className={`transition-all duration-300 ease-out overflow-hidden ${
              showRequirements 
                ? "max-h-[140px] opacity-100 mt-2.5 transform translate-y-0" 
                : "max-h-0 opacity-0 mt-0 transform -translate-y-1.5 pointer-events-none"
            }`}
          >
            <div className="bg-slate-50 border border-slate-200/60 p-2.5 rounded-lg space-y-1.5 select-none text-[10px] font-bold text-slate-500">
              <p className="text-[9px] uppercase tracking-wider text-slate-400 mb-1 font-extrabold">Password Requirements</p>
              <div className="flex flex-col gap-1">
                <div className={`flex items-center gap-1.5 transition-colors ${hasMinLength ? "text-emerald-600" : "text-slate-400"}`}>
                  <span className={`inline-flex items-center justify-center h-3.5 w-3.5 rounded-full text-[8px] border transition-all ${
                    hasMinLength ? "bg-emerald-50 border-emerald-500 text-emerald-600" : "border-slate-300"
                  }`}>
                    {hasMinLength ? "✓" : "○"}
                  </span>
                  <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 transition-colors ${hasNumber ? "text-emerald-600" : "text-slate-400"}`}>
                  <span className={`inline-flex items-center justify-center h-3.5 w-3.5 rounded-full text-[8px] border transition-all ${
                    hasNumber ? "bg-emerald-50 border-emerald-500 text-emerald-600" : "border-slate-300"
                  }`}>
                    {hasNumber ? "✓" : "○"}
                  </span>
                  <span>At least 1 number</span>
                </div>
                <div className={`flex items-center gap-1.5 transition-colors ${hasUppercase ? "text-emerald-600" : "text-slate-400"}`}>
                  <span className={`inline-flex items-center justify-center h-3.5 w-3.5 rounded-full text-[8px] border transition-all ${
                    hasUppercase ? "bg-emerald-50 border-emerald-500 text-emerald-600" : "border-slate-300"
                  }`}>
                    {hasUppercase ? "✓" : "○"}
                  </span>
                  <span>At least 1 uppercase letter</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-start gap-2.5 select-none">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={data.acceptTerms || false}
              onChange={(e) => onChange({ acceptTerms: e.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-650 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="acceptTerms" className="text-xs text-slate-500 leading-normal font-sans">
              I agree to the{" "}
              <a href={`${MARKETING_URL}/legal/terms`} target="_blank" className="text-blue-600 hover:underline font-semibold">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href={`${MARKETING_URL}/legal/privacy`} target="_blank" className="text-blue-600 hover:underline font-semibold">
                Privacy Policy
              </a>
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-button text-sm transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.99]"
      >
        Continue →
      </button>
    </form>
  );
}
