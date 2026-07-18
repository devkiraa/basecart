"use client";

export const runtime = "edge";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart } from "../../../lib/cart";
import { getOptimizedImageUrl } from "../../../lib/image";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, Tag, CreditCard } from "lucide-react";

export default function CartPage() {
  const { tenant } = useParams<{ tenant: string }>();
  const { items, loaded, removeItem, updateQuantity, subtotal, itemCount } = useCart(tenant);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "BASECART10") {
      setDiscount(Math.round(subtotal * 0.1));
    } else {
      setDiscount(0);
    }
  };

  const total = subtotal - discount;

  if (!loaded) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-100 rounded-lg animate-shimmer" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100 animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
        <ShoppingCart size={22} /> Shopping Cart
        {itemCount > 0 && (
          <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        )}
      </h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
          <ShoppingCart size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-lg font-bold text-slate-700 mb-2">Your cart is empty</h2>
          <p className="text-sm text-slate-400 font-medium mb-6">Add some products to get started!</p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[var(--color-primary)] text-white text-sm font-bold rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            <ArrowLeft size={14} /> Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variant}`}
                className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex gap-4"
              >
                <div className="h-20 w-20 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
                  <Image
                    src={getOptimizedImageUrl(item.image, "small")}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="object-contain max-h-16 w-auto"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{item.name}</h3>
                  {item.variant && (
                    <p className="text-xs text-slate-400 font-medium">{item.variant}</p>
                  )}
                  <p className="text-sm font-black text-slate-950">₹{item.price.toLocaleString("en-IN")}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.productId, item.variant)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="flex items-center gap-1 border border-slate-200 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.productId, item.variant, item.quantity - 1)}
                      className="p-1.5 hover:bg-slate-50 transition-colors rounded-l-lg"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-xs font-bold text-slate-900 w-7 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.variant, item.quantity + 1)}
                      className="p-1.5 hover:bg-slate-50 transition-colors rounded-r-lg"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5 sticky top-24">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">Order Summary</h2>

              {/* Coupon */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    className="px-3 py-2 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {discount > 0 && (
                  <p className="text-[10px] font-bold text-emerald-600">Coupon applied! You save ₹{discount.toLocaleString("en-IN")}</p>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between font-semibold text-slate-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between font-semibold text-emerald-600">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-slate-600">
                  <span>Shipping</span>
                  <span className="text-emerald-600">Free</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between font-black text-slate-950 text-base">
                  <span>Total</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-extrabold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <CreditCard size={15} /> Proceed to Checkout
              </Link>

              <Link
                href="/catalog"
                className="block text-center text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
