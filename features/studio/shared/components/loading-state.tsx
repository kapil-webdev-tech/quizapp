export function LoadingState({ label = "Loading studio..." }: { label?: string }) {
  return (
    <div className="rounded-[28px] border border-black/10 bg-white/80 p-6 text-sm text-slate-500 shadow-[0_18px_70px_rgba(102,73,24,0.08)]">
      {label}
    </div>
  );
}
