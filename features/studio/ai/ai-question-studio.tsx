"use client";

import { useState } from "react";
import { ProcessingOverlay } from "@/components/studio/panels/processing-overlay";
import { QuizEditorPanel } from "@/features/studio/shared/editor/quiz-editor-panel";
import { QuizPreviewSection } from "@/features/studio/shared/editor/quiz-preview-section";
import { StudioLayout } from "@/features/studio/shared/components/studio-layout";
import { SectionShell } from "@/features/studio/shared/components/section-shell";
import { useStudioWorkspace } from "@/features/studio/shared/hooks/use-studio-workspace";
import { AiPromptEditor } from "./ai-prompt-editor";
import {
  requestAiQuizGeneration,
  requestSourcePreview,
  useAiGeneration,
} from "./hooks/use-ai-generation";

export function AiQuestionStudio() {
  const workspace = useStudioWorkspace({
    draftMode: "ai",
    setupPath: "/studio/ai",
  });
  const ai = useAiGeneration();
  const [showKey, setShowKey] = useState(false);
  const [providerMenuOpen, setProviderMenuOpen] = useState(false);
  const [toolsPanelOpen, setToolsPanelOpen] = useState(false);
  const [promptCopyState, setPromptCopyState] = useState<"idle" | "copied">(
    "idle",
  );
  const [previewCopyState, setPreviewCopyState] = useState<"idle" | "copied">(
    "idle",
  );

  async function handleGenerate() {
    if (!workspace.requireStudioLogin("Generate with AI")) {
      return;
    }
    if (ai.selectedModes.length === 0) {
      workspace.setError("Select at least one question type.");
      return;
    }

    ai.setIsGenerating(true);
    workspace.setError(null);
    workspace.setMessage(null);

    try {
      const result = await requestAiQuizGeneration({
        provider: ai.provider,
        userPrompt: ai.userPrompt,
        apiKey: ai.currentProviderKey,
        selectedModes: ai.selectedModes,
        attachments: workspace.attachments,
      });
      ai.setGeneratedJson(result.rawJson);
      workspace.appendDraftQuiz(
        result.editableQuiz,
        `${ai.provider} generated ${result.quiz.questions.length} questions. Review them in the editor next.`,
      );
    } catch (generationError) {
      workspace.setError(
        generationError instanceof Error
          ? generationError.message
          : "Generation failed.",
      );
    } finally {
      ai.setIsGenerating(false);
    }
  }

  async function handlePreviewSource() {
    if (workspace.attachments.length === 0) {
      workspace.setError("Attach at least one PDF, image, or text file first.");
      return;
    }

    ai.setIsPreviewingSource(true);
    workspace.setError(null);

    try {
      const preview = await requestSourcePreview({
        attachments: workspace.attachments,
        skipPages: 0,
      });
      workspace.setSourcePreview(preview);
      workspace.setSourcePreviewMinimized(false);
      workspace.setMessage(
        "Previewed extracted source text. Review the parser output below before generating.",
      );
    } catch (previewError) {
      workspace.setError(
        previewError instanceof Error
          ? previewError.message
          : "Preview extraction failed.",
      );
    } finally {
      ai.setIsPreviewingSource(false);
    }
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(ai.aiPrompt);
    setPromptCopyState("copied");
    window.setTimeout(() => setPromptCopyState("idle"), 1800);
    workspace.setMessage(
      `Copied the exact ${ai.provider} generation prompt used by this app.`,
    );
    workspace.setError(null);
  }

  async function copySourcePreview() {
    if (!workspace.sourcePreview) {
      return;
    }

    await navigator.clipboard.writeText(workspace.sourcePreview.combinedText);
    setPreviewCopyState("copied");
    window.setTimeout(() => setPreviewCopyState("idle"), 1800);
    workspace.setMessage("Copied the extracted source preview text.");
    workspace.setError(null);
  }

  const processingState = ai.isGenerating
    ? {
        title: "Generating Draft",
        description:
          "Building the quiz draft. This can take a moment depending on the model and prompt.",
      }
    : ai.isPreviewingSource
      ? {
          title: "Extracting Source",
          description:
            "Reading the attached file and preparing extracted text for review.",
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
        title="Generate with AI"
        description="Prompt, attach source material, validate JSON, then edit and save the generated quiz."
        activeView={workspace.activeView}
        stats={workspace.stats}
        providerLabel={ai.provider}
        message={workspace.message}
        error={workspace.error}
        sessionLoaded={workspace.sessionLoaded}
        hasSession={Boolean(workspace.session)}
        hasEditorQuiz={Boolean(workspace.editorQuiz)}
        hasDraftData={workspace.hasDraftData || ai.generatedJson.trim().length > 0}
        editingSlug={workspace.editingSlug}
        isClearingDraft={workspace.isClearingDraft}
        onClearDraft={() => {
          void workspace.handleClearDraftData().then(() => ai.setGeneratedJson(""));
        }}
        onNavigateSetup={() => workspace.setActiveView("setup")}
        onNavigateEditor={() => workspace.editorQuiz && workspace.setActiveView("editor")}
        onNavigatePreview={() => workspace.editorQuiz && workspace.setActiveView("preview")}
      >
        {workspace.activeView === "setup" ? (
          <SectionShell
            title="AI Setup"
            description="A compose-first workspace. Prompt is primary, setup lives in model and tools popups."
            aside={
              <div className="grid gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap xl:justify-end">
                <button
                  type="button"
                  onClick={() => workspace.router.push("/studio")}
                  className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-stone-100"
                >
                  Back To Path Choice
                </button>
                {workspace.editorQuiz ? (
                  <button
                    type="button"
                    onClick={() => workspace.setActiveView("editor")}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    Open Existing Draft
                  </button>
                ) : null}
              </div>
            }
          >
            <AiPromptEditor
              provider={ai.provider}
              providerMenuOpen={providerMenuOpen}
              toolsPanelOpen={toolsPanelOpen}
              userPrompt={ai.userPrompt}
              selectedModes={ai.selectedModes}
              currentProviderKey={ai.currentProviderKey}
              showKey={showKey}
              promptCopyState={promptCopyState}
              previewCopyState={previewCopyState}
              isGenerating={ai.isGenerating}
              isPreviewingSource={ai.isPreviewingSource}
              attachments={workspace.attachments}
              sourcePreview={workspace.sourcePreview}
              sourcePreviewMinimized={workspace.sourcePreviewMinimized}
              onPromptChange={ai.setUserPrompt}
              onPromptKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleGenerate();
                }
              }}
              onAttachmentSelect={workspace.handleAttachmentSelect}
              onRemoveAttachment={workspace.removeAttachment}
              onToggleTools={() => setToolsPanelOpen((value) => !value)}
              onCopyPrompt={() => void copyPrompt()}
              onPreviewSource={() => void handlePreviewSource()}
              onToggleProviderMenu={() => {
                setProviderMenuOpen((value) => !value);
                setToolsPanelOpen(false);
              }}
              onSelectProvider={(provider) => {
                ai.setProvider(provider);
                setProviderMenuOpen(false);
              }}
              onGenerate={() => void handleGenerate()}
              onToggleMode={(mode) =>
                ai.toggleGenerationMode(mode as typeof ai.selectedModes[number])
              }
              onProviderKeyChange={ai.updateProviderKey}
              onToggleShowKey={() => setShowKey((value) => !value)}
              onClearCurrentKey={() => {
                ai.setProviderKeys((current) => ({ ...current, [ai.provider]: "" }));
                setShowKey(false);
                workspace.setMessage(
                  `Cleared the in-memory ${ai.provider} API key for this tab.`,
                );
                workspace.setError(null);
              }}
              onCopySourcePreview={() => void copySourcePreview()}
              onToggleSourcePreview={() =>
                workspace.setSourcePreviewMinimized((current) => !current)
              }
              onClearSourcePreview={() => {
                workspace.setSourcePreview(null);
                workspace.setSourcePreviewMinimized(false);
              }}
            />
            <AiJsonImportPanel
              aiPrompt={ai.aiPrompt}
              provider={ai.provider}
              generatedJson={ai.generatedJson}
              promptCopyState={promptCopyState}
              onCopyPrompt={() => void copyPrompt()}
              onGeneratedJsonChange={ai.setGeneratedJson}
              onValidate={() => workspace.validateGeneratedJson(ai.generatedJson)}
              onClear={() => ai.setGeneratedJson("")}
            />
          </SectionShell>
        ) : null}

        {workspace.activeView === "editor" ? (
          <QuizEditorPanel
            workspace={workspace}
            setupLabel="AI Setup"
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
            setupLabel="AI Setup"
            onBackToSetup={() => workspace.setActiveView("setup")}
          />
        ) : null}
      </StudioLayout>
      <ProcessingOverlay state={processingState} />
    </>
  );
}

function AiJsonImportPanel({
  aiPrompt,
  provider,
  generatedJson,
  promptCopyState,
  onCopyPrompt,
  onGeneratedJsonChange,
  onValidate,
  onClear,
}: {
  aiPrompt: string;
  provider: string;
  generatedJson: string;
  promptCopyState: "idle" | "copied";
  onCopyPrompt: () => void;
  onGeneratedJsonChange: (value: string) => void;
  onValidate: () => void;
  onClear: () => void;
}) {
  return (
    <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[30px] border border-black/10 bg-stone-50 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              External AI Workflow
            </p>
            <h4 className="mt-3 text-2xl font-semibold text-slate-950">
              Generate elsewhere, import here
            </h4>
          </div>
          <button
            type="button"
            onClick={onCopyPrompt}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              promptCopyState === "copied"
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "bg-slate-950 text-white hover:opacity-92"
            }`}
          >
            {promptCopyState === "copied" ? "Prompt Copied" : "Copy Exact Prompt"}
          </button>
        </div>
        <div className="mt-5 rounded-[24px] border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Prompt Used By This App
            </p>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
              {provider}
            </span>
          </div>
          <pre className="popup-scroll mt-3 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-[20px] bg-slate-950 px-4 py-4 text-[11px] leading-6 text-slate-100">
            {aiPrompt}
          </pre>
        </div>
      </div>

      <div className="rounded-[30px] border border-black/10 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          Import JSON
        </p>
        <h4 className="mt-3 text-2xl font-semibold text-slate-950">
          Validate and open draft
        </h4>
        <textarea
          value={generatedJson}
          onChange={(event) => onGeneratedJsonChange(event.target.value)}
          rows={13}
          placeholder="Paste raw quiz JSON here after generating it in another AI tool."
          className="mt-5 w-full rounded-[24px] border border-slate-200 bg-slate-950 px-4 py-4 font-mono text-[12px] leading-6 text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-300"
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onValidate}
            className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Validate JSON
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-stone-50"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
