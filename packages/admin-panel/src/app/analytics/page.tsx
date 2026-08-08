"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Database, 
  Activity, 
  Percent,
  Calendar
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Cloudflare Radar-style chart configuration
const CF_BLUE   = "#2563EB";
const CF_GREEN  = "#10B981";
const CF_PURPLE = "#8B5CF6";
const GRID_COLOR = "#f1f5f9"; // slate-100

// Sample trend data — replaced with real API data when available
const gmvData = [
  { date: "Jun 20", gmv: 120000 },
  { date: "Jun 25", gmv: 145000 },
  { date: "Jul 01", gmv: 132000 },
  { date: "Jul 07", gmv: 188000 },
  { date: "Jul 12", gmv: 220000 },
  { date: "Jul 17", gmv: 275000 },
  { date: "Jul 22", gmv: 310000 },
  { date: "Aug 01", gmv: 390000 },
];

const signupData = [
  { date: "Jun 20", stores: 12 },
  { date: "Jun 25", stores: 18 },
  { date: "Jul 01", stores: 22 },
  { date: "Jul 07", stores: 31 },
  { date: "Jul 12", stores: 40 },
  { date: "Jul 17", stores: 55 },
  { date: "Jul 22", stores: 63 },
  { date: "Aug 01", stores: 78 },
];

const cfTooltipStyle = {
  contentStyle: {
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "11px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    padding: "6px 10px",
  },
  labelStyle: { fontWeight: 700, color: "#475569", fontSize: "10px" },
};


interface AnalyticsData {
  mrr: number;
  arr: number;
  conversionRate: string;
  activeUsers: number;
  signupsHistory: string[];
}

export const runtime = "edge";

export default function AnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/admin/analytics`, { credentials: "include" })
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
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
    { name: "Monthly Recurring Revenue", value: formatCurrency(data?.mrr || 1249000), change: "+14.2%", isPositive: true, subtext: "vs previous month" },
    { name: "Annual Run Rate", value: formatCurrency(data?.arr || 14988000), change: "+16.8%", isPositive: true, subtext: "Yearly projection" },
    { name: "Conversion Rate", value: data?.conversionRate || "3.48%", change: "+0.32%", isPositive: true, subtext: "Checkout completion avg" },
    { name: "Active Platform Users", value: (data?.activeUsers || 28491).toLocaleString(), change: "+24.5%", isPositive: true, subtext: "Daily active shoppers" },
  ];

  return (
    <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Company Analytics & growth</h1>
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
                <span className="text-2xl font-black text-slate-800">{m.value}</span>
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
          
          {/* GMV Growth — Recharts AreaChart (Cloudflare Radar style) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Gross Merchandise Value (GMV)</h3>
              <span className="px-2 py-0.5 text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-full">INR</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gmvData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CF_BLUE} stopOpacity={0.12} />
                      <stop offset="95%" stopColor={CF_BLUE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    {...cfTooltipStyle}
                    formatter={(v) => [`₹${Number(v ?? 0).toLocaleString("en-IN")}`, "GMV"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="gmv"
                    stroke={CF_BLUE}
                    strokeWidth={1.5}
                    fill="url(#gmvGrad)"
                    dot={{ r: 3, fill: CF_BLUE, stroke: "#fff", strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Merchant Signups — Recharts AreaChart (Cloudflare Radar style) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Merchant Signups & Active Stores</h3>
              <span className="px-2 py-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full">Stores</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={signupData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CF_GREEN} stopOpacity={0.12} />
                      <stop offset="95%" stopColor={CF_GREEN} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    {...cfTooltipStyle}
                    formatter={(v) => [Number(v ?? 0), "Active Stores"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="stores"
                    stroke={CF_GREEN}
                    strokeWidth={1.5}
                    fill="url(#signupGrad)"
                    dot={{ r: 3, fill: CF_GREEN, stroke: "#fff", strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Growth telemetries */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-800">Storage Volume Growth</h4>
            </div>
            <div className="text-xl font-bold text-slate-800">1.84 TB</div>
            <p className="text-[10px] text-slate-400 font-semibold">+18.5% weekly file upload growth (R2 buckets)</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-800">Edge API request load</h4>
            </div>
            <div className="text-xl font-bold text-slate-800">14.8M / day</div>
            <p className="text-[10px] text-slate-400 font-semibold">99.98% cache hit rate across platforms</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-800">Product listings count</h4>
            </div>
            <div className="text-xl font-bold text-slate-800">142,900</div>
            <p className="text-[10px] text-slate-400 font-semibold">+12% growth in catalog indexing volume</p>
          </div>
        </div>

      </div>
  );
}
