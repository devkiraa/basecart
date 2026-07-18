import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getTenantStoreData, getTenantProducts } from "../../../lib/store";
import { getOptimizedImageUrl } from "../../../lib/image";
import { Package, Tag, ShoppingBag } from "lucide-react";

interface CatalogPageProps {
  params: { tenant: string };
  searchParams: { sort?: string; category?: string };
}

export async function generateMetadata({ params }: CatalogPageProps) {
  const store = await getTenantStoreData(params.tenant);
  return {
    title: `Catalog | ${store.name}`,
    description: `Browse all products from ${store.name}`,
  };
}

export default async function CatalogPage({ params, searchParams }: CatalogPageProps) {
  const store = await getTenantStoreData(params.tenant);
  const products = await getTenantProducts(store.id);

  const sort = searchParams.sort || "newest";
  const categoryFilter = searchParams.category || "";

  const categories = Array.from(new Set(products.map((p) => (p as any).category || "General")));

  let filtered = categoryFilter
    ? products.filter((p) => ((p as any).category || "General") === categoryFilter)
    : [...products];

  if (sort === "price-low") filtered.sort((a, b) => a.price - b.price);
  else if (sort === "price-high") filtered.sort((a, b) => b.price - a.price);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <section className="text-center py-14 px-6 bg-gradient-to-br from-[var(--color-primary-subtle)] to-white border border-slate-100 rounded-2xl max-w-5xl mx-auto space-y-4">
        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
          <span className="text-[var(--color-primary)]">{store.name}</span> Catalog
        </h1>
        <p className="text-sm text-slate-500 font-semibold max-w-xl mx-auto">
          {store.description}
        </p>
      </section>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-56 shrink-0 space-y-6">
          {/* Categories */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Tag size={13} /> Categories
            </h3>
            <div className="space-y-1">
              <Link
                href={`/catalog${sort !== "newest" ? `?sort=${sort}` : ""}`}
                className={`block text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  !categoryFilter
                    ? "bg-[var(--color-primary-subtle)] text-[var(--color-primary)]"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                All Products
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/catalog?category=${encodeURIComponent(cat)}${sort !== "newest" ? `&sort=${sort}` : ""}`}
                  className={`block text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    categoryFilter === cat
                      ? "bg-[var(--color-primary-subtle)] text-[var(--color-primary)]"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Sort By</h3>
            <div className="space-y-1">
              {[
                { value: "newest", label: "Newest" },
                { value: "price-low", label: "Price: Low to High" },
                { value: "price-high", label: "Price: High to Low" },
              ].map((opt) => (
                <Link
                  key={opt.value}
                  href={`/catalog?sort=${opt.value}${categoryFilter ? `&category=${encodeURIComponent(categoryFilter)}` : ""}`}
                  className={`block text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    sort === opt.value
                      ? "bg-[var(--color-primary-subtle)] text-[var(--color-primary)]"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">
              {filtered.length} {filtered.length === 1 ? "Product" : "Products"}
            </h2>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
              <ShoppingBag size={40} className="mx-auto text-slate-300 mb-4" />
              <p className="text-sm font-semibold text-slate-400">No products found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md storefront-card flex flex-col"
                >
                  <div className="h-56 bg-slate-50 relative flex items-center justify-center overflow-hidden border-b border-slate-100 zoom-img-container">
                    <Image
                      src={getOptimizedImageUrl(product.imageUrl, "medium")}
                      alt={product.name}
                      width={300}
                      height={220}
                      sizes="(max-width: 640px) 100vw, 300px"
                      className="object-contain max-h-44 w-auto"
                    />
                    {(product as any).category && (
                      <span className="absolute top-3 left-3 text-[10px] font-bold bg-white/90 text-slate-600 px-2 py-0.5 rounded-full border border-slate-100">
                        {(product as any).category}
                      </span>
                    )}
                  </div>
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">{product.name}</h3>
                      <p className="text-xs text-slate-400 font-medium line-clamp-2 mt-1">{product.desc}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-black text-slate-950">₹{product.price.toLocaleString("en-IN")}</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        In Stock
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
