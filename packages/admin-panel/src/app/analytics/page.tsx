"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Database, 
  Activity, 
  Percent,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";
import { GmvChart, MerchantSignupsChart } from "@/components/AdminCharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface AnalyticsData {
  mrr: number;
  arr: number;
  mrrChange?: string;
  arrChange?: string;
  conversionRate: string;
  activeUsers: number;
  totalProductsCount?: number;
  storageVolume?: string;
  apiLoad?: string;
  signupsHistory: string[];
  gmvTrend?: Array<{ label: string; value: number }>;
  signupTrend?: Array<{ label: string; value: number }>;
}

export default function AnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/admin/analytics`, { credentials: "include" })
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load analytics:", err);
        setLoading(false);
      });
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const metrics = [
    {
      name: "Monthly Recurring Revenue",
      value: formatCurrency(data?.mrr || 0),
      change: data?.mrrChange || "0.0%",
      isPositive: true,
      subtext: "Live merchant subscriptions",
    },
    {
      name: "Annualized Run Rate",
      value: formatCurrency(data?.arr || 0),
      change: data?.arrChange || "0.0%",
      isPositive: true,
      subtext: "Yearly projection scale",
    },
    {
      name: "Conversion Rate",
      value: data?.conversionRate || "0.00%",
      change: "+0.00%",
      isPositive: true,
      subtext: "Live checkout conversion avg",
    },
    {
      name: "Active Registered Shoppers",
      value: (data?.activeUsers || 0).toLocaleString(),
      change: "+0.0%",
      isPositive: true,
      subtext: "Unique customer emails",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Company Analytics & Growth</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time platform financial statistics, merchant catalog growth, and system usage aggregates.
          </p>
        </div>

        <div className="flex items-center gap-2 select-none shrink-0">
          <button 
            onClick={() => setTimeframe("7d")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              timeframe === "7d" ? "bg-indigo-600 border-indigo-600 text-white shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            7 Days
          </button>
          <button 
            onClick={() => setTimeframe("30d")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              timeframe === "30d" ? "bg-indigo-600 border-indigo-600 text-white shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            30 Days
          </button>
          <button 
            onClick={() => setTimeframe("12m")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              timeframe === "12m" ? "bg-indigo-600 border-indigo-600 text-white shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            12 Months
          </button>
        </div>
      </div>

      {/* Dynamic Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => (
          <div key={m.name} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{m.name}</span>
            <div className="flex items-baseline justify-between">
              {loading ? (
                <div className="h-8 bg-slate-200 rounded w-28 animate-pulse" />
              ) : (
                <span className="text-2xl font-black text-slate-800">{m.value}</span>
              )}
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                m.isPositive ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
              }`}>
                {m.change}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">{m.subtext}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GMV Growth Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Gross Merchandise Value (GMV)</h3>
            <span className="px-2 py-0.5 text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-full">INR</span>
          </div>
          <div className="h-64">
            <GmvChart data={data?.gmvTrend} />
          </div>
        </div>

        {/* Merchant Signups Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Merchant Signups & Active Stores</h3>
            <span className="px-2 py-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full">Stores</span>
          </div>
          <div className="h-64">
            <MerchantSignupsChart data={data?.signupTrend} />
          </div>
        </div>
      </div>

      {/* Real Infrastructure & Catalog Telemetries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-800">Storage Volume</h4>
          </div>
          <div className="text-xl font-extrabold text-slate-800">
            {loading ? <div className="h-6 bg-slate-200 rounded w-20 animate-pulse" /> : data?.storageVolume || "0 MB"}
          </div>
          <p className="text-[10px] text-slate-400 font-semibold">Active R2 bucket & database partition media</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-800">Edge API Request Load</h4>
          </div>
          <div className="text-xl font-extrabold text-slate-800">
            {loading ? <div className="h-6 bg-slate-200 rounded w-24 animate-pulse" /> : data?.apiLoad || "0 / day"}
          </div>
          <p className="text-[10px] text-slate-400 font-semibold">Real Workers runtime execution requests</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-800">Products Cataloged</h4>
          </div>
          <div className="text-xl font-extrabold text-slate-800">
            {loading ? <div className="h-6 bg-slate-200 rounded w-16 animate-pulse" /> : (data?.totalProductsCount || 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 font-semibold">Total active products indexed across live stores</p>
        </div>
      </div>
    </div>
  );
}
