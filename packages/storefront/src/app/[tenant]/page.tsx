import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getTenantStoreData, getTenantProducts } from "../../lib/store";

export const runtime = "edge";

interface PageProps {
  params: {
    tenant: string;
  };
}

export default async function TenantHomePage({ params }: PageProps) {
  const store = await getTenantStoreData(params.tenant);
  const products = await getTenantProducts(store.id);

  return (
    <div className="space-y-16">
      
      {/* Store Banner Hero */}
      <section className="text-center py-16 px-6 bg-gradient-to-b from-[#F8FAFC]/60 to-white border border-slate-100 rounded-2xl max-w-5xl mx-auto space-y-6">
        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Welcome to <span className="text-blue-600">{store.name}</span>
        </h1>
        <p className="text-base text-slate-500 font-semibold max-w-xl mx-auto leading-relaxed">
          {store.description}
        </p>
      </section>

      {/* Catalog Grid Section */}
      <section className="space-y-8">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Our Catalog</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div 
              key={product.id}
              className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {/* Product Visual */}
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
              </div>

              {/* Product metadata */}
              <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900 leading-tight">{product.name}</h3>
                  <p className="text-xs text-slate-400 font-semibold line-clamp-2 leading-relaxed">{product.desc}</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-black text-slate-950">₹{product.price}</span>
                  <Link 
                    href={`/products/${product.id}`}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-lg text-xs transition-all active:scale-95"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
