"use client";

import React, { useState } from "react";
import { ChevronDown, MessageSquare, CheckCheck, HelpCircle, ShieldCheck } from "lucide-react";

interface FaqAccordionItemProps {
  question: string;
  answer: string;
}

export default function FaqAccordionItem({ question, answer }: FaqAccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200/80 p-4 sm:p-6 bg-white transition-colors hover:bg-slate-50/50 space-y-3">
      {/* Search bot hidden text for SEO */}
      <p className="sr-only" aria-hidden="true">
        {answer}
      </p>

      {/* Question Header Chat Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-none flex items-center justify-center font-bold shrink-0 transition-colors ${
            isOpen ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600"
          }`}>
            <HelpCircle className="w-4 h-4" />
          </div>
          <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
            {question}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-block text-[11px] font-bold text-slate-400 group-hover:text-slate-600">
            {isOpen ? "Close" : "View Answer"}
          </span>
          <div className={`w-6 h-6 rounded-none flex items-center justify-center border transition-all ${
            isOpen ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-slate-200 text-slate-400"
          }`}>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </button>

      {/* Support Answer Chat Bubble (Animated Expand) */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pl-0 sm:pl-11 pt-1">
            <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-none text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-[10px] border-b border-slate-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-slate-900 text-white flex items-center justify-center font-bold text-[9px]">
                    <ShieldCheck className="w-3 h-3 text-blue-400" />
                  </div>
                  <span className="text-slate-900 font-extrabold tracking-wide uppercase">
                    Basecart Merchant Support
                  </span>
                </div>
                <span className="flex items-center gap-1 text-emerald-700 font-mono font-bold bg-emerald-50 px-1.5 py-0.5 border border-emerald-200/60">
                  <span>Verified Answer</span>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                </span>
              </div>
              
              <div className="flex items-start gap-2.5 text-slate-700 font-medium leading-relaxed">
                <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                  {answer}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
