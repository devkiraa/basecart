export default function TenantLoading() {
  return (
    <div className="space-y-16 animate-pulse">
      {/* Header skeleton */}
      <div className="h-6 w-48 bg-slate-200 rounded" />

      {/* Hero banner skeleton */}
      <section className="py-16 px-6 bg-slate-100 rounded-2xl max-w-5xl mx-auto space-y-4">
        <div className="h-10 w-3/4 bg-slate-200 rounded mx-auto" />
        <div className="h-4 w-1/2 bg-slate-200 rounded mx-auto" />
      </section>

      {/* Product grid skeleton */}
      <section className="space-y-8">
        <div className="h-6 w-40 bg-slate-200 rounded" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm flex flex-col"
            >
              {/* Image skeleton */}
              <div className="h-64 bg-slate-200" />

              {/* Content skeleton */}
              <div className="p-6 space-y-3">
                <div className="h-5 w-2/3 bg-slate-200 rounded" />
                <div className="h-3 w-full bg-slate-200 rounded" />
                <div className="h-3 w-5/6 bg-slate-200 rounded" />
                <div className="flex items-center justify-between pt-2">
                  <div className="h-6 w-16 bg-slate-200 rounded" />
                  <div className="h-8 w-24 bg-slate-200 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
