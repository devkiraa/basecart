export default function AdminPanelLoading() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center font-sans">
      <div className="relative flex flex-col items-center space-y-6 z-10">
        <div className="loader opacity-90 invert" />
        <div className="text-center space-y-1.5">
          <h2 className="text-xs font-black tracking-widest text-slate-200 uppercase">BASECART ADMIN</h2>
          <p className="text-xs font-semibold text-slate-400">Loading admin console...</p>
        </div>
      </div>
    </div>
  );
}
