"use client";

import { QuizEditorPanel } from "@/features/studio/shared/editor/quiz-editor-panel";
import { QuizPreviewSection } from "@/features/studio/shared/editor/quiz-preview-section";
import { StudioLayout } from "@/features/studio/shared/components/studio-layout";
import { useStudioWorkspace } from "@/features/studio/shared/hooks/use-studio-workspace";
import { PdfUploadZone } from "./pdf-upload-zone";
import { PdfProcessingPanel } from "./pdf-processing-panel";
import {
  requestPdfQuizImport,
  requestPdfSourcePreview,
  usePdfImport,
} from "./hooks/use-pdf-import";

export function PdfQuestionStudio() {
  const workspace = useStudioWorkspace({
    draftMode: "pdf",
    setupPath: "/studio/pdf",
  });
  const pdf = usePdfImport();

  async function handlePreviewSource() {
    if (workspace.attachments.length === 0) {
      workspace.setError("Attach a UPSC PDF first.");
      workspace.setMessage(null);
      return;
    }

    pdf.setIsPreviewingSource(true);
    workspace.setError(null);

    try {
      const preview = await requestPdfSourcePreview({
        attachments: workspace.attachments,
        skipPages: pdf.pdfSkipPages,
      });
      workspace.setSourcePreview(preview);
      workspace.setSourcePreviewMinimized(false);
      workspace.setMessage(
        "Previewed extracted source text. Review the parser output below before importing.",
      );
    } catch (previewError) {
      workspace.setError(
        previewError instanceof Error
          ? previewError.message
          : "Preview extraction failed.",
      );
    } finally {
      pdf.setIsPreviewingSource(false);
    }
  }

  async function handleImportPdfQuiz() {
    const pdfAttachment = workspace.attachments.find(
      (attachment) => attachment.kind === "pdf",
    );

    if (!pdfAttachment) {
      workspace.setError("Attach a UPSC PDF first.");
      workspace.setMessage(null);
      return;
    }

    pdf.setIsImportingPdf(true);
    workspace.setError(null);
    workspace.setMessage(null);

    try {
      const data = await requestPdfQuizImport({
        attachment: pdfAttachment,
        skipPages: pdf.pdfSkipPages,
      });
      workspace.appendDraftQuiz(
        data.quiz,
        `Imported ${data.extractedQuestionCount ?? data.quiz.questions.length} ${data.examType === "csat" ? "CSAT" : "GS"} questions from PDF.`,
      );

      const importWarnings = data.warnings ?? [];
      if (importWarnings.length > 0) {
        workspace.setMessage((current) =>
          `${current ?? ""}${current ? " " : ""}${importWarnings.join(" ")}`.trim(),
        );
      }
    } catch (importError) {
      workspace.setError(
        importError instanceof Error ? importError.message : "PDF import failed.",
      );
      workspace.setMessage(null);
    } finally {
      pdf.setIsImportingPdf(false);
    }
  }

  const processingState = pdf.isPreviewingSource
    ? {
        title: "Extracting Source",
        description:
          "Reading the attached file and preparing extracted text for review.",
      }
    : pdf.isImportingPdf
      ? {
          title: "Importing PDF Test",
          description:
            "Parsing the uploaded paper and converting it into editable questions.",
        }
      : workspace.isSaving
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
        title="Import PDF Test"
        description="Upload a UPSC prelims paper PDF, preview extraction, import parsed questions, then edit and save."
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
          <PdfUploadZone
            attachments={workspace.attachments}
            sourcePreview={workspace.sourcePreview}
            sourcePreviewMinimized={workspace.sourcePreviewMinimized}
            pdfSkipPages={pdf.pdfSkipPages}
            isPreviewingSource={pdf.isPreviewingSource}
            isImportingPdf={pdf.isImportingPdf}
            hasEditorQuiz={Boolean(workspace.editorQuiz)}
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
            onOpenEditor={() => workspace.setActiveView("editor")}
            onAttachmentSelect={workspace.handleAttachmentSelect}
            onRemoveAttachment={workspace.removeAttachment}
            onPreviewSource={() => void handlePreviewSource()}
            onImportPdf={() => void handleImportPdfQuiz()}
            onSkipPagesChange={pdf.setPdfSkipPages}
            onTogglePreview={() =>
              workspace.setSourcePreviewMinimized((value) => !value)
            }
          />
        ) : null}

        {workspace.activeView === "editor" ? (
          <QuizEditorPanel
            workspace={workspace}
            setupLabel="PDF Import"
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
            setupLabel="PDF Import"
            onBackToSetup={() => workspace.setActiveView("setup")}
          />
        ) : null}
      </StudioLayout>
      <PdfProcessingPanel state={processingState} />
    </>
  );
}
