"use client";

import type {
  RecallStatus,
  UserRecallProgress,
} from "@/lib/active-recall-store";

const selectedClassMap = {
  forgot: "border-rose-500 bg-rose-500 text-white",

  partial: "border-yellow-500 bg-yellow-500 text-white",

  mastered: "border-emerald-500 bg-emerald-500 text-white",
  untracked: "",
} as const;

const actions: Array<{
  label: string;
  icon: string;
  status: RecallStatus;
  recalledPoints: number;
  selectedClassName: string;
}> = [
  {
    label: "Forgot",
    icon: "✕",
    status: "forgot",
    recalledPoints: 0,
    selectedClassName:
      "border-rose-500 bg-gradient-to-b from-rose-500 to-pink-700 text-white shadow-[0_12px_28px_rgba(244,63,94,0.35)]",
  },
  {
    label: "Partial",
    icon: "★",
    status: "partial",
    recalledPoints: 1,
    selectedClassName:
      "border-amber-500 bg-gradient-to-b from-amber-400 to-yellow-600 text-white shadow-[0_6px_16px_rgba(245,158,11,0.18)]",
  },
  {
    label: "Mastered",
    icon: "✓",
    status: "mastered",
    recalledPoints: 1,
    selectedClassName:
      "border-emerald-500 bg-gradient-to-b from-emerald-500 to-green-700 text-white shadow-[0_12px_28px_rgba(16,185,129,0.35)]",
  },
];

export function RecallCardTracker({
  progress,
  isSaving,
  disabled,
  onTrack,
}: {
  progress?: UserRecallProgress;
  isSaving: boolean;
  disabled: boolean;
  onTrack: (
    input: {
      recallStatus: RecallStatus;
      recalledPoints: number;
      totalPoints: number;
    } | null,
  ) => void;
}) {
  const currentStatus = progress?.recallStatus;
  return (
    <div
      className="mt-4 rounded-[24px] border border-black/10 bg-white/85 p-4 print:hidden"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Rating Your Recall
        </p>
      </div>

      <div className="flex items-center gap-2">
        {actions.map((action) => {
          const isSelected = currentStatus === action.status;

          return (
            <button
              key={action.status}
              type="button"
              disabled={disabled || isSaving}
              onClick={(event) => {
                event.stopPropagation();

                if (isSelected) {
                  onTrack(null);
                  return;
                }
                onTrack({
                  recallStatus: action.status,
                  recalledPoints: action.recalledPoints,
                  totalPoints: 1,
                });
              }}
              className={`
  flex items-center gap-1.5
  rounded-xl border
  px-2.5 py-1.5
  text-xs font-semibold
  transition-all duration-200
  hover:-translate-y-0.5
  disabled:cursor-not-allowed
  disabled:opacity-50
  ${
    isSelected
      ? action.selectedClassName
      : "border-black/10 bg-white text-slate-700 hover:bg-slate-50"
  }
`}
            >
              <span className="text-base leading-none">{action.icon}</span>

              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
