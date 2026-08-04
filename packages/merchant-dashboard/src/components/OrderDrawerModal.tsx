"use client";

import React from "react";
import { X, Package, Truck, User, Mail, Phone, MapPin, Calendar, Clock, CreditCard } from "lucide-react";

export interface OrderDetail {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: any;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  items?: Array<{
    name: string;
    price: number;
    quantity: number;
    variant?: string;
  }>;
}

interface OrderDrawerProps {
  order: OrderDetail | null;
  onClose: () => void;
}

export default function OrderDrawerModal({ order, onClose }: OrderDrawerProps) {
  if (!order) return null;

  const items = order.items && order.items.length > 0 ? order.items : [
    { name: "Sample Item Standard", price: order.total, quantity: 1, variant: "Default" }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto flex flex-col justify-between p-6 space-y-6 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="space-y-4 border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="text-blue-600" size={20} />
              <h2 className="text-lg font-black text-slate-900">Order #{order.orderId.substring(0, 8)}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
              order.status === "fulfilled" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}>
              {order.status}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 flex items-center gap-1">
              <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Main Details Body */}
        <div className="space-y-6 flex-1">
          
          {/* Customer Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Customer Details</div>
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <User size={13} className="text-slate-400" /> {order.customerName}
            </div>
            <div className="flex items-center gap-2 font-semibold text-slate-600">
              <Mail size={13} className="text-slate-400" /> {order.customerEmail}
            </div>
            {order.customerPhone && (
              <div className="flex items-center gap-2 font-semibold text-slate-600">
                <Phone size={13} className="text-slate-400" /> {order.customerPhone}
              </div>
            )}
          </div>

          {/* Line Items Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Order Line Items</h3>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
              {items.map((item, idx) => (
                <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{item.name}</div>
                    {item.variant && <div className="text-[10px] text-slate-400">Variant: {item.variant}</div>}
                    <div className="text-[10px] text-slate-500">Qty: {item.quantity} × ₹{item.price}</div>
                  </div>
                  <div className="font-black text-slate-950">₹{item.price * item.quantity}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Shipping Summary */}
          <div className="border border-slate-100 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between font-semibold text-slate-600">
              <span>Payment Method</span>
              <span className="font-bold text-slate-900 uppercase">Razorpay UPI</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-600">
              <span>Payment Status</span>
              <span className="font-bold text-emerald-600 uppercase">{order.paymentStatus || "Paid"}</span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between font-black text-slate-950 text-sm">
              <span>Total Amount</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            Close Drawer
          </button>
        </div>

      </div>
    </div>
  );
}
