import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTenantStoreData, getProductData } from "../../../../lib/store";

interface ProductPageProps {
  params: {
    tenant: string;
    productId: string;
  };
}

// Generate dynamic metadata for the specific product
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductData(params.productId);
  const store = await getTenantStoreData(params.tenant);
  
  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  // canonicalUrl must point to custom domain if mapped
  const canonicalUrl = store.customDomain 
    ? `https://${store.customDomain}/products/${params.productId}` 
    : `https://${store.id}.basecart.app/products/${params.productId}`;

  return {
    title: product.name,
    description: product.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.name} | ${store.name}`,
      description: product.description,
      url: canonicalUrl,
      type: "article",
      images: [
        {
          url: product.imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        }
      ]
    }
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await getProductData(params.productId);
  const store = await getTenantStoreData(params.tenant);

  if (!product) {
    notFound();
  }

  const canonicalBase = store.customDomain 
    ? `https://${store.customDomain}` 
    : `https://${store.id}.basecart.app`;

  const productUrl = `${canonicalBase}/products/${product.id}`;

  // Structured breadcrumb list schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": canonicalBase
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": product.category,
        "item": `${canonicalBase}/categories/${product.categorySlug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": productUrl
      }
    ]
  };

  // Structured product offer schema with Cloudflare R2 hosted assets
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.imageUrl,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": store.name
    },
    "offers": {
      "@type": "Offer",
      "price": product.price.toString(),
      "priceCurrency": "INR",
      "availability": product.inStock 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "url": productUrl
    }
  };

  // We display high-fidelity dashboard/storefront preview paths for local visual rendering inside the markup
  const visualImageUrl = product.id === "prod-1" ? "/basecart_storefront_mockup.png" : "/basecart_dashboard_mockup.png";

  return (
    <div className="space-y-12">
      
      {/* Inject Product and Breadcrumb JSON-LD structured schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, productSchema]),
        }}
      />

      {/* Breadcrumb Visual Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 select-none">
        <Link href={`/`} className="hover:text-slate-650">Home</Link>
        <span>/</span>
        <span className="text-slate-500">{product.category}</span>
        <span>/</span>
        <span className="text-slate-650">{product.name}</span>
      </nav>

      {/* Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
        
        {/* Left Column: Image Display (Core Web Vitals Optimized) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-8 flex items-center justify-center overflow-hidden shadow-sm">
          <Image 
            src={visualImageUrl} 
            alt={`Visual representation of ${product.name} for checkout.`}
            width={450}
            height={340}
            sizes="(max-width: 768px) 100vw, 450px"
            className="object-contain max-h-[400px] w-auto"
            priority
          />
        </div>

        {/* Right Column: Checkout info */}
        <div className="space-y-8 text-left">
          <div className="space-y-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold select-none ${
              product.inStock 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                : "bg-rose-50 text-rose-700 border border-rose-100"
            }`}>
              {product.inStock ? "● In Stock" : "● Out of Stock"}
            </span>

            <h1 className="text-3xl font-black text-slate-900 leading-tight">{product.name}</h1>
            <div className="text-2xl font-black text-slate-950">₹{product.price}</div>
          </div>

          <div className="border-y border-slate-100 py-6">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Description</h2>
            <p className="text-sm text-slate-500 leading-relaxed font-semibold">{product.description}</p>
          </div>

          {/* Localized checkout parameters */}
          <div className="space-y-4">
            <div className="space-y-1.5 text-xs text-slate-400 font-bold select-none">
              <div className="flex items-center gap-1.5">⚡ Instant UPI Checkout via Razorpay</div>
              <div className="flex items-center gap-1.5">📦 Local Kerala Courier Doorstep Logistics</div>
              <div className="flex items-center gap-1.5">💵 Cash on Delivery (COD) Options Available</div>
            </div>

            <button 
              onClick={() => alert(`Initiating Razorpay payment flow for ₹${product.price} to buy ${product.name}...`)}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md shadow-blue-500/10 transition-all text-sm active:scale-95 flex items-center justify-center gap-1.5"
            >
              Buy Now
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
