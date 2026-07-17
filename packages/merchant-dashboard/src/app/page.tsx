"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">Redirecting to your Basecart workspace...</p>
      </div>
    </div>
  );
}
