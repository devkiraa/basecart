"use client";

import React, { useEffect, useState } from "react";
import ClientLayout from "../../components/ClientLayout";
import { CreditCard, BadgeCent, ArrowUpRight, Loader2, Sparkles } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface BillingOverview {
  mrr: number;
  arr: number;
  planDistribution: {
    starter: number;
    growth: number;
    pro: number;
  };
  totalInvoices: number;
}

export default function BillingPage() {
  const [data, setData] = useState<BillingOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBilling() {
      try {
        const res = await fetch(`${API_URL}/admin/billing/overview`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load billing metrics");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError("Unable to retrieve platform billing records.");
      } finally {
        setLoading(false);
      }
    }
    loadBilling();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Billing & Subscriptions</h1>
        <p className="text-sm text-slate-500 mt-1">
          Overview of MRR, ARR, renewal logs, plan metrics, and central invoicing stats.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-sm text-red-650 rounded-xl">
          {error}
        </div>
      )}

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
            Monthly Recurring Revenue (MRR)
          </span>
          <div className="text-3xl font-extrabold text-slate-800">
            {loading ? (
              <div className="h-9 bg-slate-200 rounded w-36 animate-pulse" />
            ) : (
              formatCurrency(data?.mrr || 0)
            )}
          </div>
          <p className="text-xs text-indigo-600 font-semibold mt-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Calculated from active plans
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
            Annualized Run Rate (ARR)
          </span>
          <div className="text-3xl font-extrabold text-slate-800">
            {loading ? (
              <div className="h-9 bg-slate-200 rounded w-40 animate-pulse" />
            ) : (
              formatCurrency(data?.arr || 0)
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">12x MRR projection scale</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
            Active Invoices Today
          </span>
          <div className="text-3xl font-extrabold text-slate-800">
            {loading ? (
              <div className="h-9 bg-slate-200 rounded w-20 animate-pulse" />
            ) : (
              data?.totalInvoices || 0
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">Total registered merchants invoiced</p>
        </div>
      </div>

      {/* Detailed Invoices list */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-800">Platform Subscription Records</h3>
          <p className="text-xs text-slate-500 mt-0.5">Aggregated recurring payments records.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Transaction Code</th>
                <th className="px-6 py-4">Store Reference</th>
                <th className="px-6 py-4">Billing Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded w-16" /></td>
                  </tr>
                ))
              ) : (
                <>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">inv_827f310a</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">Apex Storefront</td>
                    <td className="px-6 py-4 text-slate-500">2026-07-14</td>
                    <td className="px-6 py-4 font-bold text-slate-900">₹9,999</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Paid
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">inv_7d10b9ff</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">Pixel & Palette</td>
                    <td className="px-6 py-4 text-slate-500">2026-07-13</td>
                    <td className="px-6 py-4 font-bold text-slate-900">₹4,999</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Paid
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">inv_44c11aa7</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">Nordic Living</td>
                    <td className="px-6 py-4 text-slate-500">2026-07-12</td>
                    <td className="px-6 py-4 font-bold text-slate-900">₹999</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Paid
                      </span>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
