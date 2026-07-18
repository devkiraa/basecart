"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Package, ShoppingBag, ExternalLink } from "lucide-react";

interface OrderData {
  orderId: string;
  amount: number;
  items: { name: string; quantity: number; price: number }[];
}

export default function OrderConfirmationPage() {
  const { tenant } = useParams<{ tenant: string }>();
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`basecart_order_${tenant}`);
    if (raw) {
      setOrder(JSON.parse(raw));
    } else {
      setOrder({
        orderId: `ORD-${Date.now().toString(36).toUpperCase()}`,
        amount: 0,
        items: [],
      });
    }
  }, [tenant]);

  return (
    <div className="max-w-lg mx-auto py-20 text-center space-y-8">
      {/* Success Animation */}
      <div className="relative">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto animate-fade-in">
          <CheckCircle2 size={48} className="text-emerald-500" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-28 h-28 border-2 border-emerald-200 rounded-full animate-ping opacity-20" />
        </div>
      </div>

      <div className="space-y-3 animate-fade-in">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Confirmed!</h1>
        <p className="text-sm text-slate-500 font-semibold">
          Thank you for shopping with us. Your order has been placed successfully.
        </p>
      </div>

      {/* Order Details Card */}
      {order && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5 text-left animate-fade-in">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-[var(--color-primary)]" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Order Details</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID</p>
              <p className="font-black text-slate-900">{order.orderId}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount Paid</p>
              <p className="font-black text-slate-900">₹{order.amount.toLocaleString("en-IN")}</p>
            </div>
          </div>

          {order.items.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Items</p>
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-slate-600 font-medium">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-bold text-slate-900">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-500 font-medium text-center">
            You will receive a confirmation email and tracking details shortly.
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in">
        <Link
          href="/catalog"
          className="inline-flex items-center justify-center gap-1.5 px-6 py-3 bg-[var(--color-primary)] text-white text-sm font-bold rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          <ShoppingBag size={15} /> Continue Shopping
        </Link>
        <Link
          href="/account"
          className="inline-flex items-center justify-center gap-1.5 px-6 py-3 bg-white text-slate-700 text-sm font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <ExternalLink size={15} /> Track Order
        </Link>
      </div>
    </div>
  );
}
