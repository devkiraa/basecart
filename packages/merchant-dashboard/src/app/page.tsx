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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
      <div className="relative flex flex-col items-center space-y-6 z-10">
        <div className="loader" />
        <div className="text-center space-y-1.5">
          <h2 className="text-xs font-black tracking-widest text-slate-900 uppercase">BASECART MERCHANT</h2>
          <p className="text-xs font-semibold text-slate-500">Redirecting to your workspace...</p>
        </div>
      </div>
    </div>
  );
}
