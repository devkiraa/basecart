"use client";

import React, { useState, useEffect } from "react";
import { 
  ShoppingCart, 
  TrendingUp, 
  RefreshCcw, 
  AlertTriangle, 
  ShieldX,
  Search,
  Filter
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Order {
  id: string;
  merchant: string;
  date: string;
  customer: string;
  amount: number;
  status: string;
  gateway: string;
  country: string;
  state: string;
}

export default function OrdersOverview() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMerchant, setFilterMerchant] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterGateway, setFilterGateway] = useState("");
  const [filterState, setFilterState] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/admin/orders`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load orders:", err);
        setLoading(false);
      });
  }, []);

  const filteredOrders = orders.filter((order) => {
    return (
      (filterMerchant === "" || order.merchant.toLowerCase().includes(filterMerchant.toLowerCase())) &&
      (filterStatus === "" || order.status === filterStatus) &&
      (filterGateway === "" || order.gateway.includes(filterGateway)) &&
      (filterState === "" || order.state === filterState)
    );
  });

  // Calculate platform financial summary
  const gmv = filteredOrders.reduce((acc, curr) => curr.status === "completed" ? acc + curr.amount : acc, 0);
  const refunds = filteredOrders.reduce((acc, curr) => curr.status === "refunded" ? acc + curr.amount : acc, 0);
  const failed = filteredOrders.reduce((acc, curr) => curr.status === "failed" ? acc + curr.amount : acc, 0);
  const chargebacks = filteredOrders.reduce((acc, curr) => curr.status === "chargeback" ? acc + curr.amount : acc, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const metrics = [
    { name: "Gross Merchandise Value", value: formatCurrency(gmv), icon: TrendingUp, color: "bg-emerald-50 text-emerald-700" },
    { name: "Refunds Issued", value: formatCurrency(refunds), icon: RefreshCcw, color: "bg-blue-50 text-blue-700" },
    { name: "Failed Transactions", value: formatCurrency(failed), icon: AlertTriangle, color: "bg-amber-50 text-amber-700" },
    { name: "Chargeback Volume", value: formatCurrency(chargebacks), icon: ShieldX, color: "bg-rose-50 text-rose-700" },
  ];

  return (
    <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Platform Orders Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor transaction streams, search merchant operations, track gateway status, and manage platform chargebacks.
          </p>
        </div>

        {/* Financial KPI metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.name} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{m.name}</span>
                  <div className={`p-2 rounded-lg ${m.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-800">{m.value}</div>
              </div>
            );
          })}
        </div>

        {/* Filter controls */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wide">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Filter Criteria</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Merchant</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                <input
                  type="text"
                  placeholder="Search store name..."
                  value={filterMerchant}
                  onChange={(e) => setFilterMerchant(e.target.value)}
                  className="pl-8 w-full border border-slate-200 rounded-lg py-2 text-xs focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 bg-slate-50/50"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
                <option value="chargeback">Chargeback</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Payment Gateway</label>
              <select
                value={filterGateway}
                onChange={(e) => setFilterGateway(e.target.value)}
                className="w-full border border-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 bg-slate-50/50"
              >
                <option value="">All Gateways</option>
                <option value="UPI">Razorpay (UPI)</option>
                <option value="Cards">Razorpay (Cards)</option>
                <option value="NetBanking">Razorpay (NetBanking)</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">State Served</label>
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="w-full border border-slate-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 bg-slate-50/50"
              >
                <option value="">All Regions</option>
                <option value="Kerala">Kerala</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Maharashtra">Maharashtra</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Order Logs</h2>
            <span className="text-xs font-semibold text-slate-400">Showing {filteredOrders.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">Merchant Store</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Total Amount</th>
                  <th className="py-3 px-6">Gateway</th>
                  <th className="py-3 px-6">State</th>
                  <th className="py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 px-6 text-center text-slate-400">No orders match the selected filters.</td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-indigo-600">{order.id}</td>
                      <td className="py-4 px-6 font-semibold text-slate-800">{order.merchant}</td>
                      <td className="py-4 px-6">{order.date}</td>
                      <td className="py-4 px-6">{order.customer}</td>
                      <td className="py-4 px-6 font-bold">{formatCurrency(order.amount)}</td>
                      <td className="py-4 px-6 font-semibold text-slate-500">{order.gateway}</td>
                      <td className="py-4 px-6">{order.state}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          order.status === "completed" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : order.status === "refunded"
                              ? "bg-blue-50 text-blue-700 border border-blue-100"
                              : order.status === "failed"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}>
                          {order.status}
                        </span>
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
