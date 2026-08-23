import React from "react";
import { Metadata } from "next";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Mail, Briefcase } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers — Join the Basecart Team",
  description: "Explore careers at Basecart. Currently no active job openings available.",
  alternates: {
    canonical: "https://basecart.app/careers",
  },
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white text-slate-650 font-sans selection:bg-blue-50 selection:text-blue-600">
      <Header />

      {/* Hero Section */}
      <section className="px-6 lg:px-16 pt-16 pb-16 bg-gradient-to-b from-[#F8FAFC]/50 to-white text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase">CAREERS</span>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Work at Basecart
          </h1>
          <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Building simple, powerful e-commerce infrastructure for Indian SMB merchants.
          </p>
        </div>
      </section>

      {/* Openings List */}
      <section className="px-6 py-12 max-w-3xl mx-auto text-center">
        <div className="bg-slate-50 border border-slate-200/90 p-10 sm:p-14 rounded-none space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-none bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 font-bold">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">No Open Positions Currently</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
            We do not have any open job roles at this moment. However, we are always eager to connect with talent.
          </p>
          <div className="pt-2">
            <a
              href="mailto:careers@basecart.app?subject=General%20Career%20Inquiry"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-none transition-all shadow-2xs cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Send Resume to Basecart</span>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
