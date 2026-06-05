"use client";

export function JsonInputSection({
  jsonInput,
  onJsonInputChange,
  onValidate,
}: {
  jsonInput: string;
  onJsonInputChange: (value: string) => void;
  onValidate: () => void;
}) {
  return (
    <section className="rounded-[28px] border border-white/65 bg-white/72 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Step 3
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">
            Paste AI Output
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Valid JSON loads into the shared editor before preview or publish.
          </p>
        </div>
        <button
          type="button"
          onClick={onValidate}
          className="inline-flex items-center justify-center rounded-[18px] bg-[#9f2f1f] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(159,47,31,0.18)] transition hover:-translate-y-0.5 hover:bg-[#882617]"
        >
          Validate to Editor
        </button>
      </div>

      <textarea
        value={jsonInput}
        onChange={(event) => onJsonInputChange(event.target.value)}
        placeholder={`{\n  "topic": "Fundamental Rights",\n  "questions": [\n    {\n      "question": "Which writ can only be issued against a public office?",\n      "answer": "Quo warranto."\n    }\n  ]\n}`}
        className="mt-5 min-h-[320px] w-full rounded-[22px] border border-black/10 bg-[#f8f5ee] px-4 py-4 font-mono text-[13px] leading-6 text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white"
      />
    </section>
  );
}
