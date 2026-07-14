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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${API_URL}/admin/auth/me`, {
          headers: { "Content-Type": "application/json" },
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
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
        <p className="text-slate-500 text-sm">Verifying administrator session...</p>
      </div>
    );
  }

  if (!admin) return null;

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Merchants", href: "/merchants", icon: Users },
    { name: "Audit Logs", href: "/audit-logs", icon: FileSpreadsheet },
    { name: "Super Admins", href: "/admins", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        style={{ width: collapsed ? 72 : 256 }}
        className="bg-white border-r border-slate-200/80 flex flex-col fixed h-full transition-[width] duration-300 ease-in-out z-30"
      >
        {/* Header branding */}
        <div className="h-14 border-b border-slate-100 px-4 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <ShieldCheck className="w-[18px] h-[18px] text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-slate-800 text-[15px] whitespace-nowrap">
              Basecart Admin
            </span>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={`flex items-center gap-3 rounded-lg text-[13px] font-semibold transition-all ${
                  collapsed ? "px-3 py-2.5 justify-center" : "px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 ${
                    isActive ? "text-indigo-600" : "text-slate-400"
                  }`}
                />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="px-3 py-2 border-t border-slate-100">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`flex items-center gap-3 w-full rounded-lg text-[13px] font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors ${
              collapsed ? "px-3 py-2 justify-center" : "px-3 py-2"
            }`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-[18px] h-[18px] shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="w-[18px] h-[18px] shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* Footer Admin Info */}
        <div className="px-3 py-3 border-t border-slate-100 shrink-0">
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
            <div
              className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0"
              title={admin.email}
            >
              <span className="text-xs font-bold text-indigo-600">
                {admin.email.charAt(0).toUpperCase()}
              </span>
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-0.5">
                  Admin
                </p>
                <p className="text-xs font-medium text-slate-700 truncate">
                  {admin.email}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        style={{ paddingLeft: collapsed ? 72 : 256 }}
        className="flex-1 flex flex-col min-h-screen transition-[padding] duration-300 ease-in-out"
      >
        <div className="p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
