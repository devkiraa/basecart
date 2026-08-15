"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ShoppingBag, Menu, X, ArrowUpRight } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const merchantDashboardUrl = process.env.NEXT_PUBLIC_MERCHANT_DASHBOARD_URL || "http://localhost:3004";

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:font-bold focus:shadow-lg text-xs"
      >
        Skip to content
      </a>
      <header className="sticky top-0 bg-white/90 backdrop-blur-md z-50 border-b border-slate-100 px-6 lg:px-16 py-3 flex items-center justify-between select-none">
        <div className="flex items-center gap-8">
          {/* Light Theme Logo */}
          <a 
            href="/"
            className="flex items-center gap-2.5 group"
          >
            <Image src="/logo.svg" alt="Basecart Logo" width={160} height={46} priority className="h-[46px] w-auto object-contain shrink-0" />
          </a>

          {/* Light Theme Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <a href="/features" className="hover:text-blue-600 py-1.5 transition-colors">Features</a>
            <a href="/pricing" className="hover:text-blue-600 py-1.5 transition-colors">Pricing</a>
            <a href="/themes" className="hover:text-blue-600 py-1.5 transition-colors">Themes</a>
            <a href="/integrations" className="hover:text-blue-600 py-1.5 transition-colors">Integrations</a>
            <a href="/vs" className="hover:text-blue-600 py-1.5 transition-colors">Compare</a>
            <a href="/faq" className="hover:text-blue-600 py-1.5 transition-colors">FAQ</a>
            <a href="/blog" className="hover:text-blue-600 py-1.5 transition-colors">Blog</a>
          </nav>
        </div>

        {/* Light Theme Auth Actions (Royal Blue CTA) */}
        <div className="hidden lg:flex items-center gap-4">
          <a 
            href={`${merchantDashboardUrl}/login`}
            className="text-sm font-bold text-slate-600 hover:text-blue-600 px-3 py-1.5 transition-colors"
          >
            Sign in
          </a>
          <a 
            href="/signup"
            className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm shadow-blue-500/10 transition-all hover:shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Start 3-month free trial</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-xl p-6 lg:hidden flex flex-col gap-4 animate-fade-in">
            <a href="/features" className="text-sm font-semibold text-slate-700 hover:text-blue-600 py-2">Features</a>
            <a href="/pricing" className="text-sm font-semibold text-slate-700 hover:text-blue-600 py-2">Pricing</a>
            <a href="/themes" className="text-sm font-semibold text-slate-700 hover:text-blue-600 py-2">Themes</a>
            <a href="/integrations" className="text-sm font-semibold text-slate-700 hover:text-blue-600 py-2">Integrations</a>
            <a href="/vs" className="text-sm font-semibold text-slate-700 hover:text-blue-600 py-2">Compare</a>
            <a href="/faq" className="text-sm font-semibold text-slate-700 hover:text-blue-600 py-2">FAQ</a>
            <a href="/blog" className="text-sm font-semibold text-slate-700 hover:text-blue-600 py-2">Blog</a>
            <div className="h-px bg-slate-100 my-2" />
            <a 
              href={`${merchantDashboardUrl}/login`}
              className="text-sm font-bold text-slate-700 hover:text-blue-600 py-2"
            >
              Sign in
            </a>
            <a 
              href="/signup"
              className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 rounded-lg shadow-sm"
            >
              Start 3-month free trial
            </a>
          </div>
        )}
      </header>
    </>
  );
}
