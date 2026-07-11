"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  LogOut,
  Loader2,
  ShieldCheck,
} from "lucide-react";

const API_URL = "http://localhost:3001";

interface AdminProfile {
  email: string;
  userId: string;
  role: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${API_URL}/admin/auth/me`, {
          headers: {
            // Support credentials via cookies, which Next.js forwards automatically
            "Content-Type": "application/json",
          },
          // Send cookies
          credentials: "include",
        });

        if (!res.ok) {
          router.replace("/login");
          return;
        }

        const data = await res.json();
        setAdmin(data);
      } catch (err) {
        console.error("Auth check error:", err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/admin/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      router.replace("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
        <p className="text-slate-500 text-sm">Verifying administrator session...</p>
      </div>
    );
  }

  if (!admin) return null;

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Merchants", href: "/merchants", icon: Users },
    { name: "Audit Logs", href: "/audit-logs", icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between fixed h-full">
        <div>
          {/* Header branding */}
          <div className="h-16 border-b border-slate-200 px-6 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-slate-800 text-lg">Basecart Admin</span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin Info */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Super Admin</p>
              <p className="text-sm font-medium text-slate-700 truncate" title={admin.email}>
                {admin.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="pl-64 flex-1 flex flex-col min-h-screen">
        <div className="p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
