"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqAccordionItemProps {
  question: string;
  answer: string;
}

export default function FaqAccordionItem({ question, answer }: FaqAccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-100 py-5 transition-all duration-300">
      <h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between text-left py-2 text-slate-900 font-bold hover:text-blue-600 transition-colors focus:outline-none"
          aria-expanded={isOpen}
        >
          <span className="text-base font-extrabold text-slate-800 leading-tight">{question}</span>
          <ChevronDown 
            className={`h-5 w-5 text-slate-400 transition-transform duration-300 shrink-0 ml-4 ${
              isOpen ? "rotate-180 text-blue-600" : ""
            }`} 
          />
        </button>
      </h3>
      
      {/* Search bot optimized hidden block directly beneath the h3 heading */}
      <p className="sr-only" aria-hidden="true">
        {answer}
      </p>

      {/* Visually visible text block with css grid toggle height */}
      <div 
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm text-slate-500 leading-relaxed font-semibold pb-1">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
