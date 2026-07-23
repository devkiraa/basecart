import React from "react";
import { Metadata } from "next";
import { getTenantStoreData } from "../../lib/store";
import { CartBadge } from "./cart-badge";
import { MobileMenu } from "./mobile-menu";

interface LayoutProps {
  children: React.ReactNode;
  params: {
    tenant: string;
  };
}

// Generate dynamic metadata at layout level for multi-tenant stores
export async function generateMetadata({ params }: { params: { tenant: string } }): Promise<Metadata> {
  const store = await getTenantStoreData(params.tenant);
  
  // Rule: Canonical must point to the custom domain if mapped, fallback to default subdomain
  const canonicalBase = store.customDomain 
    ? `https://${store.customDomain}` 
    : `https://${store.id}.basecart.app`;

  return {
    metadataBase: new URL(canonicalBase),
    title: {
      default: `${store.name} | Social Commerce Storefront`,
      template: `%s | ${store.name}`,
    },
    description: store.description,
    alternates: {
      canonical: "/", // Evaluates to canonicalBase
    },
    openGraph: {
      title: store.name,
      description: store.description,
      url: canonicalBase,
      siteName: store.name,
      images: [
        {
          url: store.logoUrl,
          width: 500,
          height: 500,
          alt: `${store.name} logo preview`,
        }
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: store.name,
      description: store.description,
      images: [store.logoUrl],
    }
  };
}

export default async function TenantLayout({ children, params }: LayoutProps) {
  const store = await getTenantStoreData(params.tenant);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 antialiased font-sans">
      {/* Visual Header / Navigation Bar for Storefront */}
      <header className="sticky top-0 bg-white/95 backdrop-blur z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center text-white font-extrabold shadow-sm">
              {store.name.charAt(0)}
            </div>
            <a href={`/`} className="text-lg font-black text-slate-900 tracking-tight">{store.name}</a>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-500">
            <a href={`/`} className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-slate-950 transition-colors">Home</a>
            <a href={`/catalog`} className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-slate-950 transition-colors">Catalog</a>
            <a href={`/account`} className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-slate-950 transition-colors">Account</a>
            <a href={`/cart`} className="relative px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-slate-950 transition-colors flex items-center gap-1">
              Cart
              <CartBadge tenantId={store.id} />
            </a>
          </nav>

          {/* Mobile Menu */}
          <MobileMenu tenantId={store.id} />
        </div>
      </header>

      {/* Main Tenant Page Content */}
      <main className="max-w-7xl mx-auto px-6 py-10 min-h-[calc(100vh-140px)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white py-12 mt-16 text-center text-xs text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-1.5 font-medium text-slate-600">
            <span>&copy; {new Date().getFullYear()} <strong>{store.name}</strong>.</span>
            <span className="text-slate-300">•</span>
            <a
              href="https://basecart.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-slate-700 hover:text-indigo-600 transition-colors"
            >
              <span>Powered by</span>
              <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded tracking-tight shadow-2xs">
                Basecart
              </span>
            </a>
          </div>
          <div className="flex justify-center gap-4 select-none">
            <a href="#privacy" className="hover:text-slate-650 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-650 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
