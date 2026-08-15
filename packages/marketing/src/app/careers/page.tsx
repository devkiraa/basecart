import React from "react";
import { Metadata } from "next";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ArrowRight, Briefcase } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers — Join the Basecart Team",
  description: "Help build the future of Indian e-commerce infrastructure. Explore open roles in full-stack engineering, cloud architecture, and product design.",
  alternates: {
    canonical: "https://basecart.app/careers",
  },
};

export default function CareersPage() {
  const jobs = [
    {
      title: "Senior Full-Stack Engineer (TypeScript)",
      department: "Engineering",
      location: "Bengaluru, India / Remote",
      type: "Full-Time"
    },
    {
      title: "Infrastructure & DevOps Architect",
      department: "Cloud Operations",
      location: "Remote",
      type: "Full-Time"
    },
    {
      title: "Product & UI Designer",
      department: "Design",
      location: "Mumbai, India",
      type: "Full-Time"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-650 font-sans selection:bg-blue-50 selection:text-blue-600">
      <Header />

      {/* Hero Section */}
      <section className="px-6 lg:px-16 pt-16 pb-20 bg-gradient-to-b from-[#F8FAFC]/50 to-white text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase">CAREERS</span>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Build the future of multi-tenant headless commerce
          </h1>
          <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            We are looking for creative and driven individuals to help build the world's most performant, isolated e-commerce platform.
          </p>
        </div>
      </section>

      {/* Openings List */}
      <section className="px-6 py-12 max-w-4xl mx-auto text-left">
        <h2 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-3">Open Positions</h2>
        
        <div className="space-y-4">
          {jobs.map((job, idx) => (
            <a 
              key={idx} 
              href={`mailto:careers@basecart.app?subject=Application%20for%20${encodeURIComponent(job.title)}`}
              className="bg-white border border-slate-150 p-6 rounded-xl hover:shadow-md hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex gap-4 items-start sm:items-center">
                <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">{job.title}</h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400 font-bold mt-1">
                    <span>{job.department}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.type}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 shrink-0 self-start sm:self-center select-none">
                Apply now <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </a>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
