"use client";

import React, { useState } from "react";
import { ToastContainer, ToastMessage } from "./Toast";

interface Variant {
  id: string;
  name: string;
  priceModifier?: number;
  stock?: number;
}

interface ProductInteractiveProps {
  product: {
    id: string;
    name: string;
    price: number;
    inStock: boolean;
    stockCount?: number;
    variants?: Variant[];
  };
}

export function ProductInteractiveSection({ product }: ProductInteractiveProps) {
  const defaultVariants: Variant[] = product.variants && product.variants.length > 0
    ? product.variants
    : [
        { id: "v1", name: "Standard", priceModifier: 0, stock: product.stockCount ?? 15 },
        { id: "v2", name: "Pro / Deluxe (+₹499)", priceModifier: 499, stock: 5 },
        { id: "v3", name: "Bundle Pack (+₹999)", priceModifier: 999, stock: 0 },
      ];

  const [selectedVariant, setSelectedVariant] = useState<Variant>(defaultVariants[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const currentPrice = product.price + (selectedVariant.priceModifier || 0);
  const totalSubtotal = currentPrice * quantity;
  const isVariantInStock = (selectedVariant.stock ?? 10) > 0 && product.inStock;

  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleBuyNow = () => {
    if (!isVariantInStock) {
      addToast("error", "Selected variant is currently out of stock.");
      return;
    }
    addToast(
      "success",
      `Initiated checkout for ${quantity}x ${product.name} (${selectedVariant.name}) — Total: ₹${totalSubtotal}`
    );
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Stock & Variant Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
              isVariantInStock
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {isVariantInStock
              ? `● In Stock (${selectedVariant.stock ?? 10} available)`
              : "● Out of Stock"}
          </span>
        </div>

        <div className="text-3xl font-black text-slate-900">
          ₹{totalSubtotal}{" "}
          {quantity > 1 && (
            <span className="text-xs font-semibold text-slate-400">
              (₹{currentPrice} × {quantity})
            </span>
          )}
        </div>
      </div>

      {/* Variant Selector */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400">
          Select Option / Variant
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {defaultVariants.map((variant) => {
            const isSelected = variant.id === selectedVariant.id;
            const inStock = (variant.stock ?? 10) > 0;
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariant(variant)}
                className={`p-3 text-left rounded-xl border text-xs font-bold transition-all ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/50 text-blue-900 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                } ${!inStock ? "opacity-60" : ""}`}
              >
                <div>{variant.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {inStock ? `${variant.stock ?? 10} left` : "Out of stock"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity Picker */}
      <div className="flex items-center gap-4">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400">
          Quantity:
        </label>
        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
          >
            -
          </button>
          <span className="px-4 text-xs font-extrabold text-slate-900">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min((selectedVariant.stock ?? 10), q + 1))}
            className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!isVariantInStock}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-extrabold rounded-xl shadow-md transition-all text-sm active:scale-95 flex items-center justify-center gap-2"
        >
          <span>Buy Now — ₹{totalSubtotal}</span>
        </button>
      </div>
    </div>
  );
}
