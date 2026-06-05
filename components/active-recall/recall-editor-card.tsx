"use client";

import { GripVertical, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import type { RecallCard } from "@/lib/active-recall/types";

function AutoTextarea({
  value,
  placeholder,
  minHeight,
  onChange,
}: {
  value: string;
  placeholder: string;
  minHeight: number;
  onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.style.height = "auto";
    ref.current.style.height = `${Math.max(ref.current.scrollHeight, minHeight)}px`;
  }, [minHeight, value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="max-h-[520px] min-h-[120px] w-full resize-y overflow-auto rounded-[18px] border border-black/10 bg-[#f8f5ee] px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white"
      style={{ minHeight }}
    />
  );
}

export function RecallEditorCard({
  card,
  index,
  canDelete,
  onDelete,
  onUpdate,
}: {
  card: RecallCard;
  index: number;
  canDelete: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, field: "question" | "answer", value: string) => void;
}) {
  return (
    <article className="group rounded-[24px] border border-black/10 bg-white/82 p-5 shadow-[0_16px_44px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_54px_rgba(15,23,42,0.1)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-[#17153a] text-sm font-semibold text-white">
            {index + 1}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Recall Card
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Reorder ready
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex size-9 items-center justify-center rounded-full border border-black/10 bg-white text-slate-400">
            <GripVertical className="size-4" />
          </span>
          <button
            type="button"
            onClick={() => onDelete(card.id)}
            disabled={!canDelete}
            className="inline-flex size-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-45"
            aria-label={`Delete card ${index + 1}`}
            title="Delete card"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Question
          </span>
          <AutoTextarea
            value={card.question}
            placeholder="Enter a question, note block, or numbered mini-question set..."
            minHeight={150}
            onChange={(value) => onUpdate(card.id, "question", value)}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Answer
          </span>
          <AutoTextarea
            value={card.answer}
            placeholder="Enter the answer. Line breaks, numbering, and spacing are preserved."
            minHeight={150}
            onChange={(value) => onUpdate(card.id, "answer", value)}
          />
        </label>
      </div>
    </article>
  );
}
