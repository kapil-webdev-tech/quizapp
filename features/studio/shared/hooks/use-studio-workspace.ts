"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  clearStudioDraft,
  createBlankEditableQuiz,
  editableQuizToQuiz,
  fetchCustomQuiz,
  loadStudioDraft,
  parseGeneratedQuiz,
  quizToEditableQuiz,
  saveCustomQuiz,
  saveStudioDraft,
  updateCustomQuiz,
  type EditableQuiz,
  type StudioDraftMode,
} from "@/lib/custom-quiz-store";
import { parseBulkAnswerKey, parseBulkSolutions } from "@/lib/answer-key-parser";
import { useSupabaseSession } from "@/lib/supabase";
import type { BulkToolMode } from "@/components/studio/modals/bulk-import-modal";
import {
  createQuestionFromTemplate,
  inferQuestionType,
  parseValidationIssue,
  updateQuestion as updateQuestionInQuiz,
} from "../utils/quiz-draft-utils";
import type {
  PreviewState,
  QuestionTemplateLabel,
  StudioAttachmentDraft,
  StudioSourcePreview,
  StudioView,
} from "../types";

type UseStudioWorkspaceOptions = {
  draftMode: StudioDraftMode;
  setupPath: string;
};

export function useStudioWorkspace({
  draftMode,
  setupPath,
}: UseStudioWorkspaceOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, loaded: sessionLoaded } = useSupabaseSession();
  const editSlug = searchParams.get("edit");
  const routeIntent = searchParams.get("intent") === "add" ? "add" : null;
  const [activeView, setActiveView] = useState<StudioView>("setup");
  const [editorQuiz, setEditorQuiz] = useState<EditableQuiz | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editIntent, setEditIntent] = useState<"update" | "add" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearingDraft, setIsClearingDraft] = useState(false);
  const [attachments, setAttachments] = useState<StudioAttachmentDraft[]>([]);
  const [sourcePreview, setSourcePreview] = useState<StudioSourcePreview | null>(
    null,
  );
  const [sourcePreviewMinimized, setSourcePreviewMinimized] = useState(false);
  const [openQuestionIndex, setOpenQuestionIndex] = useState(0);
  const [focusAreaInput, setFocusAreaInput] = useState("");
  const [questionTagInputs, setQuestionTagInputs] = useState<
    Record<number, string>
  >({});
  const [bulkImportSkipPages, setBulkImportSkipPages] = useState(0);
  const [bulkAnswerKeyInput, setBulkAnswerKeyInput] = useState("");
  const [bulkAnswerKeySummary, setBulkAnswerKeySummary] = useState<
    string | null
  >(null);
  const [bulkAnswerKeyApplied, setBulkAnswerKeyApplied] = useState(false);
  const [bulkSolutionInput, setBulkSolutionInput] = useState("");
  const [bulkSolutionSummary, setBulkSolutionSummary] = useState<string | null>(
    null,
  );
  const [bulkSolutionApplied, setBulkSolutionApplied] = useState(false);
  const [bulkToolOpen, setBulkToolOpen] = useState(false);
  const [bulkToolMode, setBulkToolMode] = useState<BulkToolMode>("answers");
  const [bulkPreviewOpen, setBulkPreviewOpen] = useState(false);
  const [isImportingAnswerKey, setIsImportingAnswerKey] = useState(false);
  const [isImportingSolutions, setIsImportingSolutions] = useState(false);

  const previewState = useMemo<PreviewState>(() => {
    if (!editorQuiz) {
      return { quiz: null, issue: null };
    }

    try {
      return { quiz: editableQuizToQuiz(editorQuiz), issue: null };
    } catch (validationError) {
      return {
        quiz: null,
        issue: parseValidationIssue(
          validationError instanceof Error
            ? validationError.message
            : "Validation failed.",
        ),
      };
    }
  }, [editorQuiz]);

  const stats = editorQuiz
    ? [
        { label: "Questions", value: String(editorQuiz.questions.length) },
        {
          label: "Mix",
          value: Array.from(
            new Set(editorQuiz.questions.map((question) => inferQuestionType(question))),
          ).length.toString(),
        },
        {
          label: "Draft",
          value: editingSlug ? "Editing Saved Set" : "Autosaving",
        },
      ]
    : null;

  const hasDraftData =
    Boolean(editorQuiz) || attachments.length > 0 || Boolean(sourcePreview);

  const bulkDetection = useMemo(() => {
    if (!editorQuiz) {
      return { detectedCount: 0, previewText: "" };
    }

    if (bulkToolMode === "answers") {
      const parsed = parseBulkAnswerKey(
        bulkAnswerKeyInput,
        editorQuiz.questions.length,
      );
      const previewText = Object.entries(parsed.answersByQuestion)
        .sort(([left], [right]) => Number(left) - Number(right))
        .slice(0, 12)
        .map(
          ([questionNumber, answer]) =>
            `Q${questionNumber} -> ${answer.toUpperCase()}`,
        )
        .join("\n");

      return {
        detectedCount: Object.keys(parsed.answersByQuestion).length,
        previewText,
      };
    }

    const parsed = parseBulkSolutions(
      bulkSolutionInput,
      editorQuiz.questions.length,
    );
    const previewText = Object.entries(parsed.solutionsByQuestion)
      .sort(([left], [right]) => Number(left) - Number(right))
      .slice(0, 8)
      .map(([questionNumber, value]) => {
        const parts = [`Q${questionNumber}`];
        if (value.answer) {
          parts.push(`Ans ${value.answer.toUpperCase()}`);
        }
        if (value.explanation) {
          parts.push(
            `Exp ${value.explanation.slice(0, 90)}${value.explanation.length > 90 ? "..." : ""}`,
          );
        }
        return parts.join(" · ");
      })
      .join("\n");

    return {
      detectedCount: Object.keys(parsed.solutionsByQuestion).length,
      previewText,
    };
  }, [bulkAnswerKeyInput, bulkSolutionInput, bulkToolMode, editorQuiz]);

  useEffect(() => {
    setFocusAreaInput("");
    setQuestionTagInputs({});
  }, [editorQuiz?.title]);

  useEffect(() => {
    if (previewState.issue?.questionIndex !== null && previewState.issue) {
      setOpenQuestionIndex(previewState.issue.questionIndex);
    }
  }, [previewState.issue]);

  useEffect(() => {
    if (!bulkToolOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setBulkToolOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [bulkToolOpen]);

  useEffect(() => {
    if (!sessionLoaded) {
      return;
    }

    if (!session) {
      setEditorQuiz(null);
      setEditingSlug(null);
      setEditIntent(null);
      setActiveView("setup");
      return;
    }

    let active = true;

    if (editSlug) {
      void fetchCustomQuiz(editSlug)
        .then((storedQuiz) => {
          if (!active) {
            return;
          }
          if (!storedQuiz) {
            throw new Error(
              "The quiz set you tried to edit was not found in backend storage.",
            );
          }

          setEditorQuiz(quizToEditableQuiz(storedQuiz));
          setEditingSlug(storedQuiz.slug);
          setEditIntent(routeIntent);
          setActiveView(routeIntent === "add" ? "setup" : "editor");
          setOpenQuestionIndex(0);
          setError(null);
          setMessage(`Loaded "${storedQuiz.title}" for editing.`);
        })
        .catch((draftError) => {
          if (!active) {
            return;
          }
          setError(
            draftError instanceof Error
              ? draftError.message
              : "Unable to load the selected quiz for editing.",
          );
        });

      return () => {
        active = false;
      };
    }

    void loadStudioDraft()
      .then((stored) => {
        if (!active || !stored || stored.mode !== draftMode) {
          return;
        }

        setEditorQuiz(stored.quiz);
        setEditingSlug(null);
        setEditIntent(null);
        setActiveView("editor");
        setMessage("Loaded your existing studio draft from the backend.");
      })
      .catch((draftError) => {
        if (!active) {
          return;
        }
        setError(
          draftError instanceof Error
            ? draftError.message
            : "Unable to load your studio draft.",
        );
      });

    return () => {
      active = false;
    };
  }, [draftMode, editSlug, routeIntent, session, sessionLoaded]);

  useEffect(() => {
    if (!sessionLoaded || !session || !editorQuiz || editingSlug) {
      return;
    }

    const timer = window.setTimeout(() => {
      void saveStudioDraft(editorQuiz, draftMode).catch((draftError) => {
        setError(
          draftError instanceof Error
            ? draftError.message
            : "Unable to save studio draft.",
        );
      });
    }, 500);

    return () => window.clearTimeout(timer);
  }, [draftMode, editorQuiz, editingSlug, session, sessionLoaded]);

  function requireStudioLogin(featureLabel: string) {
    if (session) {
      return true;
    }

    setMessage(null);
    setError(`Please login to use ${featureLabel}.`);
    return false;
  }

  function resetLocalDraftData() {
    attachments.forEach((attachment) => {
      if (attachment.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
    });
    setEditorQuiz(null);
    setAttachments([]);
    setSourcePreview(null);
    setSourcePreviewMinimized(false);
    setOpenQuestionIndex(0);
    setEditingSlug(null);
    setEditIntent(null);
    setFocusAreaInput("");
    setQuestionTagInputs({});
    setBulkAnswerKeyInput("");
    setBulkAnswerKeySummary(null);
    setBulkAnswerKeyApplied(false);
    setBulkSolutionInput("");
    setBulkSolutionSummary(null);
    setBulkSolutionApplied(false);
    setBulkToolOpen(false);
    setBulkPreviewOpen(false);
  }

  async function handleClearDraftData() {
    if (!hasDraftData || isClearingDraft) {
      return;
    }

    const confirmed = window.confirm(
      "Clear the current studio draft data? Saved quiz sets will not be deleted.",
    );

    if (!confirmed) {
      return;
    }

    setIsClearingDraft(true);
    setError(null);
    setMessage(null);

    try {
      if (session) {
        await clearStudioDraft();
      }
      resetLocalDraftData();
      setActiveView("setup");
      setMessage("Cleared the current studio draft data.");
    } catch (clearError) {
      setError(
        clearError instanceof Error
          ? clearError.message
          : "Unable to clear studio draft data.",
      );
      setMessage(null);
    } finally {
      setIsClearingDraft(false);
    }
  }

  async function handleSave() {
    if (!editorQuiz) {
      return;
    }

    if (!session) {
      setError("Sign in first to save this quiz to the backend.");
      setMessage(null);
      return;
    }

    try {
      setIsSaving(true);
      setMessage(
        editingSlug ? "Saving changes to the backend..." : "Saving quiz to the backend...",
      );
      setError(null);

      const nextQuiz = editableQuizToQuiz(editorQuiz);
      const saved = editingSlug
        ? await updateCustomQuiz(editingSlug, nextQuiz)
        : await saveCustomQuiz(nextQuiz);
      await clearStudioDraft();
      setMessage(
        editingSlug
          ? `Saved changes to "${saved.title}".`
          : `Saved "${saved.title}". It is now available for test-taking${saved.isPublic ? " and visible publicly." : "."}`,
      );
      setError(null);
      resetLocalDraftData();
      setActiveView("setup");
      if (editSlug) {
        router.replace("/subjects");
      } else {
        router.push("/studio");
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save quiz.");
      setMessage(null);
    } finally {
      setIsSaving(false);
    }
  }

  function setDraftQuiz(nextQuiz: EditableQuiz, nextMessage: string) {
    setEditorQuiz(nextQuiz);
    setOpenQuestionIndex(0);
    setActiveView("editor");
    setMessage(nextMessage);
    setError(null);
  }

  function appendDraftQuiz(nextQuiz: EditableQuiz, nextMessage: string) {
    if (editingSlug && editIntent === "add" && editorQuiz) {
      setEditorQuiz({
        ...editorQuiz,
        focusAreas: Array.from(
          new Set([...editorQuiz.focusAreas, ...nextQuiz.focusAreas]),
        ),
        questions: [...editorQuiz.questions, ...nextQuiz.questions],
      });
      setOpenQuestionIndex(editorQuiz.questions.length);
      setActiveView("editor");
      setMessage(nextMessage);
      setError(null);
      return;
    }

    setDraftQuiz(nextQuiz, nextMessage);
  }

  function validateGeneratedJson(rawJson: string) {
    try {
      const quiz = parseGeneratedQuiz(rawJson);
      appendDraftQuiz(
        quizToEditableQuiz(quiz),
        editingSlug && editIntent === "add"
          ? `Validated ${quiz.questions.length} questions and added them to this quiz. Continue in the editor.`
          : `Validated ${quiz.questions.length} questions. Continue in the editor.`,
      );
    } catch (validationError) {
      if (!(editingSlug && editIntent === "add")) {
        setEditorQuiz(null);
      }
      setError(
        validationError instanceof Error
          ? validationError.message
          : "Validation failed.",
      );
      setMessage(null);
    }
  }

  function startManualQuiz(template: QuestionTemplateLabel) {
    const blank = createBlankManualQuiz(template);

    if (editingSlug && editIntent === "add" && editorQuiz) {
      setEditorQuiz({
        ...editorQuiz,
        questions: [...editorQuiz.questions, blank.questions[0]],
      });
      setOpenQuestionIndex(editorQuiz.questions.length);
      setActiveView("editor");
      setMessage(`Added a ${template.toLowerCase()} question to this quiz.`);
      setError(null);
      return;
    }

    setDraftQuiz(
      blank,
      `Started a manual draft with a ${template.toLowerCase()} template.`,
    );
  }

  function appendQuestion(template: QuestionTemplateLabel) {
    if (!editorQuiz) {
      startManualQuiz(template);
      return;
    }

    setEditorQuiz({
      ...editorQuiz,
      questions: [...editorQuiz.questions, createQuestionFromTemplate(template)],
    });
    setOpenQuestionIndex(editorQuiz.questions.length);
    setMessage(`Added a ${template.toLowerCase()} question template.`);
    setError(null);
  }

  function addFocusAreaTag(rawValue: string) {
    if (!editorQuiz) {
      return;
    }

    const tags = rawValue
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (tags.length === 0) {
      return;
    }

    setEditorQuiz({
      ...editorQuiz,
      focusAreas: Array.from(new Set([...editorQuiz.focusAreas, ...tags])),
    });
    setFocusAreaInput("");
  }

  function removeFocusAreaTag(
    tag: string,
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault();
    event.stopPropagation();
    if (!editorQuiz) {
      return;
    }

    setEditorQuiz({
      ...editorQuiz,
      focusAreas: editorQuiz.focusAreas.filter((item) => item !== tag),
    });
  }

  function addQuestionTags(questionIndex: number, rawValue: string) {
    if (!editorQuiz) {
      return;
    }

    const tags = rawValue
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (tags.length === 0) {
      return;
    }

    setEditorQuiz(
      updateQuestionInQuiz(editorQuiz, questionIndex, (question) => ({
        ...question,
        tags: Array.from(new Set([...(question.tags ?? []), ...tags])),
      })),
    );
    setQuestionTagInputs((current) => ({ ...current, [questionIndex]: "" }));
  }

  function removeQuestionTag(
    questionIndex: number,
    tag: string,
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault();
    event.stopPropagation();
    updateQuestion(questionIndex, (question) => ({
      ...question,
      tags: (question.tags ?? []).filter((item) => item !== tag),
    }));
  }

  function removeQuestion(questionIndex: number) {
    if (!editorQuiz || editorQuiz.questions.length <= 1) {
      return;
    }

    setEditorQuiz({
      ...editorQuiz,
      questions: editorQuiz.questions.filter((_, index) => index !== questionIndex),
    });
    setOpenQuestionIndex(Math.max(0, questionIndex - 1));
    setMessage(`Removed question ${questionIndex + 1} from the draft.`);
    setError(null);
  }

  function updateQuestion(
    questionIndex: number,
    updater: Parameters<typeof updateQuestionInQuiz>[2],
  ) {
    if (!editorQuiz) {
      return;
    }
    setEditorQuiz(updateQuestionInQuiz(editorQuiz, questionIndex, updater));
  }

  function handleAttachmentSelect(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    const next = files
      .filter((file) => {
        const isPdf = file.type === "application/pdf";
        const isText =
          file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");
        const isImage = file.type.startsWith("image/");
        return isPdf || isText || isImage;
      })
      .slice(0, 4)
      .map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        size: file.size,
        type: file.type,
        kind:
          file.type === "application/pdf"
            ? ("pdf" as const)
            : file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")
              ? ("text" as const)
              : ("image" as const),
        previewUrl: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
        file,
      }));

    setAttachments((current) => [...current, ...next].slice(0, 4));
    setSourcePreview(null);
    event.target.value = "";
    setMessage("Added attachments.");
    setError(null);
  }

  function removeAttachment(id: string) {
    setAttachments((current) => {
      const target = current.find((item) => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return current.filter((item) => item.id !== id);
    });
    setSourcePreview(null);
  }

  function openBulkTool(mode: BulkToolMode) {
    setBulkToolMode(mode);
    setBulkPreviewOpen(false);
    setBulkToolOpen(true);
    setError(null);
  }

  function applyBulkAnswerKey(text: string) {
    if (!editorQuiz) {
      return;
    }

    const parsed = parseBulkAnswerKey(text, editorQuiz.questions.length);
    const appliedQuestionNumbers = Object.keys(parsed.answersByQuestion)
      .map(Number)
      .sort((a, b) => a - b);

    if (appliedQuestionNumbers.length === 0) {
      setError(
        "No valid answers were detected. Use formats like '1-a, 2-c, 3-d' or '1 2 3 4' question mappings.",
      );
      setMessage(null);
      setBulkAnswerKeySummary(null);
      setBulkAnswerKeyApplied(false);
      return;
    }

    setEditorQuiz({
      ...editorQuiz,
      questions: editorQuiz.questions.map((question, index) => {
        const nextAnswer = parsed.answersByQuestion[index + 1];
        return nextAnswer ? { ...question, answer: nextAnswer } : question;
      }),
    });

    const summary = `Applied answers to ${appliedQuestionNumbers.length} question${appliedQuestionNumbers.length === 1 ? "" : "s"}.`;
    setBulkAnswerKeySummary(summary);
    setBulkAnswerKeyApplied(true);
    setMessage(summary);
    setError(null);
  }

  function applyBulkSolutions(text: string) {
    if (!editorQuiz) {
      return;
    }

    const parsed = parseBulkSolutions(text, editorQuiz.questions.length);
    const appliedQuestionNumbers = Object.keys(parsed.solutionsByQuestion)
      .map(Number)
      .sort((a, b) => a - b);

    if (appliedQuestionNumbers.length === 0) {
      setError(
        "No valid solutions were detected. Use blocks like 'Q.1) Ans) c Exp) ...'.",
      );
      setMessage(null);
      setBulkSolutionSummary(null);
      setBulkSolutionApplied(false);
      return;
    }

    setEditorQuiz({
      ...editorQuiz,
      questions: editorQuiz.questions.map((question, index) => {
        const solution = parsed.solutionsByQuestion[index + 1];
        if (!solution) {
          return question;
        }

        return {
          ...question,
          ...(solution.answer ? { answer: solution.answer } : {}),
          ...(solution.explanation ? { explanation: solution.explanation } : {}),
        };
      }),
    });

    const summary = `Applied solution data to ${appliedQuestionNumbers.length} question${appliedQuestionNumbers.length === 1 ? "" : "s"}.`;
    setBulkSolutionSummary(summary);
    setBulkSolutionApplied(true);
    setMessage(summary);
    setError(null);
  }

  async function handleAnswerKeyFileImport(event: ChangeEvent<HTMLInputElement>) {
    await importBulkText(event, setIsImportingAnswerKey, (text) => {
      setBulkAnswerKeyInput(text);
      setBulkAnswerKeySummary(
        "Imported answer key text. Review it if needed, then press Apply Answers.",
      );
      setBulkAnswerKeyApplied(false);
      setMessage("Imported answer key text. Press Apply Answers to update the draft.");
    });
  }

  async function handleSolutionsFileImport(event: ChangeEvent<HTMLInputElement>) {
    await importBulkText(event, setIsImportingSolutions, (text) => {
      setBulkSolutionInput(text);
      setBulkSolutionSummary(
        "Imported solution text. Review it if needed, then press Apply Solutions.",
      );
      setBulkSolutionApplied(false);
      setMessage("Imported solution text. Press Apply Solutions to update the draft.");
    });
  }

  async function importBulkText(
    event: ChangeEvent<HTMLInputElement>,
    setImporting: (value: boolean) => void,
    onText: (text: string) => void,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setImporting(true);
    setError(null);

    try {
      const { readJsonResponse } = await import("../utils/quiz-draft-utils");
      const formData = new FormData();
      formData.append("files", file, file.name);
      formData.append("skipPages", String(bulkImportSkipPages));

      const response = await fetch("/api/import-answer-key", {
        method: "POST",
        body: formData,
      });
      const data = await readJsonResponse<{
        text?: string;
        warning?: string;
        error?: string;
      }>(response);

      if (!response.ok || data.error || typeof data.text !== "string") {
        throw new Error(data.error || "Import failed.");
      }

      onText(data.text);
      setError(null);
      if (data.warning) {
        setMessage((current) =>
          `${current ?? ""}${current ? " " : ""}${data.warning}`.trim(),
        );
      }
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Import failed.");
      setMessage(null);
    } finally {
      setImporting(false);
    }
  }

  function beginEditingExistingQuestions() {
    setEditIntent("update");
    setActiveView("editor");
    setMessage(
      "Update mode enabled. You can edit or delete individual questions before saving the quiz.",
    );
    setError(null);
  }

  function beginAddingQuestions(nextPath: string, messageText: string) {
    setEditIntent("add");
    setMessage(messageText);
    setError(null);
    const search = editingSlug
      ? `?edit=${encodeURIComponent(editingSlug)}&intent=add`
      : "";
    router.push(`${nextPath}${search}`);
  }

  return {
    router,
    session,
    sessionLoaded,
    activeView,
    setActiveView,
    editorQuiz,
    setEditorQuiz,
    editingSlug,
    editIntent,
    setEditIntent,
    message,
    setMessage,
    error,
    setError,
    isSaving,
    isClearingDraft,
    stats,
    hasDraftData,
    previewState,
    attachments,
    setAttachments,
    sourcePreview,
    setSourcePreview,
    sourcePreviewMinimized,
    setSourcePreviewMinimized,
    openQuestionIndex,
    setOpenQuestionIndex,
    focusAreaInput,
    setFocusAreaInput,
    questionTagInputs,
    setQuestionTagInputs,
    bulkImportSkipPages,
    setBulkImportSkipPages,
    bulkToolMode,
    setBulkToolMode,
    bulkToolOpen,
    setBulkToolOpen,
    bulkPreviewOpen,
    setBulkPreviewOpen,
    bulkAnswerKeyInput,
    setBulkAnswerKeyInput,
    bulkSolutionInput,
    setBulkSolutionInput,
    bulkAnswerKeySummary,
    bulkSolutionSummary,
    bulkAnswerKeyApplied,
    bulkSolutionApplied,
    isImportingAnswerKey,
    isImportingSolutions,
    bulkDetection,
    requireStudioLogin,
    handleClearDraftData,
    handleSave,
    setDraftQuiz,
    appendDraftQuiz,
    validateGeneratedJson,
    startManualQuiz,
    appendQuestion,
    addFocusAreaTag,
    removeFocusAreaTag,
    addQuestionTags,
    removeQuestionTag,
    removeQuestion,
    updateQuestion,
    handleAttachmentSelect,
    removeAttachment,
    openBulkTool,
    applyBulkAnswerKey,
    applyBulkSolutions,
    handleAnswerKeyFileImport,
    handleSolutionsFileImport,
    beginEditingExistingQuestions,
    beginAddingQuestions,
    setupPath,
  };
}

function createBlankManualQuiz(template: QuestionTemplateLabel) {
  const blank = createBlankEditableQuiz();
  blank.questions = [createQuestionFromTemplate(template)];
  blank.title = `${template} Practice Set`;
  blank.category = "General Studies";
  blank.description = `A manually created UPSC quiz with a ${template.toLowerCase()} opening question.`;
  blank.focusAreas = [template, "UPSC Prelims"];
  return blank;
}
