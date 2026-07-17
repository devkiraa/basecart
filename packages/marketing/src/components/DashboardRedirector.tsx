"use client";

import { useEffect } from "react";

interface DashboardRedirectorProps {
  merchantDashboardUrl: string;
}

export default function DashboardRedirector({ merchantDashboardUrl }: DashboardRedirectorProps) {
  useEffect(() => {
    try {
      const token = localStorage.getItem("basecart_merchant_token");
      if (token) {
        window.location.href = `${merchantDashboardUrl}/dashboard`;
      }
    } catch (e) {
      console.error("Failed to access localStorage or redirect:", e);
    }
  }, [merchantDashboardUrl]);

  return null;
}
