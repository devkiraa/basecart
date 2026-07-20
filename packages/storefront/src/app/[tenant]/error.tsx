"use client";

export default function TenantError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-800 font-sans px-6">
      <div className="text-center space-y-4 max-w-md">
        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          We hit a snag loading this store. Give it another shot.
        </p>
        <button
          onClick={reset}
          className="inline-block mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
