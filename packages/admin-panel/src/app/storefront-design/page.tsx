"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StorefrontDesignRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/marketplace");
  }, [router]);

  return (
    <div className="p-12 text-center text-xs text-slate-500 font-medium animate-pulse">
      Redirecting to Theme & App Marketplace...
    </div>
  );
}
