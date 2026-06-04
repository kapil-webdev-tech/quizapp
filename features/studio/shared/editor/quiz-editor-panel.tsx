"use client";

import type { Dispatch, SetStateAction } from "react";
import { X } from "react-feather";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icon";
import { ActionCard } from "@/components/studio/primitives/action-card";
import { QuestionEditorCard } from "@/components/studio/shared/editor/question-editor-card";
import { BulkImportModal } from "@/components/studio/modals/bulk-import-modal";
import type { EditableQuiz } from "@/lib/custom-quiz-store";
import type { useStudioWorkspace } from "../hooks/use-studio-workspace";
import { SectionShell } from "../components/section-shell";
import {
  getValidationClass,
  inferQuestionType,
  questionTemplateLabels,
} from "../utils/quiz-draft-utils";
import type { QuestionTemplateLabel } from "../types";

type Workspace = ReturnType<typeof useStudioWorkspace>;

type QuizEditorPanelProps = {
  workspace: Workspace;
  setupLabel: string;
  onBackToSetup: () => void;
  onAddWithAi: () => void;
  onAddManually: () => void;
  onAddFromPdf: () => void;
};

export function QuizEditorPanel({
  workspace,
  setupLabel,
  onBackToSetup,
  onAddWithAi,
  onAddManually,
  onAddFromPdf,
}: QuizEditorPanelProps) {
  const {
    editorQuiz,
    editingSlug,
    editIntent,
    setEditIntent,
    setActiveView,
    previewState,
    focusAreaInput,
    setFocusAreaInput,
    questionTagInputs,
    openQuestionIndex,
    setOpenQuestionIndex,
    setQuestionTagInputs,
    setEditorQuiz,
    appendQuestion,
    addFocusAreaTag,
    removeFocusAreaTag,
    addQuestionTags,
    removeQuestionTag,
    removeQuestion,
    updateQuestion,
    openBulkTool,
    beginEditingExistingQuestions,
  } = workspace;

  const validationIssue = previewState.issue;

  return (
    <>
      <SectionShell
        title="Editor"
        description="Edit the draft, add more template questions if needed, then move to preview."
        aside={
          <EditorActions
            editingSlug={editingSlug}
            editIntent={editIntent}
            setupLabel={setupLabel}
            hasEditorQuiz={Boolean(editorQuiz)}
            onBack={() => {
              if (editingSlug && editIntent === "update") {
                setEditIntent(null);
                setActiveView("editor");
                return;
              }
              onBackToSetup();
            }}
            onBulkAnswers={() => openBulkTool("answers")}
            onBulkSolutions={() => openBulkTool("solutions")}
            onPreview={() => setActiveView("preview")}
          />
        }
      >
        {!editorQuiz ? (
          <EmptyDraftState />
        ) : editingSlug && !editIntent ? (
          <SavedQuizActionPanel
            onUpdate={beginEditingExistingQuestions}
            onAddWithAi={onAddWithAi}
            onAddManually={onAddManually}
            onAddFromPdf={onAddFromPdf}
          />
        ) : (
          <EditorForm
            editorQuiz={editorQuiz}
            validationIssue={validationIssue}
            focusAreaInput={focusAreaInput}
            questionTagInputs={questionTagInputs}
            setQuestionTagInputs={setQuestionTagInputs}
            openQuestionIndex={openQuestionIndex}
            setOpenQuestionIndex={setOpenQuestionIndex}
            setEditorQuiz={setEditorQuiz}
            setFocusAreaInput={setFocusAreaInput}
            appendQuestion={appendQuestion}
            addFocusAreaTag={addFocusAreaTag}
            removeFocusAreaTag={removeFocusAreaTag}
            addQuestionTags={addQuestionTags}
            removeQuestionTag={removeQuestionTag}
            removeQuestion={removeQuestion}
            updateQuestion={updateQuestion}
          />
        )}
      </SectionShell>
      <BulkImportModal
        key={`${workspace.bulkToolMode}-${workspace.bulkToolOpen ? "open" : "closed"}-${editorQuiz ? "draft" : "empty"}`}
        mode={workspace.bulkToolMode}
        isOpen={workspace.bulkToolOpen && Boolean(editorQuiz)}
        onClose={() => workspace.setBulkToolOpen(false)}
        onModeChange={(modeValue) => {
          workspace.setBulkToolMode(modeValue);
          workspace.setBulkPreviewOpen(false);
        }}
        inputValue={
          workspace.bulkToolMode === "answers"
            ? workspace.bulkAnswerKeyInput
            : workspace.bulkSolutionInput
        }
        onInputChange={(value) => {
          if (workspace.bulkToolMode === "answers") {
            workspace.setBulkAnswerKeyInput(value);
            return;
          }
          workspace.setBulkSolutionInput(value);
        }}
        onApply={() => {
          if (workspace.bulkToolMode === "answers") {
            workspace.applyBulkAnswerKey(workspace.bulkAnswerKeyInput);
            return;
          }
          workspace.applyBulkSolutions(workspace.bulkSolutionInput);
        }}
        onFileSelect={
          workspace.bulkToolMode === "answers"
            ? workspace.handleAnswerKeyFileImport
            : workspace.handleSolutionsFileImport
        }
        isImporting={
          workspace.bulkToolMode === "answers"
            ? workspace.isImportingAnswerKey
            : workspace.isImportingSolutions
        }
        summary={
          workspace.bulkToolMode === "answers"
            ? workspace.bulkAnswerKeySummary
            : workspace.bulkSolutionSummary
        }
        skipPages={workspace.bulkImportSkipPages}
        onSkipPagesChange={workspace.setBulkImportSkipPages}
        isApplied={
          workspace.bulkToolMode === "answers"
            ? workspace.bulkAnswerKeyApplied
            : workspace.bulkSolutionApplied
        }
        detectedCount={workspace.bulkDetection.detectedCount}
        previewText={workspace.bulkDetection.previewText}
        previewOpen={workspace.bulkPreviewOpen}
        onTogglePreview={() =>
          workspace.setBulkPreviewOpen((current) => !current)
        }
      />
    </>
  );
}

function EditorActions({
  editingSlug,
  editIntent,
  setupLabel,
  hasEditorQuiz,
  onBack,
  onBulkAnswers,
  onBulkSolutions,
  onPreview,
}: {
  editingSlug: string | null;
  editIntent: "update" | "add" | null;
  setupLabel: string;
  hasEditorQuiz: boolean;
  onBack: () => void;
  onBulkAnswers: () => void;
  onBulkSolutions: () => void;
  onPreview: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {editingSlug ? (
        <span className="inline-flex items-center rounded-full bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-950">
          Editing saved set
        </span>
      ) : null}
      <button
        type="button"
        onClick={onBack}
        className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-stone-100"
      >
        {editingSlug && editIntent === "update"
          ? "Back To Edit Options"
          : `Back To ${setupLabel}`}
      </button>
      <button
        type="button"
        onClick={onBulkAnswers}
        disabled={!hasEditorQuiz}
        className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Bulk Answers
      </button>
      <button
        type="button"
        onClick={onBulkSolutions}
        disabled={!hasEditorQuiz}
        className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Bulk Solutions
      </button>
      <button
        type="button"
        onClick={onPreview}
        disabled={!hasEditorQuiz}
        className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Preview
      </button>
    </div>
  );
}

function EmptyDraftState() {
  return (
    <div className="rounded-[24px] border border-dashed border-black/15 bg-stone-50 p-6 text-sm leading-7 text-slate-500">
      No draft yet. Choose a path first, then generate or start writing.
    </div>
  );
}

function SavedQuizActionPanel({
  onUpdate,
  onAddWithAi,
  onAddManually,
  onAddFromPdf,
}: {
  onUpdate: () => void;
  onAddWithAi: () => void;
  onAddManually: () => void;
  onAddFromPdf: () => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ActionCard
        eyebrow="Update Quiz"
        title="Edit existing questions"
        description="Update current questions, adjust metadata, and delete any individual question from this saved quiz."
      >
        <button
          type="button"
          onClick={onUpdate}
          className="mt-6 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Update Quiz
        </button>
      </ActionCard>
      <ActionCard
        eyebrow="Add More Questions"
        title="Append new questions to this quiz"
        description="Use the AI flow, manual template flow, or PDF import flow to create extra questions and append them to this existing quiz."
      >
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onAddWithAi}
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Add With AI
          </button>
          <button
            type="button"
            onClick={onAddManually}
            className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-stone-100"
          >
            Add Manually
          </button>
          <button
            type="button"
            onClick={onAddFromPdf}
            className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-stone-100"
          >
            Add From PDF
          </button>
        </div>
      </ActionCard>
    </div>
  );
}

function EditorForm({
  editorQuiz,
  validationIssue,
  focusAreaInput,
  questionTagInputs,
  setQuestionTagInputs,
  openQuestionIndex,
  setOpenQuestionIndex,
  setEditorQuiz,
  setFocusAreaInput,
  appendQuestion,
  addFocusAreaTag,
  removeFocusAreaTag,
  addQuestionTags,
  removeQuestionTag,
  removeQuestion,
  updateQuestion,
}: {
  editorQuiz: EditableQuiz;
  validationIssue: ReturnType<typeof useStudioWorkspace>["previewState"]["issue"];
  focusAreaInput: string;
  questionTagInputs: Record<number, string>;
  setQuestionTagInputs: Dispatch<SetStateAction<Record<number, string>>>;
  openQuestionIndex: number;
  setOpenQuestionIndex: (value: number) => void;
  setEditorQuiz: Dispatch<SetStateAction<EditableQuiz | null>>;
  setFocusAreaInput: (value: string) => void;
  appendQuestion: (template: QuestionTemplateLabel) => void;
  addFocusAreaTag: (rawValue: string) => void;
  removeFocusAreaTag: (
    tag: string,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void;
  addQuestionTags: (questionIndex: number, rawValue: string) => void;
  removeQuestionTag: (
    questionIndex: number,
    tag: string,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void;
  removeQuestion: (questionIndex: number) => void;
  updateQuestion: (
    questionIndex: number,
    updater: Parameters<ReturnType<typeof useStudioWorkspace>["updateQuestion"]>[1],
  ) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Quiz Title
            </span>
            <input
              value={editorQuiz.title}
              onChange={(event) =>
                setEditorQuiz({ ...editorQuiz, title: event.target.value })
              }
              className={getValidationClass(
                validationIssue?.field === "title",
                "w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400 focus:bg-white",
              )}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Category
            </span>
            <input
              value={editorQuiz.category}
              onChange={(event) =>
                setEditorQuiz({ ...editorQuiz, category: event.target.value })
              }
              className={getValidationClass(
                validationIssue?.field === "category",
                "w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400 focus:bg-white",
              )}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Duration
            </span>
            <input
              type="number"
              min={5}
              value={editorQuiz.durationMinutes}
              onChange={(event) =>
                setEditorQuiz({
                  ...editorQuiz,
                  durationMinutes: Number(event.target.value) || 5,
                })
              }
              className={getValidationClass(
                validationIssue?.field === "durationMinutes",
                "w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400 focus:bg-white",
              )}
            />
          </label>
          <FocusAreaEditor
            editorQuiz={editorQuiz}
            validationActive={validationIssue?.field === "focusAreas"}
            focusAreaInput={focusAreaInput}
            setFocusAreaInput={setFocusAreaInput}
            addFocusAreaTag={addFocusAreaTag}
            removeFocusAreaTag={removeFocusAreaTag}
          />
          <label className="block sm:col-span-2 xl:col-span-1">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Publishing
            </span>
            <button
              type="button"
              onClick={() =>
                setEditorQuiz({ ...editorQuiz, isPublic: !editorQuiz.isPublic })
              }
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                editorQuiz.isPublic
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-black/10 bg-stone-50 text-slate-800"
              }`}
            >
              <span>
                {editorQuiz.isPublic
                  ? "Published publicly"
                  : "Private to your account"}
              </span>
              <span>{editorQuiz.isPublic ? "On" : "Off"}</span>
            </button>
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Description
          </span>
          <textarea
            value={editorQuiz.description}
            onChange={(event) =>
              setEditorQuiz({ ...editorQuiz, description: event.target.value })
            }
            rows={6}
            className={getValidationClass(
              validationIssue?.field === "description",
              "w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm leading-7 text-slate-900 outline-none focus:border-amber-400 focus:bg-white",
            )}
          />
        </label>
      </div>

      <div
        className={`rounded-[24px] border p-4 ${
          validationIssue?.field === "questions"
            ? "border-amber-300 bg-amber-50/80"
            : "border-black/10 bg-stone-50"
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          Add Question Template
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {questionTemplateLabels.map((template) => (
            <button
              key={template}
              type="button"
              onClick={() => appendQuestion(template)}
              className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-stone-100"
            >
              {template}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {editorQuiz.questions.map((question, questionIndex) => (
          <QuestionEditorCard
            key={`question-${questionIndex}`}
            question={question}
            questionIndex={questionIndex}
            questionCount={editorQuiz.questions.length}
            open={openQuestionIndex === questionIndex}
            questionType={inferQuestionType(question)}
            validationIssue={validationIssue}
            tagInput={questionTagInputs[questionIndex] ?? ""}
            onToggleOpen={() =>
              setOpenQuestionIndex(
                openQuestionIndex === questionIndex ? -1 : questionIndex,
              )
            }
            onRemoveQuestion={() => removeQuestion(questionIndex)}
            onQuestionChange={(nextQuestion) =>
              updateQuestion(questionIndex, () => nextQuestion)
            }
            onTagInputChange={(value) =>
              setQuestionTagInputs((current) => ({
                ...current,
                [questionIndex]: value,
              }))
            }
            onAddTags={(rawValue) => addQuestionTags(questionIndex, rawValue)}
            onRemoveTag={(tag, event) =>
              removeQuestionTag(questionIndex, tag, event)
            }
          />
        ))}
      </div>
    </div>
  );
}

function FocusAreaEditor({
  editorQuiz,
  validationActive,
  focusAreaInput,
  setFocusAreaInput,
  addFocusAreaTag,
  removeFocusAreaTag,
}: {
  editorQuiz: EditableQuiz;
  validationActive: boolean;
  focusAreaInput: string;
  setFocusAreaInput: (value: string) => void;
  addFocusAreaTag: (rawValue: string) => void;
  removeFocusAreaTag: (
    tag: string,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void;
}) {
  return (
    <div className="block sm:col-span-2 xl:col-span-1">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        Focus Area Tags
      </span>
      <div
        className={`rounded-2xl border px-3 py-3 ${
          validationActive
            ? "border-amber-300 bg-amber-50/80"
            : "border-black/10 bg-stone-50"
        }`}
      >
        <div className="flex flex-wrap gap-2">
          {editorQuiz.focusAreas.map((focusArea) => (
            <div
              key={focusArea}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              <span>{focusArea}</span>
              <button
                type="button"
                onClick={(event) => removeFocusAreaTag(focusArea, event)}
                className="rounded-full p-0.5 text-slate-400 transition hover:bg-stone-100 hover:text-slate-700"
                aria-label={`Remove ${focusArea}`}
              >
                <X className="pointer-events-none h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={focusAreaInput}
            onChange={(event) => setFocusAreaInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                addFocusAreaTag(focusAreaInput);
              }
            }}
            placeholder="Type a tag and press Enter"
            className="w-full bg-transparent px-1 py-1 text-sm text-slate-900 outline-none placeholder:text-slate-500"
          />
          <Button
            type="button"
            variant="warning"
            size="sm"
            disabled={!focusAreaInput.trim()}
            onClick={() => addFocusAreaTag(focusAreaInput)}
            className="gap-1.5"
          >
            <PlusIcon />
            <span className="text-xs font-semibold">Tag</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
