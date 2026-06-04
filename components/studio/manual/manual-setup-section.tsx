import SectionShell from "@/components/ui/section/section-shell";

type ManualSetupSectionProps<TTemplate extends string> = {
  templates: TTemplate[];
  isAddingToSavedQuiz: boolean;
  onBack: () => void;
  onStart: (template: TTemplate) => void;
};

export function ManualSetupSection<TTemplate extends string>({
  templates,
  isAddingToSavedQuiz,
  onBack,
  onStart,
}: ManualSetupSectionProps<TTemplate>) {
  return (
    <SectionShell
      title="Manual Setup"
      description="Choose the question template that best matches how you want to start writing."
      aside={
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-stone-100"
        >
          {isAddingToSavedQuiz ? "Back To Edit Options" : "Back To Path Choice"}
        </button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {templates.map((template) => (
          <button
            key={template}
            type="button"
            onClick={() => onStart(template)}
            className="rounded-[24px] border border-black/10 bg-stone-50 p-5 text-left transition hover:bg-white hover:shadow-[0_16px_48px_rgba(15,23,42,0.08)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Template
            </p>
            <h3 className="mt-3 text-lg font-semibold text-slate-950">
              {template}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Start the draft with this question structure, then edit content in
              the next step.
            </p>
          </button>
        ))}
      </div>
    </SectionShell>
  );
}
