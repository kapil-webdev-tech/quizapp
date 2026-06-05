"use client";

export function RecallScorePill({
  recalledPoints,
  totalPoints,
}: {
  recalledPoints?: number;
  totalPoints?: number;
}) {
  if (!totalPoints) {
    return (
      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        No score
      </span>
    );
  }

  const percentage = Math.round(((recalledPoints ?? 0) / totalPoints) * 100);

  return (
    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
      {recalledPoints ?? 0}/{totalPoints} · {percentage}%
    </span>
  );
}
