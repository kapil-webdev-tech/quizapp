"use client";

import type { RecallSheet } from "@/lib/active-recall/types";
import { RecallEditorCard } from "./recall-editor-card";
import { RecallToolbar } from "./recall-toolbar";

export function RecallEditor({
  sheet,
  isDirty,
  onAddCard,
  onDeleteCard,
  onUpdateCard,
  onPreview,
  onReset,
}: {
  sheet: RecallSheet | null;
  isDirty: boolean;
  onAddCard: () => void;
  onDeleteCard: (id: string) => void;
  onUpdateCard: (id: string, field: "question" | "answer", value: string) => void;
  onPreview: () => void;
  onReset: () => void;
}) {
  if (!sheet) {
    return (
      <section className="rounded-[28px] border border-dashed border-black/15 bg-white/55 p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          Shared Editor
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-slate-950">
          No cards loaded yet.
        </h3>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-600">
          Generate from AI JSON or initialize a manual sheet to open the same
          editable card workspace.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <RecallToolbar
        cardCount={sheet.questions.length}
        isDirty={isDirty}
        onAddCard={onAddCard}
        onPreview={onPreview}
        onReset={onReset}
      />

      <div className="space-y-4">
        {sheet.questions.map((card, index) => (
          <RecallEditorCard
            key={card.id}
            card={card}
            index={index}
            canDelete={sheet.questions.length > 1}
            onDelete={onDeleteCard}
            onUpdate={onUpdateCard}
          />
        ))}
      </div>
    </section>
  );
}
