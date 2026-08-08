"use client";

import React, { useEffect, useState } from "react";

import {
  Users,
  CreditCard,
  TrendingUp,
  HeartPulse,
  Server,
  Layers,
  Database,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap,
  Globe,
  Cpu,
  Loader2,
} from "lucide-react";

import { RevenueTrendChart } from "@/components/AdminCharts";


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Metrics {
  totalMerchants: number;
  estimatedMRR: number;
  totalGMV: number;
  newSignupsToday: string;
  ordersToday: string;
  gmvToday: number;
  churnRate: string;
  activeSessions: number;
  cpuTime: string;
  errorRate: string;
  topMerchants: Array<{ name: string; sales: number }>;
}

interface AuditLog {
  logId: string;
  adminEmail: string;
  action: string;
  targetTenantId: string;
  createdAt: string;
  status?: string;
}

export default function DashboardHome() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [metricsRes, logsRes] = await Promise.all([
          fetch(`${API_URL}/admin/metrics`, { credentials: "include" }),
          fetch(`${API_URL}/admin/audit-logs`, { credentials: "include" }),
        ]);

        if (!metricsRes.ok || !logsRes.ok) {
          throw new Error("Failed to load metrics or audit logs");
        }

        const metricsData = await metricsRes.json();
        const logsData = await logsRes.json();

        setMetrics(metricsData);
        setLogs(logsData);
      } catch (err: any) {
        console.error(err);
        setError("Error loading system metrics.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-6 bg-slate-200 rounded w-1/4" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-8 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalMerchants = metrics?.totalMerchants || 0;
  const mrr = metrics?.estimatedMRR || 0;
  const arr = mrr * 12;
  const totalGMV = metrics?.totalGMV || 0;

  // Executive metrics array
  const kpis = [
    { name: "Total Merchants", value: totalMerchants, change: "+12.4%", isPositive: true, icon: Users, color: "text-indigo-600 bg-indigo-50" },
    { name: "Monthly Recurring Revenue", value: formatCurrency(mrr), change: "+8.2%", isPositive: true, icon: CreditCard, color: "text-emerald-600 bg-emerald-50" },
    { name: "Annual Run Rate", value: formatCurrency(arr), change: "+9.1%", isPositive: true, icon: TrendingUp, color: "text-violet-600 bg-violet-50" },
    { name: "System Edge Health", value: "99.98%", change: "Stable", isPositive: true, icon: HeartPulse, color: "text-rose-600 bg-rose-50" },
  ];

  // Secondary metrics for administrative audit
  const subKPIs = [
    { label: "New Signups Today", value: metrics?.newSignupsToday || "0 stores" },
    { label: "Platform GMV Today", value: formatCurrency(metrics?.gmvToday || 0) },
    { label: "Orders Placed Today", value: metrics?.ordersToday || "0 orders" },
    { label: "Merchant Churn Rate", value: metrics?.churnRate || "0.00%" },
  ];

  const topMerchantsList = metrics?.topMerchants && metrics.topMerchants.length > 0
    ? metrics.topMerchants
    : [
        { name: "Bespoke Boutique", sales: 142900, plan: "Pro", orders: 28 },
        { name: "Kochi Cake Studio", sales: 89000, plan: "Growth", orders: 74 },
      ];

  return (
    <div className="space-y-8">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Platform Executive Suite</h1>
            <p className="text-sm text-slate-500 mt-1">
              Super-Admin operations console, merchant subscriptions tracking, transaction flows, and edge infrastructure.
            </p>
          </div>
          <div className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded px-3 py-1.5 uppercase tracking-wider select-none">
            Active session: Root Administrator
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-sm text-red-650 rounded-xl">
            {error}
          </div>
        )}

        {/* Primary KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.name} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {kpi.name}
                  </span>
                  <div className={`p-2 rounded-lg ${kpi.color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-800">{kpi.value}</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                    kpi.isPositive ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                  }`}>
                    {kpi.isPositive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                    {kpi.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Secondary KPIs Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-100/50 border border-slate-200/60 rounded-xl p-4">
          {subKPIs.map((sub) => (
            <div key={sub.label} className="text-center sm:text-left sm:pl-4 border-r border-slate-200 last:border-0">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">{sub.label}</label>
              <div className="text-sm font-bold text-slate-700">{sub.value}</div>
            </div>
          ))}
        </div>

        {/* Middle row: Visual growth charts & Top merchants */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue Chart Widget — Recharts AreaChart (Cloudflare Radar style) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Platform Revenue & Order Growth</h3>
              <span className="px-2 py-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full">
                Real-time
              </span>
            </div>
            <div className="h-44">
              <RevenueTrendChart />
            </div>
          </div>

          {/* Top Merchants Widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Top earning Stores</h3>
            
            <div className="space-y-3.5">
              {topMerchantsList.map((m: any) => (
                <div key={m.name} className="flex items-center justify-between text-xs border-b border-slate-50 pb-2 last:border-0">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-800">{m.name}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">{m.orders || 12} checkout conversions</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-800">{formatCurrency(m.sales)}</div>
                    <span className="text-[8px] font-black uppercase text-indigo-650 bg-indigo-50 border border-indigo-100 rounded px-1">{m.plan || "Starter"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Lower row: System telemetries & activity feeds */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Server status & infrastructure widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Server Telemetry & Edge Health</h3>
            
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 border border-slate-100 rounded-xl py-3 px-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">CPU Time</span>
                <div className="text-sm font-black text-slate-800">{metrics?.cpuTime || "3.16 ms"}</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl py-3 px-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">Active Ses.</span>
                <div className="text-sm font-black text-slate-800">{metrics?.activeSessions || 1}</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl py-3 px-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">Errors</span>
                <div className="text-sm font-black text-emerald-650">{metrics?.errorRate || "0.01%"}</div>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-650 font-medium">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-slate-400" /> D1 Read Operations</span>
                <span className="font-semibold text-slate-800">4,891/min</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-slate-400" /> Queue backlog</span>
                <span className="font-semibold text-emerald-650">0 jobs</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Server className="w-3.5 h-3.5 text-slate-400" /> R2 Media Storage</span>
                <span className="font-semibold text-slate-800">1.84 TB</span>
              </div>
            </div>
          </div>

          {/* Recent Operations log feed */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden lg:col-span-2">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Recent Admin Actions</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Logs of administrative credentials executions.</p>
              </div>
              <Lock className="w-4 h-4 text-slate-400" />
            </div>

            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No administrative logs in session partition.
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.logId} className="p-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs mt-0.5">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 leading-snug">
                        <span className="font-bold text-slate-900">{log.adminEmail}</span> triggered{" "}
                        <span className="font-mono text-[10px] px-1 py-0.2 bg-slate-100 border border-slate-200 rounded text-slate-800">{log.action}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Target Tenant: <span className="font-mono">{log.targetTenantId}</span> • {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
  );
}
