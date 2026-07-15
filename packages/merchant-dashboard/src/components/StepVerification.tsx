import React, { useState, useRef } from "react";
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
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const otpCode = data.otpCode || "";
  const otpArray = otpCode.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleInputChange = (value: string, index: number) => {
    // Only allow digits
    const cleanValue = value.replace(/[^0-9]/g, "");
    if (!cleanValue) {
      // Clear value at this index
      const newOtp = [...otpArray];
      newOtp[index] = "";
      onChange({ otpCode: newOtp.join("") });
      return;
    }

    // Take the last digit if multiple are entered
    const digit = cleanValue[cleanValue.length - 1];
    const newOtp = [...otpArray];
    newOtp[index] = digit;
    const finalCode = newOtp.join("");
    onChange({ otpCode: finalCode });

    // Auto-focus next input
    if (index < 5 && digit) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      // If current is empty, focus previous and clear it
      if (!otpArray[index] && index > 0) {
        const newOtp = [...otpArray];
        newOtp[index - 1] = "";
        onChange({ otpCode: newOtp.join("") });
        inputRefs[index - 1].current?.focus();
      } else {
        // Just clear current
        const newOtp = [...otpArray];
        newOtp[index] = "";
        onChange({ otpCode: newOtp.join("") });
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (pastedData) {
      onChange({ otpCode: pastedData });
      // Focus the appropriate input
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs[nextIndex].current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (otpCode.length !== 6) {
      setLocalError("Please enter all 6 digits of the verification code.");
      return;
    }

    if (otpCode !== "000000") {
      setLocalError("Invalid verification code. Please use 000000 for mock verification.");
      return;
    }

    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left font-sans animate-fade-in">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Verify email</h2>
        <p className="text-xs text-slate-500 font-sans">We have sent a mock 6-digit verification code to <span className="font-semibold text-slate-800">{data.email}</span>.</p>
      </div>

      {(localError || error) && (
        <div className="bg-red-50 text-red-700 border border-red-100 p-3 rounded-button text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{localError || error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2.5 text-center">
            Verification Code
          </label>
          
          {/* OTP Box Inputs */}
          <div className="flex gap-2.5 justify-center select-none">
            {otpArray.map((digit: string, idx: number) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                maxLength={1}
                inputMode="numeric"
                pattern="[0-9]*"
                value={digit}
                onChange={(e) => handleInputChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                onPaste={idx === 0 ? handlePaste : undefined}
                className="w-11 h-11 text-center border border-slate-300 rounded-lg text-slate-950 text-lg font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-sans shadow-sm transition-all"
                placeholder="-"
              />
            ))}
          </div>
          
          <span className="text-[10px] text-slate-400 mt-3 block text-center leading-normal">
            Enter the default sandbox verification code: <strong className="text-indigo-650 text-indigo-600">000000</strong>
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
          className="w-1/3 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-button text-sm transition-colors disabled:opacity-50 font-sans"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-button text-sm transition-colors shadow-sm flex items-center justify-center gap-2 font-sans"
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
