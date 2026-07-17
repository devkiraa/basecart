import React from "react";
import { Metadata } from "next";
import { getTenantStoreData } from "../../lib/store";

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
      <header className="sticky top-0 bg-white/95 backdrop-blur z-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between select-none max-w-7xl mx-auto rounded-b-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center text-white font-extrabold shadow-sm">
            {store.name.charAt(0)}
          </div>
          <span className="text-lg font-black text-slate-900 tracking-tight">{store.name}</span>
        </div>
        
        <nav className="flex items-center gap-4 text-xs font-bold text-slate-500">
          <a href={`/`} className="hover:text-slate-950 transition-colors">Catalog</a>
          <a href="#about" className="hover:text-slate-950 transition-colors">About Us</a>
        </nav>
      </header>

      {/* Main Tenant Page Content */}
      <main className="max-w-7xl mx-auto px-6 py-10 min-h-[calc(100vh-140px)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white py-12 mt-16 text-center text-xs text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto space-y-3">
          <p>© {new Date().getFullYear()} {store.name}. Powered by <a href="https://basecart.app" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">Basecart</a></p>
          <div className="flex justify-center gap-4 select-none">
            <a href="#privacy" className="hover:text-slate-650 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-650 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
