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
} from "lucide-react";

const API_URL = "http://localhost:3001";

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
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
          <p className="text-slate-500 text-sm">Assembling platform performance metrics...</p>
        </div>
      </AdminLayout>
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
      description: "Active & suspended merchant shops",
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      name: "Estimated MRR",
      value: formatCurrency(metrics?.estimatedMRR || 0),
      description: "Based on active subscription tiers",
      icon: BadgeCent,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      name: "Total GMV Processed",
      value: formatCurrency(metrics?.totalGMV || 0),
      description: "All successful customer sales transactions",
      icon: TrendingUp,
      color: "text-violet-600 bg-violet-50",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Platform Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time multi-tenant health, subscriptions, and administrative audit streams.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-sm text-red-600 rounded-xl">
            {error}
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.name} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
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
                    log.action.includes("suspend") ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                  }`}>
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700">
                      <span className="font-semibold text-slate-900">{log.adminEmail}</span>{" "}
                      {log.action === "suspend_store" ? "suspended tenant store" : "activated tenant store"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tenant ID: <span className="font-mono">{log.targetTenantId}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
