import Link from "next/link";
import { ShoppingBag, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans text-slate-100">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="h-16 w-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto shadow-xs">
          <ShoppingBag className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
            404 — Page Not Found
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">Looking for Basecart?</h1>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            The requested page or marketing resource does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4F46E5] hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-2xs transition-all active:scale-98"
          >
            <Home className="h-4 w-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
