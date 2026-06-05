"use client";

export function ManualSetupSection({
  subject,
  topic,
  cardCount,
  onSubjectChange,
  onTopicChange,
  onCardCountChange,
  onCreateSheet,
}: {
  subject: string;
  topic: string;
  cardCount: number;
  onSubjectChange: (value: string) => void;
  onTopicChange: (value: string) => void;
  onCardCountChange: (value: number) => void;
  onCreateSheet: () => void;
}) {
  return (
    <section className="rounded-[28px] border border-white/65 bg-white/72 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Manual Recall Builder
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">
            Create Editable Cards
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Pre-create blank cards, then write and preview in the shared editor.
          </p>
        </div>
        <span className="rounded-full bg-[#9f2f1f] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
          Manual Mode
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_180px]">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Subject
          </span>
          <input
            type="text"
            value={subject}
            onChange={(event) => onSubjectChange(event.target.value)}
            placeholder="Polity, Geography..."
            className="w-full rounded-[20px] border border-black/10 bg-white/85 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Topic
          </span>
          <input
            type="text"
            value={topic}
            onChange={(event) => onTopicChange(event.target.value)}
            placeholder="Fundamental Rights..."
            className="w-full rounded-[20px] border border-black/10 bg-white/85 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Card Count
          </span>
          <input
            type="number"
            min={1}
            max={80}
            value={cardCount}
            onChange={(event) => onCardCountChange(Number(event.target.value))}
            className="w-full rounded-[20px] border border-black/10 bg-white/85 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={onCreateSheet}
        className="mt-5 inline-flex items-center justify-center rounded-[20px] bg-[#1f3a2f] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(31,58,47,0.22)] transition hover:-translate-y-0.5 hover:bg-[#163024]"
      >
        Open Shared Editor
      </button>
    </section>
  );
}
