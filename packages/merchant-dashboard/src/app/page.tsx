"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Package,
  ShoppingCart,
  CreditCard,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

export default function LandingPage() {
  useEffect(() => {
    // If already logged in, redirect directly to dashboard
    const token = localStorage.getItem("basecart_merchant_token");
    if (token) {
      window.location.href = "/dashboard";
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-600 font-sans antialiased overflow-x-hidden selection:bg-blue-50 selection:text-blue-600">
      
      {/* Header/Navbar */}
      <header className="sticky top-0 bg-white/85 backdrop-blur-md z-50 border-b border-slate-100 px-6 lg:px-16 py-3.5 flex items-center justify-between select-none">
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
            <div className="relative group cursor-pointer py-1.5 flex items-center gap-1 hover:text-slate-900">
              Features <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
              <div className="absolute top-full left-0 mt-1.5 hidden group-hover:block w-48 bg-white border border-slate-100 shadow-xl rounded-lg p-2 z-50">
                <a href="#features" className="block px-3 py-2 text-xs hover:bg-slate-50 rounded-md font-bold text-slate-700">All Features</a>
                <a href="#showcase" className="block px-3 py-2 text-xs hover:bg-slate-50 rounded-md font-bold text-slate-700">Multi-Channel Sales</a>
              </div>
            </div>
            <a href="#pricing" className="hover:text-slate-900 py-1.5">Pricing</a>
            <a href="#testimonials" className="hover:text-slate-900 py-1.5">Customers</a>
            <div className="relative group cursor-pointer py-1.5 flex items-center gap-1 hover:text-slate-900">
              Resources <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
              <div className="absolute top-full left-0 mt-1.5 hidden group-hover:block w-48 bg-white border border-slate-100 shadow-xl rounded-lg p-2 z-50">
                <a href="#docs" onClick={(e) => { e.preventDefault(); alert("Developer documentation under development."); }} className="block px-3 py-2 text-xs hover:bg-slate-50 rounded-md font-bold text-slate-700">API Reference</a>
                <a href="#help" onClick={(e) => { e.preventDefault(); alert("Help desk is live at support@basecart.com"); }} className="block px-3 py-2 text-xs hover:bg-slate-50 rounded-md font-bold text-slate-700">Support Center</a>
              </div>
            </div>
            <a href="#enterprise" onClick={(e) => { e.preventDefault(); alert("Enterprise custom plan query form initiated. Contact sales@basecart.com"); }} className="hover:text-slate-900 py-1.5">Enterprise</a>
          </nav>
        </div>

        {/* Auth Actions */}
        <div className="flex items-center gap-4 select-none">
          <button 
            onClick={() => { window.location.href = "/login"; }}
            className="text-sm font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5"
          >
            Login
          </button>
          <button 
            onClick={() => { window.location.href = "/signup"; }}
            className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm shadow-blue-500/10 transition-colors"
          >
            Sign up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 lg:px-16 pt-16 pb-20 bg-gradient-to-b from-[#F8FAFC]/40 to-white relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-20%] w-[600px] h-[600px] rounded-full bg-blue-50/40 filter blur-3xl opacity-60 -z-10"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          {/* Hero content */}
          <div className="w-full lg:w-1/2 space-y-8 text-left">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-[1.12] tracking-tight">
                The <span className="text-blue-600">all-in-one</span> platform to build, launch and grow your online business.
              </h1>
              <p className="text-base lg:text-lg text-slate-500 leading-relaxed max-w-xl font-medium">
                Basecart gives you everything you need to create your store, manage orders, accept payments, and scale your business — all in one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 select-none pt-2">
              <button 
                onClick={() => { window.location.href = "/signup"; }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md shadow-blue-500/10 transition-all text-sm active:scale-95"
              >
                Start 14-day free trial
              </button>
              <button 
                onClick={() => alert("Book a demo scheduled! We will contact you at your registered email.")}
                className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold rounded-lg transition-all text-sm active:scale-95"
              >
                Book a demo
              </button>
            </div>

            {/* Hero bullet disclaimers */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400 font-semibold select-none pt-1">
              <span className="flex items-center gap-1.5">💳 No credit card required</span>
              <span className="flex items-center gap-1.5">⚡ Quick setup in 2 minutes</span>
              <span className="flex items-center gap-1.5">🔄 Cancel anytime</span>
            </div>
          </div>

          {/* Hero 3D Mockup Asset */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
            <div className="absolute top-[-5%] left-[5%] w-[400px] h-[400px] rounded-full bg-blue-50/50 filter blur-3xl opacity-50 -z-10"></div>
            <img 
              src="/basecart_dashboard_mockup.png" 
              alt="Basecart Dashboard Mockup" 
              className="w-full max-w-[500px] rounded-2xl shadow-2xl border border-slate-100 bg-white object-contain"
            />
          </div>
        </div>
      </section>

      {/* Trusted By logo cloud */}
      <section className="border-y border-slate-100 bg-slate-50/50 py-10 px-6 select-none">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Trusted by 10,000+ businesses worldwide
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-sm font-bold text-slate-400">
            <span className="hover:text-slate-600 transition-colors">PosterVerse</span>
            <span className="hover:text-slate-600 transition-colors">OCEAN MART</span>
            <span className="hover:text-slate-600 transition-colors">Crafty Corner</span>
            <span className="hover:text-slate-600 transition-colors">Urban Threads</span>
            <span className="hover:text-slate-600 transition-colors">Gadget Hub</span>
            <span className="hover:text-slate-600 transition-colors">Green Leaf</span>
            <span className="hover:text-slate-600 transition-colors">Pawsome Store</span>
          </div>
        </div>
      </section>

      {/* Features Grid section */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto text-center space-y-16">
        <div className="space-y-4 max-w-2xl mx-auto">
          <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
            All the tools you need
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Powerful features to run your entire business
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed font-semibold">
            Everything you need to sell online, in-store, and everywhere in between.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {[
            {
              title: "Store Builder",
              desc: "Create a beautiful store in minutes with our easy builder.",
              icon: <ShoppingBag className="h-5 w-5 text-blue-600" />
            },
            {
              title: "Product Management",
              desc: "Add, organize and manage your products effortlessly.",
              icon: <Package className="h-5 w-5 text-blue-600" />
            },
            {
              title: "Order Management",
              desc: "Track orders, manage fulfillment and keep customers happy.",
              icon: <ShoppingCart className="h-5 w-5 text-blue-600" />
            },
            {
              title: "Secure Payments",
              desc: "Accept payments securely with multiple payment options.",
              icon: <CreditCard className="h-5 w-5 text-blue-600" />
            },
            {
              title: "Analytics & Reports",
              desc: "Get real-time insights and grow your business faster.",
              icon: <TrendingUp className="h-5 w-5 text-blue-600" />
            },
            {
              title: "Team Management",
              desc: "Add team members and manage access with ease.",
              icon: <Users className="h-5 w-5 text-blue-600" />
            }
          ].map((feat, i) => (
            <div 
              key={i} 
              className="bg-white border border-slate-100 p-6 rounded-xl hover:shadow-xl hover:border-slate-200 transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center mb-5 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {feat.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{feat.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">{feat.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-4 select-none">
          <a 
            href="#features" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
          >
            Explore all features <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>

      {/* Secondary Showcase section */}
      <section id="showcase" className="py-20 px-6 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="w-full lg:w-1/2 space-y-8 text-left">
            <div className="space-y-4">
              <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
                Built for every business
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                One platform.<br />Endless possibilities.
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed font-semibold">
                Whether you're just starting out or scaling to thousands of orders, Basecart grows with your business.
              </p>
            </div>

            <div className="space-y-3 font-semibold text-xs text-slate-700">
              {[
                "Start a new online store",
                "Sell across multiple channels",
                "Manage everything in one dashboard",
                "Scale without limits"
              ].map((bullet, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="h-4.5 w-4.5 text-blue-600 shrink-0" />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Storefront Mockup Asset */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <img 
              src="/basecart_storefront_mockup.png" 
              alt="Basecart Storefront Mockup" 
              className="w-full max-w-[500px] rounded-2xl shadow-2xl border border-slate-100 bg-white object-contain"
            />
          </div>
        </div>
      </section>

      {/* Key Stats section */}
      <section className="py-12 border-b border-slate-100 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center select-none">
          {[
            { label: "Happy Merchants", val: "10,005+", icon: "😊" },
            { label: "Orders Processed", val: "1M+", icon: "📦" },
            { label: "Countries", val: "120+", icon: "🌐" },
            { label: "Uptime", val: "99.9%", icon: "⚡" }
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              <div className="text-2xl">{stat.icon}</div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">{stat.val}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing section */}
      <section id="pricing" className="py-20 px-6 max-w-7xl mx-auto text-center space-y-16">
        <div className="space-y-4 max-w-2xl mx-auto">
          <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
            Simple, transparent pricing
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Choose the perfect plan for your business
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed font-semibold">
            Start free and upgrade anytime. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {[
            {
              title: "Free",
              price: "₹0",
              desc: "Perfect for trying out.",
              features: ["Online Store", "Unlimited Products", "Basic Analytics"],
              popular: false,
              btn: "Get started"
            },
            {
              title: "Starter",
              price: "₹299",
              desc: "For growing businesses.",
              features: ["All Free features", "Custom Domain", "Email Support", "Discount Coupons"],
              popular: false,
              btn: "Start free trial"
            },
            {
              title: "Growth",
              price: "₹699",
              desc: "For scaling businesses.",
              features: ["All Starter features", "Advanced Analytics", "Priority Support", "Abandoned Cart"],
              popular: true,
              btn: "Start free trial"
            },
            {
              title: "Pro",
              price: "₹1499",
              desc: "For advanced teams.",
              features: ["All Growth features", "Team Management", "API Access", "Dedicated Onboarding"],
              popular: false,
              btn: "Start free trial"
            }
          ].map((plan, i) => (
            <div 
              key={i} 
              className={`bg-white border rounded-2xl p-6 flex flex-col justify-between relative transition-all duration-300 ${
                plan.popular 
                  ? "border-blue-600 ring-4 ring-blue-50 scale-105 md:scale-100 lg:scale-105 z-10 shadow-lg" 
                  : "border-slate-150 hover:border-slate-350 shadow-sm"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-black uppercase text-[8px] tracking-widest px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-1">{plan.title}</h3>
                  <p className="text-[11px] text-slate-400 font-bold mb-4">{plan.desc}</p>
                  <div className="flex items-baseline gap-1 select-none">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">{plan.price}</span>
                    <span className="text-xs text-slate-400 font-bold">/ month</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  {plan.features.map((feat, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs font-semibold text-slate-650 text-slate-600">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => { window.location.href = "/signup"; }}
                className={`w-full mt-8 py-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                  plan.popular 
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10" 
                    : "border border-slate-200 text-slate-800 hover:bg-slate-50"
                }`}
              >
                {plan.btn}
              </button>
            </div>
          ))}
        </div>

        {/* Custom/Agency block */}
        <div className="max-w-4xl mx-auto border border-slate-150 rounded-2xl p-6 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6 text-left mt-8">
          <div>
            <h3 className="text-base font-black text-slate-900 mb-1">Agency & Custom Solutions</h3>
            <p className="text-xs text-slate-550 text-slate-500 font-semibold max-w-xl">
              For large operations and agencies requiring white label templates, dedicated database clusters, custom platform integrations, and custom SLA agreements.
            </p>
          </div>
          <button 
            onClick={() => alert("Enterprise custom plan query ticket created. Our team will contact you within 24 hours.")}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-lg transition-all shrink-0 active:scale-95"
          >
            Contact sales
          </button>
        </div>

        <div className="text-[10px] text-slate-400 font-bold select-none pt-2 flex items-center justify-center gap-1">
          <span>🛡️</span> 14-day money-back guarantee. Cancel anytime.
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <div className="space-y-4 max-w-2xl mx-auto">
            <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
              Loved by merchants
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              See what our customers have to say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              {
                quote: "Basecart helped us launch our store in the same day. The platform is intuitive, powerful and the support is fantastic.",
                author: "Rohit Sharma",
                role: "Founder, PosterVerse"
              },
              {
                quote: "We scaled from 0 to 10K orders seamlessly. The analytics and isolated database setups are a game changer.",
                author: "Sneha Iyer",
                role: "Co-founder, Ocean Mart"
              },
              {
                quote: "Finally, an all-in-one platform that doesn't overcomplicate things. Highly recommended!",
                author: "Arjun Mehta",
                role: "Owner, Gadget Hub"
              }
            ].map((test, i) => (
              <div key={i} className="bg-white border border-slate-150 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs text-slate-650 text-slate-600 leading-relaxed font-semibold italic mb-6">
                  "{test.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs shrink-0 select-none">
                    {test.author[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{test.author}</h4>
                    <p className="text-[10px] text-slate-400 font-bold">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="px-6 py-20 max-w-7xl mx-auto text-center select-none">
        <div className="bg-blue-600 rounded-3xl p-10 lg:p-16 text-white space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-[-50%] left-[-20%] w-[500px] h-[500px] rounded-full bg-blue-500 filter blur-3xl opacity-40"></div>
          
          <div className="text-4xl">🚀</div>
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight max-w-xl mx-auto leading-tight">
            Ready to build your dream business? Start your 14-day free trial today.
          </h2>
          <button 
            onClick={() => { window.location.href = "/signup"; }}
            className="inline-flex items-center gap-1.5 px-6 py-3 bg-white text-blue-600 font-extrabold text-sm rounded-lg hover:bg-slate-50 transition-all shadow-md active:scale-95 mt-4"
          >
            Get started for free <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-[#F8FAFC] py-16 px-6 lg:px-16 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span className="text-base font-black text-slate-900 tracking-tight">basecart</span>
            </div>
            <p className="text-xs text-slate-400 font-semibold max-w-xs leading-relaxed">
              The all-in-one commerce platform to build, launch and grow your online business.
            </p>
            <div className="flex gap-4 text-slate-400 text-sm">
              <span className="hover:text-blue-600 cursor-pointer">🌐</span>
              <span className="hover:text-blue-600 cursor-pointer">💬</span>
              <span className="hover:text-blue-600 cursor-pointer">✉️</span>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-4">Product</h4>
            <div className="space-y-3 text-xs font-semibold text-slate-500 select-none">
              <div className="hover:text-slate-900 cursor-pointer">Features</div>
              <div className="hover:text-slate-900 cursor-pointer">Pricing</div>
              <div className="hover:text-slate-900 cursor-pointer">Integrations</div>
              <div className="hover:text-slate-900 cursor-pointer">Changelog</div>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-4">Resources</h4>
            <div className="space-y-3 text-xs font-semibold text-slate-500 select-none">
              <div className="hover:text-slate-900 cursor-pointer">Help Center</div>
              <div className="hover:text-slate-900 cursor-pointer">Guides</div>
              <div className="hover:text-slate-900 cursor-pointer">API Docs</div>
              <div className="hover:text-slate-900 cursor-pointer">Community</div>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-4">Company</h4>
            <div className="space-y-3 text-xs font-semibold text-slate-500 select-none">
              <div className="hover:text-slate-900 cursor-pointer">About Us</div>
              <div className="hover:text-slate-900 cursor-pointer">Careers</div>
              <div className="hover:text-slate-900 cursor-pointer">Blog</div>
              <div className="hover:text-slate-900 cursor-pointer">Contact Us</div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-200/50 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-400 font-bold select-none">
          <span>© {new Date().getFullYear()} Basecart Inc. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="/legal/terms" className="hover:underline cursor-pointer">Terms of Service</a>
            <a href="/legal/privacy" className="hover:underline cursor-pointer">Privacy Policy</a>
            <span className="hover:underline cursor-pointer">Refund Policy</span>
            <span className="hover:underline cursor-pointer">Security</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
