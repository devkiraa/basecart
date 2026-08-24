export default function MarketingLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
      <div className="relative flex flex-col items-center space-y-6 z-10">
        <div className="loader" />
        <div className="text-center space-y-1.5">
          <h2 className="text-xs font-black tracking-widest text-slate-900 uppercase">BASECART</h2>
          <p className="text-xs font-semibold text-slate-500">Loading page...</p>
        </div>
      </div>
    </div>
  );
}
