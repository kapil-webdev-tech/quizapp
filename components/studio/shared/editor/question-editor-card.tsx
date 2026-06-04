import type { KeyboardEvent } from "react";
import type { EditableQuestion } from "@/lib/custom-quiz-store";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icon";
import { Edit2, Trash2, X } from "react-feather";

type ValidationIssue = {
  field:
    | "title"
    | "category"
    | "description"
    | "durationMinutes"
    | "focusAreas"
    | "questions"
    | "prompt"
    | "options"
    | "answer"
    | "explanation"
    | "difficulty"
    | "topic"
    | null;
  questionIndex: number | null;
};

const difficultyOptions = ["Easy", "Moderate", "Hard"] as const;
const answerOptions = ["a", "b", "c", "d"] as const;

type QuestionEditorCardProps = {
  question: EditableQuestion;
  questionIndex: number;
  questionCount: number;
  open: boolean;
  questionType: string;
  validationIssue: ValidationIssue | null;
  tagInput: string;
  onToggleOpen: () => void;
  onRemoveQuestion: () => void;
  onQuestionChange: (question: EditableQuestion) => void;
  onTagInputChange: (value: string) => void;
  onAddTags: (rawValue: string) => void;
  onRemoveTag: (tag: string, event: React.MouseEvent<HTMLButtonElement>) => void;
};

export function QuestionEditorCard({
  question,
  questionIndex,
  questionCount,
  open,
  questionType,
  validationIssue,
  tagInput,
  onToggleOpen,
  onRemoveQuestion,
  onQuestionChange,
  onTagInputChange,
  onAddTags,
  onRemoveTag,
}: QuestionEditorCardProps) {
  const questionHasIssue = validationIssue?.questionIndex === questionIndex;

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      onAddTags(tagInput);
    }
  }

  return (
    <article
      className={`overflow-hidden rounded-[24px] border ${
        questionHasIssue
          ? "border-amber-300 bg-amber-50/80"
          : "border-black/10 bg-stone-50"
      }`}
    >
      <button
        type="button"
        onClick={onToggleOpen}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Question {questionIndex + 1}
            </p>
            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {questionType}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm font-semibold text-slate-900">
            {question.prompt || "Untitled question"}
          </p>
        </div>
        <span
          className="inline-flex shrink-0 items-center rounded-full border border-black/10 bg-white p-2 text-slate-500"
          title={open ? "Hide question details" : "Edit question"}
          aria-label={open ? "Hide question details" : "Edit question"}
        >
          <Edit2 className="h-4 w-4" />
        </span>
      </button>

      {open ? (
        <div className="border-t border-black/8 bg-white px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900">
              Question Details
            </p>
            <Button
              type="button"
              variant="danger"
              size="icon"
              onClick={onRemoveQuestion}
              disabled={questionCount <= 1}
              title="Delete question"
              aria-label="Delete question"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Prompt
            </span>
            <textarea
              value={question.prompt}
              onChange={(event) =>
                onQuestionChange({ ...question, prompt: event.target.value })
              }
              rows={5}
              className={getValidationClass(
                questionHasIssue && validationIssue?.field === "prompt",
                "w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm leading-7 text-slate-900 outline-none focus:border-amber-400",
              )}
            />
          </label>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {question.options.map((option, optionIndex) => (
              <label key={optionIndex} className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Option {String.fromCharCode(65 + optionIndex)}
                </span>
                <input
                  value={option}
                  onChange={(event) =>
                    onQuestionChange({
                      ...question,
                      options: question.options.map((entry, index) =>
                        index === optionIndex ? event.target.value : entry,
                      ) as EditableQuestion["options"],
                    })
                  }
                  className={getValidationClass(
                    questionHasIssue && validationIssue?.field === "options",
                    "w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400",
                  )}
                />
              </label>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Correct Answer
              </span>
              <select
                value={question.answer}
                onChange={(event) =>
                  onQuestionChange({
                    ...question,
                    answer: event.target.value as EditableQuestion["answer"],
                  })
                }
                className={getValidationClass(
                  questionHasIssue && validationIssue?.field === "answer",
                  "w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400",
                )}
              >
                {answerOptions.map((answer) => (
                  <option key={answer} value={answer}>
                    {answer.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Difficulty
              </span>
              <select
                value={question.difficulty}
                onChange={(event) =>
                  onQuestionChange({
                    ...question,
                    difficulty: event.target
                      .value as EditableQuestion["difficulty"],
                  })
                }
                className={getValidationClass(
                  questionHasIssue && validationIssue?.field === "difficulty",
                  "w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400",
                )}
              >
                {difficultyOptions.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Topic
              </span>
              <input
                value={question.topic}
                onChange={(event) =>
                  onQuestionChange({ ...question, topic: event.target.value })
                }
                className={getValidationClass(
                  questionHasIssue && validationIssue?.field === "topic",
                  "w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400",
                )}
              />
            </label>
            <div className="mt-4 block sm:col-span-3">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Subtopic Tags
              </span>
              <div className="rounded-2xl border border-black/10 bg-stone-50 px-3 py-3">
                <div className="flex flex-wrap gap-2">
                  {(question.tags ?? []).map((tag) => (
                    <div
                      key={`${questionIndex}-${tag}`}
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={(event) => onRemoveTag(tag, event)}
                        className="rounded-full p-0.5 text-slate-400 transition hover:bg-stone-100 hover:text-slate-700"
                        aria-label={`Remove ${tag}`}
                      >
                        <X className="pointer-events-none h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={tagInput}
                    onChange={(event) => onTagInputChange(event.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Add subtopic tag and press Enter"
                    className="w-full bg-transparent px-1 py-1 text-sm text-slate-900 outline-none placeholder:text-slate-500"
                  />
                  <Button
                    type="button"
                    variant="warning"
                    size="sm"
                    disabled={!tagInput.trim()}
                    onClick={() => onAddTags(tagInput)}
                    className="gap-1.5"
                  >
                    <PlusIcon />
                    <span className="text-xs font-semibold">Tag</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Explanation
            </span>
            <textarea
              value={question.explanation}
              onChange={(event) =>
                onQuestionChange({
                  ...question,
                  explanation: event.target.value,
                })
              }
              rows={3}
              className={getValidationClass(
                questionHasIssue && validationIssue?.field === "explanation",
                "w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm leading-7 text-slate-900 outline-none focus:border-amber-400",
              )}
            />
          </label>
        </div>
      ) : null}
    </article>
  );
}

function getValidationClass(active: boolean, baseClass: string) {
  return active
    ? `${baseClass} border-amber-300 bg-amber-50/80 focus:border-amber-500`
    : baseClass;
}
