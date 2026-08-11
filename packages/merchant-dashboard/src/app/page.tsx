"use client";

import { useEffect } from "react";
import { Loader2, ShoppingBag } from "lucide-react";

export default function RootRedirector() {
  useEffect(() => {
    const token = localStorage.getItem("basecart_merchant_token");
    if (token) {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/login";
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Background glow gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center space-y-6 z-10">
        {/* Animated Orbit Spinner */}
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
          <div className="absolute inset-0 w-20 h-20 rounded-2xl border-2 border-indigo-500/10 border-b-indigo-400 animate-spin [animation-duration:2s]" />

          <div className="absolute w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <ShoppingBag className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-sm font-black tracking-widest text-slate-100 uppercase">BASECART MERCHANT</h2>
          <div className="flex items-center gap-2 justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <p className="text-xs font-semibold text-slate-400">Redirecting to your Basecart workspace...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
