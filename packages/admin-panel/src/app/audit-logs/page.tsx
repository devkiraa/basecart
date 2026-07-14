"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import {
  FileSpreadsheet,
  Search,
  Filter,
  Loader2,
  Calendar,
  ShieldCheck,
  Building,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface AuditLog {
  logId: string;
  adminEmail: string;
  action: string;
  targetTenantId: string;
  status: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [adminQuery, setAdminQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [targetQuery, setTargetQuery] = useState("");

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/admin/audit-logs`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load audit logs.");
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error(err);
        setError("Unable to retrieve administrative audit trails.");
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesAdmin = log.adminEmail.toLowerCase().includes(adminQuery.toLowerCase());
    const matchesTarget = log.targetTenantId.toLowerCase().includes(targetQuery.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;

    return matchesAdmin && matchesTarget && matchesAction;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Administrative Audit Trail</h1>
          <p className="text-sm text-slate-500 mt-1">
            Read-only chronological ledger of all operator activities and status adjustments.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-sm text-red-600 rounded-xl">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Filter by Admin Email
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search admin user..."
                value={adminQuery}
                onChange={(e) => setAdminQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Filter by Action Type
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Operations</option>
              <option value="suspend_store">Suspend Store</option>
              <option value="activate_store">Activate Store</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Filter by Target Tenant ID
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Enter tenant UUID..."
                value={targetQuery}
                onChange={(e) => setTargetQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Administrator</th>
                  <th className="px-6 py-4">Action Taken</th>
                  <th className="px-6 py-4">Affected Tenant ID</th>
                  <th className="px-6 py-4">Recorded Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-28 animate-shimmer" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-36 animate-shimmer" /></td>
                      <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded w-16 animate-shimmer" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24 animate-shimmer" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-10 animate-shimmer" /></td>
                    </tr>
                  ))
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                      <div className="flex flex-col items-center justify-center space-y-2 py-8">
                        <Search className="h-8 w-8 text-slate-300" />
                        <span className="font-semibold text-slate-700 text-sm">No matching logs</span>
                        <span className="text-xs text-slate-400">Try adjusting your filters or search query.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.logId} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{log.adminEmail}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          log.action === "suspend_store"
                            ? "bg-red-50 text-red-700 border-red-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}>
                          {log.action.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">{log.targetTenantId}</td>
                      <td className="px-6 py-4 capitalize font-medium text-xs">{log.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
