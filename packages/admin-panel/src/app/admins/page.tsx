"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  Loader2,
  User,
  Shield,
  Clock,
  Plus,
  Key,
} from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface AdminProfile {
  email: string;
  userId: string;
  role: string;
  createdAt?: string;
}

export default function AdminsPage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [adminsList, setAdminsList] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true);
        
        // 1. Fetch currently logged in admin details
        const meRes = await fetch(`${API_URL}/admin/auth/me`, { credentials: "include" });
        if (!meRes.ok) throw new Error("Failed to load profile details.");
        const meData = await meRes.json();
        setProfile(meData);

        // 2. Fetch list of all registered super administrators
        const listRes = await fetch(`${API_URL}/admin/admins`, { credentials: "include" });
        if (!listRes.ok) throw new Error("Failed to load administrators registry.");
        const listData = await listRes.json();
        setAdminsList(listData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Unable to retrieve super administrator details.");
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, []);

  return (
    <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Super Administrators</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage platform administrative accounts, access logs, and operator profile configurations.
            </p>
          </div>
          <Link
            href="/signup"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all w-fit"
          >
            <Plus className="w-4 h-4" />
            Register Admin
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-sm text-red-600 rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
            <p className="text-slate-500 text-sm">Fetching administrators registry details...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Account Details Panel */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="font-bold text-slate-800 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    Account Profile
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Current operator session status and role authorizations.</p>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Email Address
                    </span>
                    <span className="text-sm font-medium text-slate-800">{profile?.email}</span>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Administrator ID
                    </span>
                    <span className="text-sm font-mono text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 block w-fit text-xs">
                      {profile?.userId}
                    </span>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Platform Role
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-bold border border-indigo-100 uppercase tracking-wide">
                      <Shield className="w-3.5 h-3.5" />
                      {profile?.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Advisory */}
              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-amber-800 text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Security Notice
                </h3>
                <p className="text-xs text-amber-700 mt-1.5 leading-relaxed">
                  Platform access credentials grant read-write modifications across all tenant databases and billing profiles. 
                  Always use secure multi-factor authentication configurations in production.
                </p>
              </div>
            </div>

            {/* Administrators Registry Table */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-indigo-600" />
                      Administrator Directory
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Authorized platform operators registered in central registry.</p>
                  </div>
                  <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 font-mono">
                    COUNT: {adminsList.length}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-6 py-4">Administrator Email</th>
                        <th className="px-6 py-4">User ID</th>
                        <th className="px-6 py-4">Status / Role</th>
                        <th className="px-6 py-4">Registered Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        Array.from({ length: 3 }).map((_, idx) => (
                          <tr key={idx} className="animate-pulse">
                            <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-44" /></td>
                            <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-52" /></td>
                            <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded w-20" /></td>
                            <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                          </tr>
                        ))
                      ) : adminsList.length > 0 ? (
                        adminsList.map((adminItem) => (
                          <tr key={adminItem.userId} className="hover:bg-slate-50/40 transition-colors">
                            <td className="px-6 py-4 font-semibold text-slate-800">{adminItem.email}</td>
                            <td className="px-6 py-4 font-mono text-xs text-slate-500 font-bold">{adminItem.userId}</td>
                            <td className="px-6 py-4">
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-100 mr-2 uppercase tracking-wide">
                                Active
                              </span>
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold border border-slate-200 uppercase tracking-wide">
                                {adminItem.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-xs flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {adminItem.createdAt ? new Date(adminItem.createdAt).toLocaleDateString() : "Bootstrap"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                            No administrative accounts registered in registry.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
  );
}
