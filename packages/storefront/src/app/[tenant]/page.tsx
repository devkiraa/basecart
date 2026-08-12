import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getTenantStoreData, getTenantProducts } from "../../lib/store";
import { Clock, ShoppingBag } from "lucide-react";

export const runtime = "edge";

interface PageProps {
  params: {
    tenant: string;
  };
}

export default async function TenantHomePage({ params }: PageProps) {
  const store = await getTenantStoreData(params.tenant);

  // Gate: unverified merchant email = store not live yet
  if (!store.emailVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 py-24">
        <div className="h-20 w-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
          <Clock className="h-10 w-10 text-amber-500" />
        </div>
        <div className="space-y-3 max-w-md">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{store.name}</h1>
          <h2 className="text-lg font-bold text-slate-700">Store Coming Soon</h2>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            This store is not yet live. The merchant is setting things up.
            Check back soon!
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-3 text-xs text-amber-700 font-semibold">
          Pending merchant activation
        </div>
      </div>
    );
  }

  const products = await getTenantProducts(store.id);

  return (
    <div className="space-y-16">
      
      {/* Store Banner Hero */}
      <section className="text-center py-16 px-6 bg-gradient-to-b from-[#F8FAFC]/60 to-white border border-slate-100 rounded-2xl max-w-5xl mx-auto space-y-6">
        <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto shadow-md shadow-blue-200">
          {store.name.charAt(0)}
        </div>
        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Welcome to <span className="text-blue-600">{store.name}</span>
        </h1>
        <p className="text-base text-slate-500 font-semibold max-w-xl mx-auto leading-relaxed">
          {store.description}
        </p>
      </section>

      {/* Catalog Grid */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Our Catalog</h2>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-sm font-semibold">No products listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Product image */}
                <div className="h-64 bg-slate-50 relative flex items-center justify-center overflow-hidden border-b border-slate-100">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={300}
                    height={220}
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-contain max-h-52 w-auto transition-transform duration-300 hover:scale-105"
                    priority
                  />
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      SALE
                    </span>
                  )}
                </div>

                {/* Product metadata — no add-to-cart */}
                <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      {product.category}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">{product.name}</h3>
                    <p className="text-xs text-slate-400 font-semibold line-clamp-2 leading-relaxed">{product.desc}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <span className="text-lg font-black text-slate-950">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <div className="text-xs text-slate-400 line-through font-medium">
                          ₹{product.compareAtPrice.toLocaleString("en-IN")}
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/products/${product.id}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all active:scale-95"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
