import React, { useState } from "react";
import { User, Phone, AlertCircle } from "lucide-react";

interface StepBusinessProps {
  data: any;
  onChange: (fields: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const TEAM_SIZES = ["1", "2-5", "6-20", "20+"];
const MONTHLY_ORDERS = ["0-50", "50-200", "200-1000", "1000+"];
const PLATFORMS = ["None", "Shopify", "WooCommerce", "Custom", "Other"];
const HEAR_ABOUT_US = ["Google Search", "Social Media", "Friend / Colleague", "Advertisement", "Other"];

export default function StepBusiness({ data, onChange, onNext, onBack }: StepBusinessProps) {
  const [localError, setLocalError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!data.ownerName || !data.phone || !data.teamSize || !data.monthlyOrders || !data.currentPlatform || !data.hearAboutUs) {
      setLocalError("Please fill in all required fields.");
      return;
    }

    const cleanedPhone = data.phone.trim().replace(/[^0-9]/g, "");
    if (cleanedPhone.length < 10) {
      setLocalError("Please enter a valid 10-digit mobile number.");
      return;
    }

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left font-sans animate-fade-in">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Business profile</h2>
        <p className="text-xs text-slate-500">Provide details about yourself and operations volume.</p>
      </div>

      {localError && (
        <div className="bg-red-50 text-red-700 border border-red-100 p-3 rounded-button text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{localError}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Your Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                value={data.ownerName || ""}
                onChange={(e) => onChange({ ownerName: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Mobile Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Phone className="h-4 w-4" />
              </span>
              <input
                type="tel"
                required
                value={data.phone || ""}
                onChange={(e) => onChange({ phone: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="10-digit mobile"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Team Size
          </label>
          <div className="grid grid-cols-4 gap-2">
            {TEAM_SIZES.map((size) => {
              const active = data.teamSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onChange({ teamSize: size })}
                  className={`py-2 text-xs font-bold rounded border text-center transition-all ${
                    active
                      ? "border-indigo-650 bg-indigo-50 text-indigo-700 font-extrabold shadow-sm"
                      : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Estimated Monthly Orders
          </label>
          <div className="grid grid-cols-4 gap-2">
            {MONTHLY_ORDERS.map((vol) => {
              const active = data.monthlyOrders === vol;
              return (
                <button
                  key={vol}
                  type="button"
                  onClick={() => onChange({ monthlyOrders: vol })}
                  className={`py-2 text-xs font-bold rounded border text-center transition-all ${
                    active
                      ? "border-indigo-650 bg-indigo-50 text-indigo-700 font-extrabold shadow-sm"
                      : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                  }`}
                >
                  {vol}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Current Platform
            </label>
            <select
              required
              value={data.currentPlatform || ""}
              onChange={(e) => onChange({ currentPlatform: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="" disabled>Select platform</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              How did you hear about us?
            </label>
            <select
              required
              value={data.hearAboutUs || ""}
              onChange={(e) => onChange({ hearAboutUs: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="" disabled>Select channel</option>
              {HEAR_ABOUT_US.map((src) => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="w-1/3 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-button text-sm transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-button text-sm transition-colors shadow-sm text-center"
        >
          Next Step
        </button>
      </div>
    </form>
  );
}
