"use client";

import React from "react";

interface ProductInteractiveProps {
  product: {
    id: string;
    name: string;
    price: number;
    compareAtPrice?: number | null;
    inStock: boolean;
    stockCount?: number;
  };
}

/**
 * Catalog-only product info section.
 * Cart and checkout have been removed from storefront — this shows price and stock status only.
 */
export function ProductInteractiveSection({ product }: ProductInteractiveProps) {
  const inStock = product.inStock ?? true;
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  return (
    <div className="space-y-5">
      {/* Price */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-slate-900">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-lg text-slate-400 line-through font-medium">
              ₹{product.compareAtPrice.toLocaleString("en-IN")}
            </span>
          )}
          {discount && (
            <span className="text-sm font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
              {discount}% OFF
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 font-medium">Inclusive of all taxes</p>
      </div>

      {/* Stock Status */}
      <div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
            inStock
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              inStock ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
          {inStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      {/* Enquiry CTA */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-1">
        <p className="text-xs font-bold text-blue-800">Interested in this product?</p>
        <p className="text-xs text-blue-600 font-medium">
          Contact the store directly to place an order or enquire about availability.
        </p>
      </div>
    </div>
  );
}
