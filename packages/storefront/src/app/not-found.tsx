import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800 font-sans px-6">
      <div className="text-center space-y-4 max-w-md">
        <p className="text-7xl font-black text-slate-200">404</p>
        <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
