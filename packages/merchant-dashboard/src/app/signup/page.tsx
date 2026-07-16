"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Package,
  CreditCard,
  Grid,
  Info,
  AlertCircle,
  Loader2
} from "lucide-react";
import StepAccount from "../../components/StepAccount";
import StepStore from "../../components/StepStore";
import StepBusiness from "../../components/StepBusiness";
import StepPlan from "../../components/StepPlan";
import StepVerification from "../../components/StepVerification";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const STOREFRONT_DOMAIN = (process.env.NEXT_PUBLIC_STOREFRONT_DOMAIN || "basecart.app").replace(/^(https?:\/\/)/, "");

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [wizardStep, setWizardStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    receiveUpdates: false,
    storeName: "",
    subdomain: "",
    businessCategory: "",
    businessType: "",
    country: "India",
    state: "",
    ownerName: "",
    phone: "",
    teamSize: "1",
    monthlyOrders: "0-50",
    currentPlatform: "None",
    hearAboutUs: "Google Search",
    selectedPlan: "free",
    otpCode: "",
  });

  useEffect(() => {
    // If already logged in, go to dashboard
    const token = localStorage.getItem("basecart_merchant_token");
    if (token) {
      window.location.href = "/dashboard";
    }
  }, []);

  const handleUpdateOnboarding = (fields: Partial<typeof onboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...fields }));
  };

  const handleSignupComplete = async () => {
    setAuthError("");
    setLoading(true);
    try {
      let cleanedSubdomain = onboardingData.subdomain.trim().toLowerCase();
      if (cleanedSubdomain.endsWith(".basecart.io")) {
        cleanedSubdomain = cleanedSubdomain.replace(/\.?basecart\.io$/, "");
      }
      if (cleanedSubdomain.endsWith("." + STOREFRONT_DOMAIN.replace(/:[0-9]+$/, ""))) {
        cleanedSubdomain = cleanedSubdomain.replace(new RegExp(`\\.?${STOREFRONT_DOMAIN.replace(/:[0-9]+$/, "").replace(/\./g, "\\.")}$`), "");
      }
      if (cleanedSubdomain.endsWith(".localhost")) {
        cleanedSubdomain = cleanedSubdomain.replace(/\.?localhost$/, "");
      }
      cleanedSubdomain = cleanedSubdomain.replace(/[^a-z0-9-]/g, "");

      const res = await fetch(`${API_URL}/auth/merchant/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: onboardingData.email,
          password: onboardingData.password,
          storeName: onboardingData.storeName,
          subdomain: cleanedSubdomain,
          businessCategory: onboardingData.businessCategory,
          businessType: onboardingData.businessType,
          country: onboardingData.country,
          state: onboardingData.state,
          ownerName: onboardingData.ownerName,
          phone: onboardingData.phone,
          teamSize: onboardingData.teamSize,
          monthlyOrders: onboardingData.monthlyOrders,
          currentPlatform: onboardingData.currentPlatform,
          hearAboutUs: onboardingData.hearAboutUs,
          selectedPlan: onboardingData.selectedPlan,
          receiveUpdates: onboardingData.receiveUpdates,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      localStorage.setItem("basecart_merchant_token", data.accessToken);
      localStorage.setItem("basecart_tenant_id", data.tenantId);

      // On successful signup, redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      setAuthError(err.message || "Failed to create merchant store.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-white font-sans overflow-hidden">
      {/* Left Column - Hero Marketing Block */}
      <div className="hidden lg:flex w-[45%] bg-[#F8FAFC] p-12 flex-col justify-between border-r border-slate-100 select-none relative overflow-hidden h-full">
        <div className="absolute top-[-10%] right-[-20%] w-[500px] h-[500px] rounded-full bg-blue-50/60 filter blur-3xl opacity-80 -z-10"></div>
        <div className="absolute bottom-[-10%] left-[-20%] w-[400px] h-[400px] rounded-full bg-indigo-50/50 filter blur-3xl opacity-70 -z-10"></div>

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

        {/* Content Block */}
        <div className="my-auto space-y-6 max-w-md pt-2">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
              Create. Launch. Grow with <span className="text-blue-600 font-black">Basecart.</span>
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed font-semibold">
              The all-in-one platform to build your online store, manage orders, and scale your business.
            </p>
          </div>

          {/* Bullet Points */}
          <div className="space-y-5">
            {[
              {
                title: "Launch your store in minutes",
                desc: "Get fully provisioned isolated database setups and premium Watchroom templates.",
                icon: <ShoppingBag className="h-4.5 w-4.5 text-blue-600" />
              },
              {
                title: "Powerful features to grow",
                desc: "Integrated invoice engines, advanced discounts, and standard payment processors.",
                icon: <Grid className="h-4.5 w-4.5 text-blue-600" />
              },
              {
                title: "Secure, reliable, and built for scale",
                desc: "Powered by Cloudflare Durable Objects and SQLite D1 high-performance architecture.",
                icon: <Info className="h-4.5 w-4.5 text-blue-600" />
              }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-normal font-semibold">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative pt-2 flex justify-center">
            <img 
              src="/basecart_dashboard_mockup.png" 
              alt="Basecart Dashboard Mockup" 
              className="w-full max-w-[280px] rounded-xl shadow-xl shadow-blue-900/5 border border-slate-100 bg-white object-contain"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm border border-slate-100 rounded-full px-4 py-2 w-max shadow-sm mt-4">
          <div className="flex -space-x-2">
            {[
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80",
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80",
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80",
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80"
            ].map((src, i) => (
              <img key={i} src={src} className="h-8 w-8 rounded-full border-2 border-white object-cover" alt="avatar" />
            ))}
          </div>
          <span className="text-[10px] text-slate-500 font-bold">
            Join <strong className="text-blue-600 font-extrabold">10,000+</strong> entrepreneurs building on Basecart
          </span>
        </div>
      </div>

      {/* Right Column - Onboarding Wizard */}
      <div className="flex-1 flex flex-col justify-center py-6 px-6 sm:px-16 lg:px-24 bg-white relative h-full overflow-y-auto">
        <div className="absolute top-8 right-8 sm:right-16 text-xs text-slate-500 font-semibold flex items-center gap-1.5 select-none">
          Already have an account?{" "}
          <button 
            onClick={() => { window.location.href = "/login"; }}
            className="text-blue-600 font-bold hover:underline"
          >
            Login
          </button>
        </div>

        <div className="max-w-[440px] w-full mx-auto space-y-6">
          <div className="flex lg:hidden items-center gap-2 mb-4 select-none cursor-pointer" onClick={() => { window.location.href = "/"; }}>
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
            <span className="text-lg font-black text-slate-900">basecart</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create your account</h2>
              <p className="text-xs text-slate-500 font-medium">Start your 14-day free trial. No credit card required.</p>
            </div>

            {/* Progress Indicators */}
            <div className="flex justify-between items-center relative select-none py-2">
              <div className="absolute top-[18px] left-[5%] right-[5%] h-0.5 bg-slate-100 -z-10"></div>
              <div 
                className="absolute top-[18px] left-[5%] h-0.5 bg-blue-600 transition-all duration-300 -z-10"
                style={{ width: `${((wizardStep - 1) / 4) * 90}%` }}
              ></div>
              
              {[
                { step: 1, label: "Account" },
                { step: 2, label: "Store" },
                { step: 3, label: "Business" },
                { step: 4, label: "Plan" },
                { step: 5, label: "Verify" }
              ].map((s) => {
                const isCompleted = s.step < wizardStep;
                const isActive = s.step === wizardStep;
                return (
                  <div key={s.step} className="flex flex-col items-center gap-1.5 z-10 font-sans">
                    <div className={`h-8 w-8 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted 
                        ? "bg-blue-600 border-blue-600 text-white" 
                        : isActive 
                          ? "bg-white border-blue-600 text-blue-700 font-extrabold ring-4 ring-blue-50" 
                          : "bg-white border-slate-200 text-slate-400"
                    }`}>
                      {s.step}
                    </div>
                    <span className={`text-[9px] uppercase tracking-wider font-extrabold transition-colors ${
                      isActive ? "text-blue-700" : isCompleted ? "text-slate-700" : "text-slate-400"
                    }`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Wizard Form Errors */}
            {authError && wizardStep !== 5 && (
              <div className="bg-red-50 text-red-700 border border-red-100 p-3.5 rounded-button text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Active Step Component */}
            {wizardStep === 1 && (
              <StepAccount 
                data={onboardingData} 
                onChange={handleUpdateOnboarding} 
                onNext={() => setWizardStep(2)} 
                loading={loading}
              />
            )}
            {wizardStep === 2 && (
              <StepStore 
                data={onboardingData} 
                onChange={handleUpdateOnboarding} 
                onBack={() => setWizardStep(1)}
                onNext={() => setWizardStep(3)} 
              />
            )}
            {wizardStep === 3 && (
              <StepBusiness 
                data={onboardingData} 
                onChange={handleUpdateOnboarding} 
                onBack={() => setWizardStep(2)}
                onNext={() => setWizardStep(4)} 
              />
            )}
            {wizardStep === 4 && (
              <StepPlan 
                data={onboardingData} 
                onChange={handleUpdateOnboarding} 
                onBack={() => setWizardStep(3)}
                onNext={() => setWizardStep(5)} 
              />
            )}
            {wizardStep === 5 && (
              <StepVerification 
                data={onboardingData} 
                onChange={handleUpdateOnboarding} 
                onBack={() => setWizardStep(4)}
                onSubmit={handleSignupComplete}
                loading={loading}
                error={authError}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
