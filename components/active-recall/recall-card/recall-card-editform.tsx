"use client";

type RecallCardEditFormProps = {
  index: number;
  draftQuestion: string;
  draftAnswer: string;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
  onDraftQuestionChange: (value: string) => void;
  onDraftAnswerChange: (value: string) => void;
};

export default function RecallCardEditForm({
  index,
  draftQuestion,
  draftAnswer,
  isSaving,
  onCancel,
  onSave,
  onDraftQuestionChange,
  onDraftAnswerChange,
}: RecallCardEditFormProps) {
  return (
    <article className="mb-4 break-inside-avoid overflow-hidden rounded-[28px] border border-black/5 bg-[linear-gradient(180deg,#ffffff,#faf8f5)] shadow-[0_16px_50px_rgba(15,23,42,0.08)] print:hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-4 py-3 sm:px-5">
        {/* Left */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#17023a] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
            Card {index + 1}
          </span>

          <div className="flex items-center gap-2 rounded-full border border-[#e5d45f] bg-[#fff7c7] px-3 py-1.5">
            {/* Blinking Dot */}
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>

            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8b6400]">
              Editing Mode
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ✕ Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="rounded-full bg-[#2b0050] px-3.5 py-1.5 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(43,0,80,0.25)] transition-all hover:bg-[#3a006b] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "✓ Save"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-4 p-4 sm:p-5">
        {/* Question */}
        <label className="block">
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Question
          </span>

          <textarea
            value={draftQuestion}
            onChange={(event) => onDraftQuestionChange(event.target.value)}
            placeholder="Write your question..."
            className="min-h-[150px] w-full resize-y rounded-[22px] border border-black/10 bg-white px-4 py-4 text-sm leading-7 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          />
        </label>

        {/* Answer */}
        <label className="block">
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Answer
          </span>

          <textarea
            value={draftAnswer}
            onChange={(event) => onDraftAnswerChange(event.target.value)}
            placeholder="Write your answer..."
            className="min-h-[150px] w-full resize-y rounded-[22px] border border-black/10 bg-white px-4 py-4 text-sm leading-7 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          />
        </label>
      </div>
    </article>
  );
}
