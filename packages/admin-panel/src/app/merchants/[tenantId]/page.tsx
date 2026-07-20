"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Lock,
  Unlock,
  AlertTriangle,
  Loader2,
  Package,
  ShoppingCart,
  BadgeCent,
  ExternalLink,
  KeyRound,
  Trash2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const STOREFRONT_DOMAIN = (process.env.NEXT_PUBLIC_STOREFRONT_DOMAIN || "basecart.app").replace(/^(https?:\/\/)/, "");

export const runtime = "edge";

interface StoreDetails {
  store: {
    storeName: string;
    subdomain: string;
    plan: "starter" | "growth" | "pro";
    status: "active" | "suspended";
    gstin?: string;
    registeredBusinessName?: string;
    registeredBusinessAddress?: string;
    registeredState?: string;
    addOns?: string[];
  };
  products: any[];
  orders: any[];
  statements?: any[];
}

export default function MerchantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenantId as string;

  const [details, setDetails] = useState<StoreDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [confirmModal, setConfirmModal] = useState(false);
  
  // Advanced actions state
  const [impersonating, setImpersonating] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const loadDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/merchants/${tenantId}/details`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load merchant details.");
      const data = await res.json();
      setDetails(data);
    } catch (err) {
      console.error(err);
      setError("Unable to retrieve detailed store records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) loadDetails();
  }, [tenantId]);

  const handleStatusChange = async (targetStatus: "active" | "suspended") => {
    try {
      const res = await fetch(`${API_URL}/admin/merchants/${tenantId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Status update failed.");
      setConfirmModal(false);
      await loadDetails();
    } catch (err) {
      console.error(err);
      alert("Error updating tenant status.");
    }
  };

  const handlePlanChange = async (newPlan: "starter" | "growth" | "pro") => {
    try {
      const res = await fetch(`${API_URL}/admin/merchants/${tenantId}/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Plan update failed");
      await loadDetails();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleImpersonation = async () => {
    try {
      setImpersonating(true);
      const res = await fetch(`${API_URL}/admin/merchants/${tenantId}/impersonate`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Impersonation request failed");
      const data = await res.json();
      window.open(data.impersonateUrl, "_blank");
    } catch (err) {
      console.error(err);
      alert("Error starting merchant impersonation session.");
    } finally {
      setImpersonating(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword) return alert("Password cannot be blank");
    try {
      const res = await fetch(`${API_URL}/admin/merchants/${tenantId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Password reset failed");
      alert("Store owner password has been reset successfully.");
      setShowResetModal(false);
      setNewPassword("");
    } catch (err) {
      console.error(err);
      alert("Error resetting password.");
    }
  };

  const handleDeleteStore = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/merchants/${tenantId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Delete store request failed");
      alert("Store and owner records deleted successfully.");
      router.push("/merchants");
    } catch (err) {
      console.error(err);
      alert("Error deleting store registry.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
        <p className="text-slate-500 text-sm font-semibold">Querying tenant details from database partitions...</p>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </button>
        <div className="p-4 bg-red-50 border border-red-100 text-sm text-red-650 rounded-xl">
          {error || "Merchant detail records could not be resolved."}
        </div>
      </div>
    );
  }

  const { store, products, orders } = details;
  const statusColors =
    store.status === "active"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
      : "bg-red-50 text-red-700 border border-red-100";

  return (
    <div className="space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <button
            onClick={() => router.push("/merchants")}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to merchants
          </button>

          {/* Action button panel */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handleImpersonation}
              disabled={impersonating}
              className="px-3.5 py-2 bg-indigo-50 border border-indigo-250 text-indigo-700 hover:bg-indigo-100/70 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              {impersonating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              Login as Merchant
            </button>

            <button
              onClick={() => setShowResetModal(true)}
              className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              <KeyRound className="w-4 h-4 text-slate-400" />
              Reset Password
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-3.5 py-2 bg-white border border-red-200 text-red-650 hover:bg-red-50/50 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              Delete Store
            </button>

            {store.status === "active" ? (
              <button
                onClick={() => setConfirmModal(true)}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Lock className="w-4 h-4" />
                Suspend Store
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange("active")}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Unlock className="w-4 h-4" />
                Reactivate Store
              </button>
            )}
          </div>
        </div>

        {/* Info panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800">{store.storeName}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors}`}>
                  {store.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Subdomain: <span className="font-semibold text-slate-700">{store.subdomain}.{STOREFRONT_DOMAIN.replace(/:[0-9]+$/, "")}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-5 py-2.5 text-center flex flex-col justify-center min-w-[130px]">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Plan Tier</label>
              <select
                value={store.plan}
                onChange={(e) => handlePlanChange(e.target.value as any)}
                className="bg-transparent text-sm font-bold text-slate-800 uppercase focus:outline-none cursor-pointer border-b border-dashed border-slate-300 text-center"
              >
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="pro">Pro</option>
              </select>
            </div>
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-5 py-3 text-center">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sales</p>
              <p className="text-base font-bold text-slate-800 mt-0.5">{orders.length} orders</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Metadata & Add-ons */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
                Store Metadata
              </h2>
              <div className="space-y-3.5 text-sm">
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    GSTIN Registration
                  </span>
                  <span className="font-mono text-slate-700">{store.gstin || "Not Configured"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Legal Name
                  </span>
                  <span className="text-slate-700">{store.registeredBusinessName || "Not Configured"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Address
                  </span>
                  <span className="text-slate-700 text-xs leading-relaxed">
                    {store.registeredBusinessAddress || "Not Configured"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    State
                  </span>
                  <span className="text-slate-700">{store.registeredState || "Not Configured"}</span>
                </div>
              </div>
            </div>

            {/* Add-ons list */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
                Enabled Add-Ons
              </h2>
              <div className="space-y-2">
                {!store.addOns || store.addOns.length === 0 ? (
                  <p className="text-sm text-slate-500">No paid add-on features active for this store.</p>
                ) : (
                  store.addOns.map((addon) => (
                    <div
                      key={addon}
                      className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/50 border border-blue-100 text-blue-700 text-xs font-semibold capitalize"
                    >
                      <BadgeCent className="w-4 h-4" />
                      {addon.replace("_", " ")}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Read-Only Products & Orders */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Orders List */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800">Recent Customer Orders</h2>
                <ShoppingCart className="w-5 h-5 text-slate-400" />
              </div>
              <div className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">No orders placed.</div>
                ) : (
                  orders.slice(0, 5).map((order: any) => (
                    <div key={order.orderId} className="p-6 flex justify-between items-center text-sm">
                      <div>
                        <div className="font-semibold text-slate-800">
                          {order.customerInfo?.name || "Customer"}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          ID: <span className="font-mono">{order.orderId.substring(0, 8)}...</span> |{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-900">
                          {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                          }).format(order.total)}
                        </div>
                        <div className="text-xs text-slate-500 capitalize mt-0.5">{order.status}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Products List */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800">Catalog Inventory</h2>
                <Package className="w-5 h-5 text-slate-400" />
              </div>
              <div className="divide-y divide-slate-100">
                {products.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">No items in product catalog.</div>
                ) : (
                  products.slice(0, 5).map((p: any) => (
                    <div key={p.productId} className="p-6 flex justify-between items-center text-sm">
                      <div>
                        <div className="font-semibold text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Stock: {p.stockQuantity} remaining
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-900">
                          {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                          }).format(p.price)}
                        </div>
                        <div className="text-xs text-slate-500 capitalize mt-0.5">{p.status}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Merchant Invoices & Statements */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-8 animate-fade-in">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-base font-bold text-slate-800">Paid Invoices & Billing Statements</h2>
              </div>
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                  <thead className="bg-slate-50 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Billing Period</th>
                      <th className="px-6 py-4">Invoice ID</th>
                      <th className="px-6 py-4">Paid Date</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Active Plan / Add-ons</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {details.statements && details.statements.length > 0 ? (
                      details.statements.map((stmt: any) => (
                        <tr key={stmt.invoiceId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-800">{stmt.billingPeriod}</td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">{stmt.invoiceId}</td>
                          <td className="px-6 py-4 text-slate-500">{stmt.date}</td>
                          <td className="px-6 py-4 font-bold text-slate-900 font-mono">₹{stmt.amount}</td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold border border-slate-200 mr-2 uppercase tracking-wide">
                              {stmt.plan}
                            </span>
                            {stmt.addOns && stmt.addOns.length > 0 && (
                              stmt.addOns.map((a: string) => (
                                <span key={a} className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold border border-blue-100 mr-1 uppercase tracking-wide">
                                  {a}
                                </span>
                              ))
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <a
                              href={`${API_URL}/store/billing/statement/${stmt.invoiceId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
                            >
                              Download PDF
                            </a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                          No billing history statements tracked for this store.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Invoices Mobile Cards View */}
              <div className="md:hidden p-6 divide-y divide-slate-100 bg-white">
                {details.statements && details.statements.length > 0 ? (
                  details.statements.map((stmt: any) => (
                    <div key={stmt.invoiceId} className="py-4 first:pt-0 last:pb-0 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-semibold text-slate-800 text-sm block">{stmt.billingPeriod}</span>
                          <span className="font-mono text-[10px] text-slate-500 mt-0.5 block">{stmt.invoiceId}</span>
                        </div>
                        <span className="font-extrabold text-slate-900 text-sm font-mono">₹{stmt.amount}</span>
                      </div>

                      <div className="flex justify-between items-center text-[10px]">
                        <div>
                          <span className="text-slate-400 font-bold uppercase tracking-wider block">Paid Date</span>
                          <span className="text-slate-700 font-semibold mt-0.5 block">{stmt.date}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold uppercase tracking-wider block">Plan & Add-ons</span>
                          <div className="flex flex-wrap gap-1 mt-0.5 justify-end">
                            <span className="text-[8px] bg-slate-100 text-slate-650 px-1.5 py-0.5 rounded font-bold border border-slate-200 uppercase tracking-wide">
                              {stmt.plan}
                            </span>
                            {stmt.addOns && stmt.addOns.length > 0 && (
                              stmt.addOns.map((a: string) => (
                                <span key={a} className="text-[8px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold border border-blue-100 uppercase tracking-wide">
                                  {a}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <a
                          href={`${API_URL}/store/billing/statement/${stmt.invoiceId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold py-1.5 px-3 border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
                        >
                          Download PDF
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-400 text-xs py-4">
                    No billing history statements tracked for this store.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {confirmModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-md p-6 overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-lg">Confirm Action: Suspend Store</h3>
                  <p className="text-sm text-slate-500 mt-2">
                    Are you sure you want to suspend{" "}
                    <span className="font-semibold text-slate-800">{store.storeName}</span>?
                  </p>
                  <p className="text-xs text-red-500 font-medium bg-red-50 border border-red-100 rounded-lg p-2.5 mt-3">
                    Warning: This action will instantly disable both storefront checkouts and dashboard admin panel access for this merchant.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setConfirmModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusChange("suspended")}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Suspend Store
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {showResetModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-md p-6 overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-650 rounded-lg">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-lg">Reset Store Owner Password</h3>
                  <p className="text-sm text-slate-500 mt-2">
                    Enter the new password for the administrator/owner of <span className="font-semibold text-slate-800">{store.storeName}</span>.
                  </p>
                  
                  <div className="mt-4">
                    <input
                      type="password"
                      placeholder="Enter new secure password..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    setNewPassword("");
                  }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordReset}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Store Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-md p-6 overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 text-red-650 rounded-lg">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-lg">Confirm Action: Delete Store</h3>
                  <p className="text-sm text-slate-500 mt-2">
                    Are you absolutely sure you want to permanently delete <span className="font-semibold text-slate-800">{store.storeName}</span>?
                  </p>
                  <p className="text-xs text-red-500 font-medium bg-red-50 border border-red-100 rounded-lg p-2.5 mt-3">
                    Warning: This is destructive. This will permanently delete the tenant registry record and delete access.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteStore}
                  className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
