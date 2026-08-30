"use client";

import { useEffect } from "react";
import { captureUtmParams } from "@basecart/shared";

interface DashboardRedirectorProps {
  merchantDashboardUrl: string;
}

export default function DashboardRedirector({ merchantDashboardUrl }: DashboardRedirectorProps) {
  useEffect(() => {
    captureUtmParams();
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
