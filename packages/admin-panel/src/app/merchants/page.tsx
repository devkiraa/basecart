"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminLayout from "../../components/AdminLayout";
import {
  Search,
  Filter,
  AlertTriangle,
  Loader2,
  Lock,
  Unlock,
  Building2,
  ExternalLink,
  Copy,
  Plus,
} from "lucide-react";
import { isReservedSubdomain } from "@basecart/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const STOREFRONT_DOMAIN = (process.env.NEXT_PUBLIC_STOREFRONT_DOMAIN || "basecart.app").replace(/^(https?:\/\/)/, "");

interface Merchant {
  tenantId: string;
  storeName: string;
  subdomain: string;
  plan: "starter" | "growth" | "pro";
  status: "active" | "suspended";
  createdAt: string;
}

export default function MerchantsListPage() {
  const router = useRouter();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Manual merchant creation states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newSubdomain, setNewSubdomain] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPlan, setNewPlan] = useState<"starter" | "growth" | "pro">("starter");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const isSubdomainReserved = newSubdomain.trim() !== "" && isReservedSubdomain(newSubdomain);

  const handleCreateMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubdomainReserved) return;
    try {
      setCreating(true);
      setCreateError("");
      const res = await fetch(`${API_URL}/admin/merchants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: newStoreName,
          subdomain: newSubdomain,
          email: newEmail,
          password: newPassword,
          plan: newPlan,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create merchant");
      }

      // Reset and close
      setNewStoreName("");
      setNewSubdomain("");
      setNewEmail("");
      setNewPassword("");
      setNewPlan("starter");
      setShowCreateModal(false);
      
      // Reload list
      await loadMerchants();
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal / confirmation states
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    merchant: Merchant | null;
    targetStatus: "active" | "suspended";
  }>({
    show: false,
    merchant: null,
    targetStatus: "suspended",
  });

  const loadMerchants = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/merchants`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load merchants list.");
      const data = await res.json();
      setMerchants(data);
    } catch (err) {
      console.error(err);
      setError("Unable to retrieve merchant registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMerchants();
  }, []);

  const triggerStatusChange = (merchant: Merchant, targetStatus: "active" | "suspended", e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering row click detail navigation
    setConfirmModal({
      show: true,
      merchant,
      targetStatus,
    });
  };

  const handleConfirmStatusChange = async () => {
    const { merchant, targetStatus } = confirmModal;
    if (!merchant) return;

    try {
      const res = await fetch(`${API_URL}/admin/merchants/${merchant.tenantId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Status update request failed.");
      
      // Reload list
      await loadMerchants();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Error processing merchant status change.");
    } finally {
      setConfirmModal({ show: false, merchant: null, targetStatus: "suspended" });
    }
  };

  const filteredMerchants = merchants.filter((m) => {
    const matchesSearch =
      m.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tenantId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlan = planFilter === "all" || m.plan === planFilter;
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Merchant Stores</h1>
            <p className="text-sm text-slate-500 mt-1">
              Audit registration details, plan metrics, and control tenant suspension states.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Create Merchant
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-sm text-red-600 rounded-xl">
            {error}
          </div>
        )}

        {/* Filters / Search Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search store name or subdomain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex w-full md:w-auto gap-3 items-center">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </div>
            
            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Plans</option>
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="pro">Pro</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        {/* Table View */}
        <div className="hidden md:block bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Store details</th>
                  <th className="px-6 py-4">Subdomain</th>
                  <th className="px-6 py-4">Subscription Plan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-200 rounded w-28 animate-shimmer mb-1" />
                        <div className="h-3 bg-slate-200 rounded w-36 animate-shimmer" />
                      </td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20 animate-shimmer" /></td>
                      <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded w-16 animate-shimmer" /></td>
                      <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded w-16 animate-shimmer" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24 animate-shimmer" /></td>
                      <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-200 rounded w-20 ml-auto animate-shimmer" /></td>
                    </tr>
                  ))
                ) : filteredMerchants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                      <div className="flex flex-col items-center justify-center space-y-2 py-8">
                        <Search className="h-8 w-8 text-slate-300" />
                        <span className="font-semibold text-slate-700 text-sm">No matching stores</span>
                        <span className="text-xs text-slate-400">Try adjusting your filters or search keywords.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMerchants.map((m) => (
                    <tr
                      key={m.tenantId}
                      onClick={() => router.push(`/merchants/${m.tenantId}`)}
                      className="hover:bg-slate-50/60 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{m.storeName}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono" title={m.tenantId}>
                                ID: {m.tenantId.substring(0, 8)}...
                              </span>
                              <button
                                onClick={(e) => handleCopyId(e, m.tenantId)}
                                className="p-1 hover:text-indigo-600 rounded bg-slate-100/70 hover:bg-slate-200/80 transition-colors"
                                title="Copy full Tenant ID"
                              >
                                {copiedId === m.tenantId ? (
                                  <span className="text-[9px] text-emerald-600 font-bold px-1 py-0.5 bg-emerald-50 rounded">Copied!</span>
                                ) : (
                                  <Copy className="h-3 w-3 text-slate-400" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{m.subdomain}.{STOREFRONT_DOMAIN.replace(/:[0-9]+$/, "")}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                          m.plan === "pro"
                            ? "bg-purple-50 text-purple-700 border border-purple-100"
                            : m.plan === "growth"
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : "bg-slate-100 text-slate-600 border border-slate-200/55"
                        }`}>
                          {m.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          m.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-red-50 text-red-700 border border-red-100"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${m.status === "active" ? "bg-emerald-500" : "bg-red-500"}`} />
                          {m.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {m.status === "active" ? (
                          <button
                            onClick={(e) => triggerStatusChange(m, "suspended", e)}
                            className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={(e) => triggerStatusChange(m, "active", e)}
                            className="px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Merchants Cards - Mobile View */}
        <div className="md:hidden space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm space-y-3 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-28" />
                <div className="h-3 bg-slate-200 rounded w-36" />
              </div>
            ))
          ) : filteredMerchants.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs shadow-sm">
              No matching stores found.
            </div>
          ) : (
            filteredMerchants.map((m) => (
              <div
                key={m.tenantId}
                onClick={() => router.push(`/merchants/${m.tenantId}`)}
                className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm space-y-3 cursor-pointer hover:border-indigo-400 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-550 shrink-0">
                    <Building2 className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-slate-900 text-sm truncate">{m.storeName}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">ID: {m.tenantId}</p>
                    <p className="text-xs text-slate-500 font-mono mt-1 truncate">{m.subdomain}.{STOREFRONT_DOMAIN.replace(/:[0-9]+$/, "")}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 text-[10px]">
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider block">Plan</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase mt-1 tracking-wider ${
                      m.plan === "pro"
                        ? "bg-purple-50 text-purple-700 border border-purple-100"
                        : m.plan === "growth"
                        ? "bg-blue-50 text-blue-700 border border-blue-100"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      {m.plan}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider block">Status</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase mt-1 ${
                      m.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-red-50 text-red-700 border border-red-100"
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${m.status === "active" ? "bg-emerald-500" : "bg-red-500"}`} />
                      {m.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 font-bold uppercase tracking-wider block">Created</span>
                    <span className="text-slate-700 font-semibold mt-1 block">{new Date(m.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end" onClick={(e) => e.stopPropagation()}>
                  {m.status === "active" ? (
                    <button
                      onClick={(e) => triggerStatusChange(m, "suspended", e)}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Suspend
                    </button>
                  ) : (
                    <button
                      onClick={(e) => triggerStatusChange(m, "active", e)}
                      className="px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      Activate
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Confirmation Modal */}
        {confirmModal.show && confirmModal.merchant && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-md p-6 overflow-hidden">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${confirmModal.targetStatus === "suspended" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-lg">
                    Confirm Action: {confirmModal.targetStatus === "suspended" ? "Suspend Store" : "Reactivate Store"}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2">
                    Are you sure you want to change the status of{" "}
                    <span className="font-semibold text-slate-800">
                      {confirmModal.merchant.storeName}
                    </span>{" "}
                    to <span className="font-semibold">{confirmModal.targetStatus}</span>?
                  </p>
                  {confirmModal.targetStatus === "suspended" && (
                    <p className="text-xs text-red-500 font-medium bg-red-50 border border-red-100 rounded-lg p-2.5 mt-3">
                      Warning: Suspending this store will instantly block checkout pages and merchant dashboard access for this tenant.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setConfirmModal({ show: false, merchant: null, targetStatus: "suspended" })}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStatusChange}
                  className={`px-4 py-2 text-white rounded-lg text-sm font-semibold transition-colors ${
                    confirmModal.targetStatus === "suspended"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  Confirm Change
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Merchant Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-md p-6 overflow-hidden">
              <h3 className="font-bold text-slate-800 text-lg mb-4">Create New Merchant</h3>
              
              {createError && (
                <div className="p-3 bg-red-50 border border-red-100 text-xs text-red-600 rounded-lg mb-4">
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreateMerchant} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Store Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Nike Store"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Subdomain / Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubdomain}
                    onChange={(e) => setNewSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. nike"
                  />
                  {isSubdomainReserved && (
                    <span className="text-xs text-red-500 font-semibold mt-1 block">
                      This name is reserved by the platform.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Owner Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. owner@nike.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Subscription Plan
                  </label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="pro">Pro</option>
                  </select>
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateError("");
                      setNewStoreName("");
                      setNewSubdomain("");
                      setNewEmail("");
                      setNewPassword("");
                      setNewPlan("starter");
                    }}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || isSubdomainReserved}
                    className={`px-4 py-2 text-white rounded-lg text-sm font-semibold transition-colors ${
                      isSubdomainReserved
                        ? "bg-slate-300 cursor-not-allowed opacity-50"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {creating ? "Creating..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}
