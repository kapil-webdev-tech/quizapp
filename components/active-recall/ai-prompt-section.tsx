"use client";

export function AiPromptSection({
  subject,
  topic,
  questionCount,
  generatedPrompt,
  copyState,
  onSubjectChange,
  onTopicChange,
  onQuestionCountChange,
  onGeneratePrompt,
  onCopyPrompt,
}: {
  subject: string;
  topic: string;
  questionCount: number;
  generatedPrompt: string;
  copyState: "idle" | "copied";
  onSubjectChange: (value: string) => void;
  onTopicChange: (value: string) => void;
  onQuestionCountChange: (value: number) => void;
  onGeneratePrompt: () => void;
  onCopyPrompt: () => void;
}) {
  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-white/65 bg-white/72 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Step 1
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">
              Recall Setup
            </h3>
          </div>
          <span className="rounded-full bg-[#1f3a2f] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-50">
            AI Mode
          </span>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Subject
            </span>
            <input
              type="text"
              value={subject}
              onChange={(event) => onSubjectChange(event.target.value)}
              placeholder="Polity, Economy, Environment..."
              className="w-full rounded-[20px] border border-black/10 bg-white/85 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white"
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
              placeholder="Constitutional Bodies, National Parks, Governor Powers..."
              className="w-full rounded-[20px] border border-black/10 bg-white/85 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Question Count
            </span>
            <input
              type="number"
              min={1}
              max={80}
              value={questionCount}
              onChange={(event) =>
                onQuestionCountChange(Number(event.target.value))
              }
              className="w-full rounded-[20px] border border-black/10 bg-white/85 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
            />
          </label>

          <button
            type="button"
            onClick={onGeneratePrompt}
            className="inline-flex items-center justify-center rounded-[20px] bg-[#1f3a2f] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(31,58,47,0.22)] transition hover:-translate-y-0.5 hover:bg-[#163024]"
          >
            Generate Active Recall
          </button>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/65 bg-white/72 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Step 2
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">
              AI Prompt Box
            </h3>
          </div>
          <button
            type="button"
            onClick={onCopyPrompt}
            disabled={!generatedPrompt}
            className="inline-flex items-center justify-center rounded-[18px] border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copyState === "copied" ? "Copied" : "Copy Prompt"}
          </button>
        </div>

        <textarea
          value={generatedPrompt}
          readOnly
          placeholder="Your dynamic Active Recall AI prompt appears here after generation."
          className="mt-5 min-h-[260px] w-full rounded-[22px] border border-black/10 bg-[#f8f5ee] px-4 py-4 font-mono text-[13px] leading-6 text-slate-800 outline-none"
        />
      </section>
    </div>
  );
}
