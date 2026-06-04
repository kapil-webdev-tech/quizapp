"use client";

import { QuizPreviewPanel } from "@/components/studio/preview/quiz-preview-panel";
import { SectionShell } from "../components/section-shell";
import type { useStudioWorkspace } from "../hooks/use-studio-workspace";

type Workspace = ReturnType<typeof useStudioWorkspace>;

type QuizPreviewSectionProps = {
  workspace: Workspace;
  setupLabel: string;
  onBackToSetup: () => void;
};

export function QuizPreviewSection({
  workspace,
  setupLabel,
  onBackToSetup,
}: QuizPreviewSectionProps) {
  const {
    editingSlug,
    editIntent,
    setEditIntent,
    setActiveView,
    previewState,
    session,
    isSaving,
    handleSave,
    removeQuestion,
  } = workspace;

  return (
    <SectionShell
      title="Preview"
      description="Review the draft exactly as a learner will scan it before you save it."
      aside={
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveView("editor")}
            className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-stone-100"
          >
            Back To Editor
          </button>
          <button
            type="button"
            onClick={() => {
              if (editingSlug && editIntent === "update") {
                setEditIntent(null);
                setActiveView("editor");
                return;
              }
              onBackToSetup();
            }}
            className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-stone-100"
          >
            {editingSlug && editIntent === "update"
              ? "Back To Edit Options"
              : `Back To ${setupLabel}`}
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!previewState.quiz || !session || isSaving}
            className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving
              ? "Saving..."
              : session
                ? editingSlug
                  ? "Save Changes"
                  : "Save Quiz"
                : "Sign In To Save"}
          </button>
        </div>
      }
    >
      <QuizPreviewPanel
        quiz={previewState.quiz}
        issueMessage={previewState.issue?.message}
        onDeleteQuestion={removeQuestion}
      />
    </SectionShell>
  );
}
