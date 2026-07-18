"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  LogOut,
  Package,
  ChevronRight,
  ShoppingBag,
  Loader2,
} from "lucide-react";

interface Customer {
  name: string;
  email: string;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  total: number;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  processing: "bg-blue-50 text-blue-700 border-blue-100",
  shipped: "bg-violet-50 text-violet-700 border-violet-100",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled: "bg-red-50 text-red-700 border-red-100",
};

export default function AccountPage() {
  const { tenant } = useParams<{ tenant: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(`basecart_customer_${tenant}`);
    if (raw) {
      const c: Customer = JSON.parse(raw);
      setCustomer(c);
      fetchOrders(c.email);
    }
  }, [tenant]);

  const fetchOrders = async (email: string) => {
    setLoadingOrders(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/store/${tenant}/my-orders?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
      // Mock orders for demo
      setOrders([
        {
          id: "ORD-DEMO01",
          date: new Date(Date.now() - 86400000 * 3).toISOString(),
          status: "delivered",
          items: [{ productId: "prod-1", name: "Handcrafted Silk Kasavu Saree", price: 4999, quantity: 1 }],
          total: 4999,
        },
        {
          id: "ORD-DEMO02",
          date: new Date(Date.now() - 86400000).toISOString(),
          status: "shipped",
          items: [{ productId: "prod-2", name: "Chocolate Fudge Celebration Cake", price: 1200, quantity: 2 }],
          total: 2400,
        },
      ]);
    }
    setLoadingOrders(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (authMode === "signup" && !authForm.name.trim()) {
      setAuthError("Name is required");
      return;
    }
    if (!authForm.email.includes("@")) {
      setAuthError("Valid email is required");
      return;
    }
    if (authForm.password.length < 6) {
      setAuthError("Password must be at least 6 characters");
      return;
    }

    setLoggingIn(true);
    // Simulate auth
    await new Promise((r) => setTimeout(r, 800));

    const c: Customer = {
      name: authForm.name || authForm.email.split("@")[0],
      email: authForm.email,
    };
    localStorage.setItem(`basecart_customer_${tenant}`, JSON.stringify(c));
    setCustomer(c);
    fetchOrders(c.email);
    setLoggingIn(false);
  };

  const logout = () => {
    localStorage.removeItem(`basecart_customer_${tenant}`);
    setCustomer(null);
    setOrders([]);
  };

  // --- Login / Signup View ---
  if (!customer) {
    return (
      <div className="max-w-md mx-auto py-16 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[var(--color-primary-subtle)] rounded-full flex items-center justify-center mx-auto">
            <User size={28} className="text-[var(--color-primary)]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            {authMode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {authMode === "login"
              ? "Sign in to view your orders"
              : "Sign up to start shopping"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
          {authMode === "signup" && (
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={authForm.name}
                  onChange={(e) => setAuthForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>
          )}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="john@example.com"
                value={authForm.email}
                onChange={(e) => setAuthForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full pl-9 pr-3 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={authForm.password}
                onChange={(e) => setAuthForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full pl-9 pr-3 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
          </div>

          {authError && <p className="text-xs font-bold text-red-500">{authError}</p>}

          <button
            type="submit"
            disabled={loggingIn}
            className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-extrabold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loggingIn ? <Loader2 size={15} className="animate-spin" /> : authMode === "login" ? "Sign In" : "Create Account"}
          </button>

          <p className="text-center text-xs font-medium text-slate-400">
            {authMode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => setAuthMode("signup")} className="text-[var(--color-primary)] font-bold hover:underline">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button type="button" onClick={() => setAuthMode("login")} className="text-[var(--color-primary)] font-bold hover:underline">
                  Sign in
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    );
  }

  // --- Authenticated View ---
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Account</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-[var(--color-primary-subtle)] rounded-full flex items-center justify-center">
            <User size={20} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">{customer.name}</h2>
            <p className="text-xs text-slate-400 font-medium">{customer.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={13} /> Logout
        </button>
      </div>

      {/* Order History */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Package size={13} /> Order History
        </h2>

        {loadingOrders ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100 animate-shimmer" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
            <ShoppingBag size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-400">No orders yet.</p>
            <Link href="/catalog" className="text-xs font-bold text-[var(--color-primary)] mt-2 inline-block hover:underline">
              Start shopping →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-black text-slate-900">{order.id}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {new Date(order.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${
                      STATUS_STYLES[order.status] || "bg-slate-50 text-slate-500 border-slate-100"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="space-y-1.5 mb-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-bold text-slate-700">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                  <span className="text-sm font-black text-slate-950">₹{order.total.toLocaleString("en-IN")}</span>
                  <span className="text-[10px] font-bold text-[var(--color-primary)] flex items-center gap-0.5">
                    View Details <ChevronRight size={11} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
