"use client";

import React, { useState } from "react";
import { ShoppingBag, ChevronDown, Menu, X } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const merchantDashboardUrl = process.env.NEXT_PUBLIC_MERCHANT_DASHBOARD_URL || "http://localhost:3004";

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100 px-6 lg:px-16 py-3.5 flex items-center justify-between select-none">
      <div className="flex items-center gap-6">
        {/* Logo */}
        <div 
          onClick={() => { window.location.href = "/"; }}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">basecart</span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <a href="/features" className="hover:text-slate-900 py-1.5 transition-colors">Features</a>
          <a href="/pricing" className="hover:text-slate-900 py-1.5 transition-colors">Pricing</a>
          <a href="/themes" className="hover:text-slate-900 py-1.5 transition-colors">Themes</a>
          <a href="/integrations" className="hover:text-slate-900 py-1.5 transition-colors">Integrations</a>
          <a href="/faq" className="hover:text-slate-900 py-1.5 transition-colors">FAQ</a>
          <a href="/blog" className="hover:text-slate-900 py-1.5 transition-colors">Blog</a>
        </nav>
      </div>

      {/* Auth Actions */}
      <div className="hidden lg:flex items-center gap-4">
        <a 
          href={`${merchantDashboardUrl}/login`}
          className="text-sm font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-colors"
        >
          Login
        </a>
        <a 
          href="/signup"
          className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm shadow-blue-500/10 transition-all hover:shadow-md active:scale-95"
        >
          Sign up
        </a>
      </div>

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
      >
        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-lg p-6 lg:hidden flex flex-col gap-4 animate-fade-in">
          <a href="/features" className="text-sm font-semibold text-slate-650 hover:text-slate-900 py-2">Features</a>
          <a href="/pricing" className="text-sm font-semibold text-slate-650 hover:text-slate-900 py-2">Pricing</a>
          <a href="/themes" className="text-sm font-semibold text-slate-650 hover:text-slate-900 py-2">Themes</a>
          <a href="/integrations" className="text-sm font-semibold text-slate-650 hover:text-slate-900 py-2">Integrations</a>
          <a href="/faq" className="text-sm font-semibold text-slate-650 hover:text-slate-900 py-2">FAQ</a>
          <a href="/blog" className="text-sm font-semibold text-slate-650 hover:text-slate-900 py-2">Blog</a>
          <div className="h-px bg-slate-100 my-2" />
          <a 
            href={`${merchantDashboardUrl}/login`}
            className="text-sm font-bold text-slate-600 hover:text-slate-900 py-2"
          >
            Login
          </a>
          <a 
            href="/signup"
            className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 rounded-lg shadow-sm"
          >
            Sign up
          </a>
        </div>
      )}
    </header>
  );
}
