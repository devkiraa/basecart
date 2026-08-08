"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CF_BLUE = "#2563EB";
const CF_GREEN = "#10B981";
const GRID_COLOR = "#f1f5f9";

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

// ─── Revenue Trend Chart (Dashboard) ───────────────────────────────────────
const revenueTrendData = [
  { month: "May", mrr: 580000 },
  { month: "Jun", mrr: 710000 },
  { month: "Jul", mrr: 924000 },
  { month: "Aug (now)", mrr: 1249000 },
];

export function RevenueTrendChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={revenueTrendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CF_BLUE} stopOpacity={0.1} />
            <stop offset="95%" stopColor={CF_BLUE} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
        />
        <Tooltip
          {...cfTooltipStyle}
          formatter={(v) => [`₹${Number(v ?? 0).toLocaleString("en-IN")}`, "MRR"]}
        />
        <Area
          type="monotone"
          dataKey="mrr"
          stroke={CF_BLUE}
          strokeWidth={1.5}
          fill="url(#revenueGrad)"
          dot={{ r: 3, fill: CF_BLUE, stroke: "#fff", strokeWidth: 2 }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── GMV Growth Chart (Analytics) ──────────────────────────────────────────
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

export function GmvChart() {
  return (
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
  );
}

// ─── Merchant Signups Chart (Analytics) ────────────────────────────────────
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

export function MerchantSignupsChart() {
  return (
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
  );
}
