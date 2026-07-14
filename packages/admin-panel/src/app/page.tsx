"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import {
  Users,
  Briefcase,
  BadgeCent,
  ShieldCheck,
  TrendingUp,
  Loader2,
  Lock,
  Activity,
  AlertTriangle,
  Server,
  HeartPulse,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Metrics {
  totalMerchants: number;
  estimatedMRR: number;
  totalGMV: number;
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
          throw new Error("Failed to load metrics or audit log details");
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

  const kpis = [
    {
      name: "Total Stores",
      value: metrics?.totalMerchants || 0,
      description: "Active platform merchant tenants",
      icon: Users,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      name: "Estimated MRR",
      value: formatCurrency(metrics?.estimatedMRR || 0),
      description: "Monthly recurring platform revenue",
      icon: BadgeCent,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      name: "Total Platform GMV",
      value: formatCurrency(metrics?.totalGMV || 0),
      description: "All successful storefront sales",
      icon: TrendingUp,
      color: "text-violet-600 bg-violet-50",
    },
    {
      name: "System Status",
      value: "99.98%",
      description: "Normal edge network operation",
      icon: HeartPulse,
      color: "text-rose-600 bg-rose-50",
    },
  ];

  return (
    <div className="space-y-8">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Platform Command Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Platform operations monitoring dashboard, merchant registrations, billing, and system metrics.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-sm text-red-600 rounded-xl">
            {error}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.name} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {kpi.name}
                  </span>
                  <div className={`p-2.5 rounded-lg ${kpi.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-800">{kpi.value}</div>
                <p className="text-xs text-slate-500 mt-1">{kpi.description}</p>
              </div>
            );
          })}
        </div>

        {/* Middle row: Plan breakdown and system telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plan stats */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Subscription Plan Distribution
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-650 mb-1.5">
                  <span>Starter (₹999/mo)</span>
                  <span>70%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: "70%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-650 mb-1.5">
                  <span>Growth (₹4,999/mo)</span>
                  <span>20%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "20%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-650 mb-1.5">
                  <span>Enterprise Pro (₹9,999/mo)</span>
                  <span>10%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: "10%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry charts */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Edge Telemetry & Latency
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full">
                Live
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                  Worker CPU Time
                </label>
                <div className="text-lg font-bold text-slate-800">3.16 ms</div>
                <span className="text-[9px] text-slate-400 font-medium">Global Avg</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                  Queue Backlog
                </label>
                <div className="text-lg font-bold text-slate-800">0 jobs</div>
                <span className="text-[9px] text-emerald-500 font-semibold">Healthy</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                  D1 Read Queries
                </label>
                <div className="text-lg font-bold text-slate-800">2,491 / min</div>
                <span className="text-[9px] text-slate-400 font-medium">Partition Hits</span>
              </div>
            </div>

            <div className="h-20 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-center">
              <span className="text-xs font-semibold text-slate-400">
                Observability metrics logs streaming correctly.
              </span>
            </div>
          </div>
        </div>

        {/* Audit Logs Quick Feed */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">Recent Platform Operations</h2>
              <p className="text-xs text-slate-500 mt-0.5">Logs of recent administrative actions.</p>
            </div>
            <ShieldCheck className="w-5 h-5 text-slate-400" />
          </div>
          <div className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No recent administrative activity logged.
              </div>
            ) : (
              logs.slice(0, 5).map((log) => (
                <div key={log.logId} className="p-6 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className={`p-2 rounded-lg mt-0.5 ${
                    log.action.includes("suspend") 
                      ? "bg-red-50 text-red-650" 
                      : log.action.includes("plan") 
                        ? "bg-blue-50 text-blue-650" 
                        : "bg-emerald-50 text-emerald-650"
                  }`}>
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700">
                      <span className="font-semibold text-slate-900">{log.adminEmail}</span>{" "}
                      executed <span className="font-mono text-xs px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700">{log.action}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Target Tenant: <span className="font-mono">{log.targetTenantId}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
    </div>
  );
}
