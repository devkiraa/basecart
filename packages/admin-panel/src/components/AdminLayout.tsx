"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  MessageSquare,
  Activity,
  ShieldAlert,
  Settings,
  Search,
  Menu,
  X,
  Mail,
  ShoppingCart,
  BarChart3,
  ShoppingBag,
  Bell,
  ToggleLeft,
  Key,
  Layers,
  HeartPulse,
  Server,
  FileText,
  ShieldCheck,
  FileSpreadsheet,
  Cloud,
  LogOut,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Palette,
  Link2,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    merchants: any[];
    admins: any[];
    tickets: any[];
  }>({ merchants: [], admins: [], tickets: [] });
  const [searching, setSearching] = useState(false);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults({ merchants: [], admins: [], tickets: [] });
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`${API_URL}/admin/search?q=${encodeURIComponent(searchQuery)}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

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

  // Grouped Navigation Items matching standard SaaS platforms (Stripe/Shopify)
  const navGroups = [
    {
      group: "Executive Suite",
      items: [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
      ],
    },
    {
      group: "Merchant Registry",
      items: [
        { name: "All Merchants", href: "/merchants", icon: Users },
      ],
    },
    {
      group: "Revenue Operations",
      items: [
        { name: "Billing & Subs", href: "/billing", icon: CreditCard },
        { name: "Orders Feed", href: "/orders", icon: ShoppingCart },
        { name: "URL Attribution", href: "/attribution", icon: Link2 },
        { name: "Platform Analytics", href: "/analytics", icon: BarChart3 },
      ],
    },
    {
      group: "Marketplaces",
      items: [
        { name: "Themes & Apps", href: "/marketplace", icon: ShoppingBag },
      ],
    },
    {
      group: "Communications",
      items: [
        { name: "Support Desk", href: "/support", icon: MessageSquare },
        { name: "Notifications Center", href: "/notifications", icon: Bell },
        { name: "Mail Templates", href: "/emails", icon: Mail },
      ],
    },
    {
      group: "Platform Configuration",
      items: [
        { name: "Feature Flags", href: "/platform/feature-flags", icon: ToggleLeft },
        { name: "API & Webhooks", href: "/platform/api-keys", icon: Key },
        { name: "Queue Monitor", href: "/platform/queue-monitor", icon: Layers },
        { name: "System Status", href: "/platform/system-status", icon: HeartPulse },
        { name: "Real-time Metrics", href: "/monitoring", icon: Server },
        { name: "Security Console", href: "/security", icon: ShieldAlert },
        { name: "System Settings", href: "/settings", icon: Settings },
      ],
    },
    {
      group: "Content Management",
      items: [
        { name: "CMS Toggles", href: "/content", icon: FileText },
      ],
    },
    {
      group: "Administration Control",
      items: [
        { name: "Super Admins", href: "/admins", icon: ShieldCheck },
        { name: "Audit Logging", href: "/audit-logs", icon: FileSpreadsheet },
      ],
    },
    {
      group: "Edge Infrastructure",
      items: [
        { name: "Cloudflare Stack", href: "/infrastructure", icon: Cloud },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        style={{ width: collapsed ? 72 : 260 }}
        className="hidden lg:flex bg-white border-r border-slate-200/80 flex-col fixed h-full transition-[width] duration-300 ease-in-out z-30"
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

        {/* Reorganized Navigation Groups */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              {!collapsed && (
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 block">
                  {group.group}
                </h4>
              )}
              {group.items.map((item) => {
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
                      collapsed ? "px-3 py-2 justify-center" : "px-3 py-2"
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
            </div>
          ))}
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
        style={{ paddingLeft: isMobile ? 0 : (collapsed ? 72 : 260) }}
        className="flex-1 flex flex-col min-h-screen transition-[padding] duration-300 ease-in-out pb-16 lg:pb-0"
      >
        {/* Top Header Bar */}
        <header className="h-14 bg-white border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/85 hover:bg-slate-100/70 rounded-lg text-xs font-semibold text-slate-450 select-none transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-slate-450" />
              <span className="hidden sm:inline">Search console...</span>
              <kbd className="hidden sm:inline-block bg-white border border-slate-200/90 rounded px-1.5 py-0.5 ml-3 font-mono text-[10px] text-slate-450">
                Ctrl+K
              </kbd>
            </button>
          </div>

          <div className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded px-2.5 py-1 uppercase tracking-wider">
            Staging Operations Console
          </div>
        </header>

        <div className="p-4 md:p-6 lg:p-8 flex-1">{children}</div>
      </main>

      {/* Cmd+K Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center p-4 pt-[15vh]">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Input */}
            <div className="flex items-center gap-3 px-4 border-b border-slate-100">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search merchants, admins, or support tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-4 text-slate-800 text-sm focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-xs font-semibold text-slate-450 hover:text-slate-650 px-2 py-1 rounded bg-slate-50 border border-slate-200"
              >
                ESC
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[350px] overflow-y-auto p-4 space-y-4">
              {searching && (
                <div className="flex items-center justify-center py-8 text-xs text-slate-400 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  Searching registry partitions...
                </div>
              )}

              {!searching && !searchQuery && (
                <div className="text-center py-8 text-xs text-slate-400">
                  Type a store name, email domain, or ticket subject to search.
                </div>
              )}

              {!searching && searchQuery && Object.values(searchResults).every(arr => arr.length === 0) && (
                <div className="text-center py-8 text-xs text-slate-400">
                  No results matched your search.
                </div>
              )}

              {/* Merchants Results */}
              {searchResults.merchants.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Merchants</h4>
                  <div className="space-y-1">
                    {searchResults.merchants.map((m: any) => (
                      <button
                        key={m.tenantId}
                        onClick={() => {
                          router.push(`/merchants/${m.tenantId}`);
                          setSearchOpen(false);
                        }}
                        className="flex items-center justify-between w-full p-2.5 hover:bg-slate-50 rounded-lg text-left text-sm text-slate-700 font-medium transition-colors"
                      >
                        <div>
                          <div className="text-slate-800">{m.storeName}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{m.subdomain}.basecart.app</div>
                        </div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">
                          {m.plan}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Admins Results */}
              {searchResults.admins.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Super Admins</h4>
                  <div className="space-y-1">
                    {searchResults.admins.map((a: any) => (
                      <button
                        key={a.email}
                        onClick={() => {
                          router.push("/admins");
                          setSearchOpen(false);
                        }}
                        className="flex items-center justify-between w-full p-2.5 hover:bg-slate-50 rounded-lg text-left text-sm text-slate-700 font-medium transition-colors"
                      >
                        <div>
                          <div className="text-slate-800">{a.email}</div>
                        </div>
                        <span className="text-[9px] uppercase font-bold text-indigo-600 px-1.5 py-0.5 bg-indigo-50 rounded border border-indigo-100">
                          {a.role}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tickets Results */}
              {searchResults.tickets.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Support Tickets</h4>
                  <div className="space-y-1">
                    {searchResults.tickets.map((t: any) => (
                      <button
                        key={t.ticketId}
                        onClick={() => {
                          router.push(`/support?ticketId=${t.ticketId}`);
                          setSearchOpen(false);
                        }}
                        className="flex items-center justify-between w-full p-2.5 hover:bg-slate-50 rounded-lg text-left text-sm text-slate-700 font-medium transition-colors"
                      >
                        <div>
                          <div className="text-slate-800 truncate max-w-[300px]">{t.subject}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Store: {t.storeName}</div>
                        </div>
                        <span className="text-[9px] uppercase font-bold text-red-650 px-1.5 py-0.5 bg-red-50 rounded border border-red-100">
                          {t.priority}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer (Slide-out Hamburger Menu) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
          />
          {/* Drawer content panel */}
          <aside className="relative w-72 max-w-[80vw] bg-white h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-250">
            <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100 shrink-0 select-none">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-[18px] h-[18px] text-white" />
                </div>
                <span className="font-bold text-slate-800 text-[15px] whitespace-nowrap">
                  Basecart Admin
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-slate-450 hover:text-slate-650 hover:bg-slate-50 transition-colors"
                title="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
              {navGroups.map((group) => (
                <div key={group.group} className="space-y-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-1.5 block">
                    {group.group}
                  </h4>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-lg text-[13px] font-semibold px-3 py-2 transition-all ${
                          isActive
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        }`}
                      >
                        <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Logout button at bottom of drawer */}
            <div className="p-4 border-t border-slate-100 shrink-0">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 hover:bg-red-50 text-slate-700 hover:text-red-650 font-bold rounded-lg text-xs transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-40 flex items-center justify-around px-2 select-none">
        {[
          { name: "Dashboard", href: "/", icon: LayoutDashboard },
          { name: "Merchants", href: "/merchants", icon: Users },
          { name: "Billing", href: "/billing", icon: CreditCard },
          { name: "Support", href: "/support", icon: MessageSquare },
          { name: "Settings", href: "/settings", icon: Settings },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1.5 transition-all ${
                isActive ? "text-indigo-600 font-bold" : "text-slate-400 hover:text-slate-650"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
