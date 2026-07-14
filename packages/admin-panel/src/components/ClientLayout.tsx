"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AdminLayout from "./AdminLayout";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
