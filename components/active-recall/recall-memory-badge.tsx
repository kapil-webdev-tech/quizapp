"use client";

import type { RecallStatus } from "@/lib/active-recall-store";

const statusClasses: Record<RecallStatus | "untracked", string> = {
  forgot: "bg-rose-100 text-rose-800 border-rose-200",
  partial: "bg-yellow-100 text-yellow-900 border-yellow-200",
  mastered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  untracked: "bg-slate-100 text-slate-600 border-slate-200",
};

export function RecallMemoryBadge({
  status,
}: {
  status?: RecallStatus;
}) {
  const label = status ? status.replace("_", " ") : "untracked";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${statusClasses[status ?? "untracked"]}`}
    >
      {label}
    </span>
  );
}
