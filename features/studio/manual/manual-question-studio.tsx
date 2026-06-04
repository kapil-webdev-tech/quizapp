"use client";

import { ProcessingOverlay } from "@/components/studio/panels/processing-overlay";
import { QuizEditorPanel } from "@/features/studio/shared/editor/quiz-editor-panel";
import { QuizPreviewSection } from "@/features/studio/shared/editor/quiz-preview-section";
import { StudioLayout } from "@/features/studio/shared/components/studio-layout";
import { useStudioWorkspace } from "@/features/studio/shared/hooks/use-studio-workspace";
import { ManualEditor } from "./manual-editor";

export function ManualQuestionStudio() {
  const workspace = useStudioWorkspace({
    draftMode: "manual",
    setupPath: "/studio/manual",
  });

  const processingState = workspace.isSaving
    ? { title: "Saving Quiz", description: "Writing the current draft to the backend." }
    : workspace.isClearingDraft
      ? {
          title: "Clearing Draft",
          description: "Removing the current draft from this workspace.",
        }
      : null;

  return (
    <>
      <StudioLayout
        title="Write Questions Yourself"
        description="Start from a structured UPSC-style template, edit each question, preview the learner view, and save."
        activeView={workspace.activeView}
        stats={workspace.stats}
        message={workspace.message}
        error={workspace.error}
        sessionLoaded={workspace.sessionLoaded}
        hasSession={Boolean(workspace.session)}
        hasEditorQuiz={Boolean(workspace.editorQuiz)}
        hasDraftData={workspace.hasDraftData}
        editingSlug={workspace.editingSlug}
        isClearingDraft={workspace.isClearingDraft}
        onClearDraft={() => void workspace.handleClearDraftData()}
        onNavigateSetup={() => workspace.setActiveView("setup")}
        onNavigateEditor={() => workspace.editorQuiz && workspace.setActiveView("editor")}
        onNavigatePreview={() => workspace.editorQuiz && workspace.setActiveView("preview")}
      >
        {workspace.activeView === "setup" ? (
          <ManualEditor
            isAddingToSavedQuiz={Boolean(
              workspace.editingSlug && workspace.editIntent === "add",
            )}
            onBack={() => {
              if (workspace.editingSlug && workspace.editIntent === "add") {
                workspace.setEditIntent(null);
                workspace.setActiveView("editor");
                return;
              }
              workspace.router.push("/studio");
            }}
            onStart={(template) => {
              if (!workspace.requireStudioLogin("Write Questions Yourself")) {
                return;
              }
              workspace.startManualQuiz(template);
            }}
          />
        ) : null}

        {workspace.activeView === "editor" ? (
          <QuizEditorPanel
            workspace={workspace}
            setupLabel="Manual Setup"
            onBackToSetup={() => workspace.setActiveView("setup")}
            onAddWithAi={() =>
              workspace.beginAddingQuestions(
                "/studio/ai",
                "Add-more mode enabled. Generate with AI and the new questions will be appended to this quiz.",
              )
            }
            onAddManually={() =>
              workspace.beginAddingQuestions(
                "/studio/manual",
                "Add-more mode enabled. Start with a manual template and the new question will be appended to this quiz.",
              )
            }
            onAddFromPdf={() =>
              workspace.beginAddingQuestions(
                "/studio/pdf",
                "Add-more mode enabled. Import a PDF and the extracted questions will be appended to this quiz.",
              )
            }
          />
        ) : null}

        {workspace.activeView === "preview" ? (
          <QuizPreviewSection
            workspace={workspace}
            setupLabel="Manual Setup"
            onBackToSetup={() => workspace.setActiveView("setup")}
          />
        ) : null}
      </StudioLayout>
      <ProcessingOverlay state={processingState} />
    </>
  );
}
