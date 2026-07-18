"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Home, ShoppingBag, User, ShoppingCart } from "lucide-react";
import { useCart } from "../../lib/cart";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/catalog", label: "Catalog", icon: ShoppingBag },
  { href: "/account", label: "Account", icon: User },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
];

export function MobileMenu({ tenantId }: { tenantId: string }) {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart(tenantId);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-600"
        aria-label="Toggle menu"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setOpen(false)} />
          <nav className="fixed top-[65px] right-4 left-4 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 p-3 space-y-1 animate-fade-in">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <link.icon size={16} className="text-slate-400" />
                {link.label}
                {link.href === "/cart" && itemCount > 0 && (
                  <span className="ml-auto h-5 min-w-[20px] flex items-center justify-center bg-[var(--color-primary)] text-white text-[10px] font-extrabold rounded-full px-1.5">
                    {itemCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
