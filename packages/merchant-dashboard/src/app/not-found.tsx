import Link from "next/link";
import { LayoutDashboard, ArrowLeft, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="h-16 w-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mx-auto shadow-xs">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full uppercase tracking-widest">
            404 — Section Missing
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard Page Not Found</h1>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            The requested console page, store section, or settings tab was not found or you do not have permission to view it.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all active:scale-98"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
