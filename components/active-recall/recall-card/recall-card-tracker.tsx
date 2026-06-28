"use client";

import { X, Star, Check } from "lucide-react";
import type {
  RecallStatus,
  UserRecallProgress,
} from "@/lib/active-recall-store";
import { cn } from "@/lib/cn";

const actions: Array<{
  label: string;
  icon: any;
  status: RecallStatus;
  recalledPoints: number;
  activeClass: string;
  hoverClass: string;
  iconBgActive: string;
  iconColorUnselected: string;
  iconBgUnselected: string;
}> = [
  {
    label: "Forgot",
    icon: X,
    status: "forgot",
    recalledPoints: 0,
    activeClass: "bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-600/30",
    hoverClass: "hover:border-rose-200 hover:bg-rose-50/80 hover:text-rose-600",
    iconBgActive: "bg-white/20",
    iconColorUnselected: "text-rose-600",
    iconBgUnselected: "bg-rose-50",
  },
  {
    label: "Partial",
    icon: Star,
    status: "partial",
    recalledPoints: 1,
    activeClass: "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/30",
    hoverClass: "hover:border-amber-200 hover:bg-amber-50/80 hover:text-amber-600",
    iconBgActive: "bg-white/20",
    iconColorUnselected: "text-amber-600",
    iconBgUnselected: "bg-amber-50",
  },
  {
    label: "Mastered",
    icon: Check,
    status: "mastered",
    recalledPoints: 1,
    activeClass: "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/30",
    hoverClass: "hover:border-emerald-200 hover:bg-emerald-50/80 hover:text-emerald-600",
    iconBgActive: "bg-white/20",
    iconColorUnselected: "text-emerald-600",
    iconBgUnselected: "bg-emerald-50",
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
      className="mt-6 space-y-3 rounded-3xl border border-white/40 bg-white/40 p-3 shadow-xl backdrop-blur-xl ring-1 ring-black/5 sm:p-4 print:hidden"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500/70">
          Rate Recall
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => {
          const isSelected = currentStatus === action.status;
          const Icon = action.icon;

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
              className={cn(
                "group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 py-2 sm:py-2.5",
                isSelected 
                  ? action.activeClass 
                  : cn("border-black/[0.03] bg-white/80 text-slate-600", action.hoverClass)
              )}
            >
              <div className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 sm:h-8 sm:w-8",
                isSelected ? action.iconBgActive : action.iconBgUnselected
              )}>
                <Icon className={cn("h-3.5 w-3.5 transition-all duration-300 sm:h-4 sm:w-4", 
                  isSelected ? "scale-110 text-white" : action.iconColorUnselected
                )} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-tight sm:text-[10px] sm:tracking-wider">
                {action.label}
              </span>
              
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 h-1 w-1 rounded-full bg-white animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
