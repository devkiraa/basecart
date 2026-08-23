"use client";

import { useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function LogoutPage() {
  useEffect(() => {
    async function performLogout() {
      try {
        await fetch(`${API_URL}/auth/merchant/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch (err) {
        console.error("Logout API error:", err);
      } finally {
        // Clear local storage fallbacks
        localStorage.removeItem("basecart_token");
        localStorage.removeItem("basecart_refresh_token");
        localStorage.removeItem("basecart_tenant_id");

        // Redirect to login
        window.location.href = "/login";
      }
    }

    performLogout();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Signing out of Basecart Merchant Console...</p>
      </div>
    </div>
  );
}
