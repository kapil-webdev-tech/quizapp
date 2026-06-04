import type { QuizSet } from "@/lib/quiz-types";
import { QuizPrompt } from "@/components/quiz/quiz-prompt";

type QuizPreviewPanelProps = {
  quiz: QuizSet | null;
  issueMessage?: string;
  onDeleteQuestion: (index: number) => void;
};

export function QuizPreviewPanel({
  quiz,
  issueMessage,
  onDeleteQuestion,
}: QuizPreviewPanelProps) {
  if (!quiz) {
    return (
      <div className="rounded-[24px] border border-amber-300 bg-amber-50/80 p-6 text-sm leading-7 text-amber-950">
        <p className="font-semibold text-amber-950">
          Preview is unavailable until the draft passes quiz validation.
        </p>
        <p className="mt-2">
          {issueMessage ?? "Fill the missing fields in the editor first."}
        </p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
          Highlighted fields in the editor need attention.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] bg-[#f6f2df] p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          <span>{quiz.category}</span>
          <span>{quiz.questions.length} Questions</span>
          <span>{quiz.durationMinutes} Min</span>
        </div>
        <h3 className="mt-4 text-3xl font-semibold leading-tight text-slate-950">
          {quiz.title}
        </h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
          {quiz.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {quiz.focusAreas.map((focusArea) => (
            <span
              key={focusArea}
              className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              {focusArea}
            </span>
          ))}
          <span
            className={`rounded-full border px-3 py-2 text-xs font-semibold ${
              quiz.isPublic
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-black/10 bg-white text-slate-700"
            }`}
          >
            {quiz.isPublic ? "Public quiz" : "Private quiz"}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {quiz.questions.map((question, index) => (
          <article
            key={question.id}
            className="rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_18px_70px_rgba(102,73,24,0.08)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                <span>Question {index + 1}</span>
                <span>{question.difficulty}</span>
                <span>{question.topic}</span>
                {(question.tags ?? []).map((tag) => (
                  <span key={`${question.id}-${tag}`}>{tag}</span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onDeleteQuestion(index)}
                disabled={quiz.questions.length <= 1}
                className="shrink-0 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Delete Question
              </button>
            </div>
            <QuizPrompt prompt={question.prompt} variant="preview" />
            <div className="mt-5 grid gap-3">
              {question.options.map((option) => (
                <div
                  key={option.id}
                  className="rounded-2xl border border-black/10 bg-stone-50 px-4 py-4 text-sm font-medium leading-6 text-slate-800"
                >
                  <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-semibold uppercase text-slate-500">
                    {option.id}
                  </span>
                  {option.text}
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
