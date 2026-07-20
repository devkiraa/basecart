"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, Lock, Unlock, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface AdminUser {
  email: string;
  userId: string;
  role: string;
  createdAt: string;
}

export default function SecurityPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAdmins() {
      try {
        const res = await fetch(`${API_URL}/admin/admins`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load super admins list");
        const data = await res.json();
        setAdmins(data);
      } catch (err) {
        console.error(err);
        setError("Unable to retrieve security logs registry.");
      } finally {
        setLoading(false);
      }
    }
    loadAdmins();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Security Command Center</h1>
        <p className="text-sm text-slate-500 mt-1">
          Audit super admin sessions, failed login warnings, IP blocking registries, and RBAC logs.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-sm text-red-650 rounded-xl">
          {error}
        </div>
      )}

      {/* Global Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Administrative Sessions
            </span>
            <div className="text-2xl font-extrabold text-slate-800">
              {loading ? (
                <div className="h-8 bg-slate-200 rounded w-20 animate-pulse" />
              ) : (
                `${admins.length} active`
              )}
            </div>
          </div>
          <ShieldCheck className="w-8 h-8 text-indigo-500 bg-indigo-50 p-1.5 rounded-lg" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Rate Limit Status
            </span>
            <div className="text-2xl font-extrabold text-slate-800">Active</div>
          </div>
          <Lock className="w-8 h-8 text-emerald-500 bg-emerald-50 p-1.5 rounded-lg" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Suspicious IP Blocks
            </span>
            <div className="text-2xl font-extrabold text-slate-800">0 blocks</div>
          </div>
          <Unlock className="w-8 h-8 text-slate-500 bg-slate-50 p-1.5 rounded-lg" />
        </div>
      </div>

      {/* Admin Team Members Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-800">Platform Security Operators</h3>
          <p className="text-xs text-slate-500 mt-0.5">Admin users authorized to view logs and control tenants.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Operator Email</th>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">Authorized Role</th>
                <th className="px-6 py-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 2 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-44" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-52" /></td>
                    <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded w-16" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                  </tr>
                ))
              ) : (
                admins.map((adm) => (
                  <tr key={adm.userId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{adm.email}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{adm.userId}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider bg-indigo-50 text-indigo-700 border-indigo-100">
                        {adm.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(adm.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
