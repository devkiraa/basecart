import React, { useState, useEffect } from "react";
import { ShoppingBag, Globe, AlertCircle, Loader2 } from "lucide-react";

interface StepStoreProps {
  data: any;
  onChange: (fields: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const CATEGORIES = [
  "Apparel & Fashion",
  "Electronics & Gadgets",
  "Home & Kitchen",
  "Food & Beverage",
  "Beauty & Cosmetics",
  "Books & Stationery",
  "Watches & Accessories",
  "Other"
];

const BUSINESS_TYPES = [
  "Individual / Sole Proprietorship",
  "Private Limited Company",
  "Partnership Firm",
  "LLP (Limited Liability Partnership)",
  "Other"
];

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Other"
];

export default function StepStore({ data, onChange, onNext, onBack }: StepStoreProps) {
  const [localError, setLocalError] = useState("");
  const [isSubdomainManuallyEdited, setIsSubdomainManuallyEdited] = useState(false);
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [alternates, setAlternates] = useState<string[]>([]);
  const [checkingTimeout, setCheckingTimeout] = useState<NodeJS.Timeout | null>(null);

  const checkSubdomainAvailability = (sub: string) => {
    if (checkingTimeout) {
      clearTimeout(checkingTimeout);
    }

    setIsAvailable(null);
    setAlternates([]);
    setChecking(false);

    const cleanSub = sub.trim();
    if (cleanSub.length < 2) {
      return;
    }

    setChecking(true);

    const timeout = setTimeout(async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";
        const res = await fetch(`${API_URL}/auth/merchant/check-subdomain?subdomain=${cleanSub}`);
        if (!res.ok) throw new Error();
        const resData = await res.json();
        setIsAvailable(resData.available);
        if (!resData.available && resData.alternates) {
          setAlternates(resData.alternates);
        }
      } catch (e) {
        setIsAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 1000); // 1000ms debounce to avoid database request limit pressure

    setCheckingTimeout(timeout);
  };

  useEffect(() => {
    if (data.subdomain) {
      checkSubdomainAvailability(data.subdomain);
    }
  }, []);

  const handleStoreNameChange = (val: string) => {
    onChange({ storeName: val });
    if (!isSubdomainManuallyEdited) {
      let suggested = val.toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      onChange({ subdomain: suggested });
      checkSubdomainAvailability(suggested);
    }
  };

  const handleSubdomainChange = (val: string) => {
    setIsSubdomainManuallyEdited(true);
    let cleaned = val.trim().toLowerCase();
    cleaned = cleaned.replace(/[^a-z0-9-]/g, "");
    onChange({ subdomain: cleaned });
    checkSubdomainAvailability(cleaned);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!data.storeName || !data.subdomain || !data.businessCategory || !data.businessType || !data.state) {
      setLocalError("Please fill in all required fields.");
      return;
    }

    if (data.subdomain.length < 2) {
      setLocalError("Subdomain must be at least 2 characters.");
      return;
    }

    if (isAvailable === false) {
      setLocalError("The selected subdomain is not available. Please choose another prefix.");
      return;
    }

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left font-sans animate-fade-in">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Store profile</h2>
        <p className="text-xs text-slate-500">Tell us about your brand and online storefront URL.</p>
      </div>

      {localError && (
        <div className="bg-red-50 text-red-700 border border-red-100 p-3 rounded-button text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{localError}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Store Name
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <ShoppingBag className="h-4 w-4" />
            </span>
            <input
              type="text"
              required
              value={data.storeName || ""}
              onChange={(e) => handleStoreNameChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="e.g. Watchroom"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Store Subdomain
          </label>
          <div className="flex rounded-button border border-slate-300 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 overflow-hidden">
            <span className="inline-flex items-center pl-3 text-slate-400 bg-slate-50 border-r border-slate-200 pr-2">
              <Globe className="h-4 w-4 mr-1.5" />
              <span className="text-xs font-mono font-medium">https://</span>
            </span>
            <input
              type="text"
              required
              value={data.subdomain || ""}
              onChange={(e) => handleSubdomainChange(e.target.value)}
              className="flex-1 px-3 py-2 text-slate-950 focus:outline-none text-sm font-mono"
              placeholder="my-brand"
            />
            <span className="inline-flex items-center px-3 text-slate-450 bg-slate-55 bg-slate-50 border-l border-slate-200 text-xs font-mono font-semibold">
              .basecart.app
            </span>
          </div>

          {checking && (
            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-medium">
              <Loader2 className="h-3 w-3 animate-spin text-indigo-650" />
              <span>Checking availability...</span>
            </div>
          )}

          {isAvailable === true && (
            <span className="text-[10px] text-emerald-600 font-bold mt-1 block">✓ Subdomain is available!</span>
          )}

          {isAvailable === false && alternates.length === 0 && (
            <span className="text-[10px] text-red-500 font-bold mt-1 block">✗ Subdomain is taken.</span>
          )}

          {isAvailable === false && alternates.length > 0 && (
            <div className="mt-2.5 text-xs bg-amber-50 text-amber-800 border border-amber-100 p-2.5 rounded-button font-sans">
              <div className="font-semibold mb-1">Subdomain is already registered. Try one of these alternates:</div>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {alternates.map((alt) => (
                  <button
                    key={alt}
                    type="button"
                    onClick={() => {
                      onChange({ subdomain: alt });
                      setIsAvailable(true);
                      setAlternates([]);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-amber-200 text-amber-850 font-extrabold rounded text-[10px] transition-all shadow-sm active:scale-95"
                  >
                    {alt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Business Category
            </label>
            <select
              required
              value={data.businessCategory || ""}
              onChange={(e) => onChange({ businessCategory: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="" disabled>Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Business Type
            </label>
            <select
              required
              value={data.businessType || ""}
              onChange={(e) => onChange({ businessType: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="" disabled>Select type</option>
              {BUSINESS_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Country
            </label>
            <input
              type="text"
              readOnly
              value="India"
              className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-button text-slate-500 text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              State
            </label>
            <select
              required
              value={data.state || ""}
              onChange={(e) => onChange({ state: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="" disabled>Select state</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
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
