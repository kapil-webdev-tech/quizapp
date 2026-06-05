"use client";

import { Eye, Plus, RotateCcw } from "lucide-react";

export function RecallToolbar({
  cardCount,
  isDirty,
  onAddCard,
  onPreview,
  onReset,
}: {
  cardCount: number;
  isDirty: boolean;
  onAddCard: () => void;
  onPreview: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[24px] border border-white/65 bg-white/72 p-4 shadow-[0_14px_42px_rgba(15,23,42,0.07)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
          {cardCount} Card{cardCount === 1 ? "" : "s"}
        </span>
        <span className="rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-950">
          {isDirty ? "Unsaved changes" : "Ready"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-[18px] border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-stone-50"
        >
          <RotateCcw className="size-4" />
          Reset
        </button>
        <button
          type="button"
          onClick={onAddCard}
          className="inline-flex items-center gap-2 rounded-[18px] border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-stone-50"
        >
          <Plus className="size-4" />
          Add Card
        </button>
        <button
          type="button"
          onClick={onPreview}
          className="inline-flex items-center gap-2 rounded-[18px] bg-[#9f2f1f] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(159,47,31,0.18)] transition hover:-translate-y-0.5 hover:bg-[#882617]"
        >
          <Eye className="size-4" />
          Open Preview
        </button>
      </div>
    </div>
  );
}
