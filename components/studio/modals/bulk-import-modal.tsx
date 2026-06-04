"use client";

import type { ChangeEvent, DragEvent } from "react";
import { useRef, useState } from "react";
import { PlusIcon } from "@/components/ui/icon";

export type BulkToolMode = "answers" | "solutions";

type BulkImportModalProps = {
  mode: BulkToolMode;
  isOpen: boolean;
  onClose: () => void;
  onModeChange: (mode: BulkToolMode) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  onApply: () => void;
  onFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  skipPages: number;
  onSkipPagesChange: (value: number) => void;
  isImporting: boolean;
  summary: string | null;
  isApplied: boolean;
  detectedCount: number;
  previewText: string;
  previewOpen: boolean;
  onTogglePreview: () => void;
};

export function BulkImportModal({
  mode,
  isOpen,
  onClose,
  onModeChange,
  inputValue,
  onInputChange,
  onApply,
  onFileSelect,
  skipPages,
  onSkipPagesChange,
  isImporting,
  summary,
  isApplied,
  detectedCount,
  previewText,
  previewOpen,
  onTogglePreview,
}: BulkImportModalProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isAnswersMode = mode === "answers";

  if (!isOpen) {
    return null;
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (!file || !fileInputRef.current) {
      return;
    }

    const transfer = new DataTransfer();
    transfer.items.add(file);
    fileInputRef.current.files = transfer.files;
    fileInputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[calc(100vh-2rem)] w-full max-w-[600px] flex-col overflow-hidden rounded-xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-slate-950">
              Bulk Solutions Upload
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Upload or paste answers with explanations
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close bulk upload modal"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => onModeChange("answers")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                isAnswersMode
                  ? "bg-black text-white"
                  : "bg-transparent text-slate-600"
              }`}
            >
              Bulk Answer Key
            </button>
            <button
              type="button"
              onClick={() => onModeChange("solutions")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                !isAnswersMode
                  ? "bg-black text-white"
                  : "bg-transparent text-slate-600"
              }`}
            >
              Bulk Solutions
            </button>
          </div>

          <div className="mt-6 space-y-6">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragActive(true);
              }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={handleDrop}
              className={`flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition ${
                isDragActive
                  ? "border-black bg-slate-50"
                  : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,text/plain,.txt,image/*"
                className="hidden"
                onChange={onFileSelect}
              />
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <PlusIcon />
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-900">
                Drop PDF here or click to upload
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {isImporting
                  ? "Importing file..."
                  : "PDF, text, and image files are supported"}
              </p>
            </button>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Skip Initial Pages
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Ignore cover or instruction pages before the key starts.
                  </p>
                </div>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={skipPages}
                  onChange={(event) =>
                    onSkipPagesChange(
                      Math.max(
                        0,
                        Math.min(
                          10,
                          Number.parseInt(event.target.value, 10) || 0,
                        ),
                      ),
                    )
                  }
                  className="w-20 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-black focus:ring-2 focus:ring-black"
                />
              </div>
              <p className="text-sm text-slate-500">
                {isAnswersMode
                  ? "Paste question-answer pairs. Upload fills the editor only; nothing is applied until you confirm."
                  : "Paste raw solution text with answers and explanations. Upload fills the editor only; nothing is applied until you confirm."}
              </p>
              <pre className="overflow-x-auto rounded-lg bg-slate-100 px-4 py-3 text-xs text-slate-600">
                {isAnswersMode
                  ? "1-a, 2-c, 3-d"
                  : "Q.1) Ans) c Exp) ...\n1. Ans) c Exp) ..."}
              </pre>
            </div>

            <textarea
              value={inputValue}
              onChange={(event) => onInputChange(event.target.value)}
              rows={isAnswersMode ? 8 : 10}
              placeholder={
                isAnswersMode
                  ? "Paste answer key here. Example: 1-a, 2-c, 3-d"
                  : "Paste solution text here. Example: Q.1) Ans) c Exp) ... or 1. Ans) c Exp) ..."
              }
              className="min-h-[200px] w-full rounded-lg border border-slate-300 px-4 py-4 font-mono text-sm leading-6 text-slate-900 outline-none transition focus:border-black focus:ring-2 focus:ring-black"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-slate-500">
                {detectedCount > 0
                  ? `${detectedCount} question${detectedCount === 1 ? "" : "s"} detected`
                  : "No valid question mappings detected yet"}
              </div>
              <button
                type="button"
                onClick={onTogglePreview}
                disabled={detectedCount === 0}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {previewOpen ? "Hide Preview" : "Preview Output"}
              </button>
            </div>

            {previewOpen && previewText ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Preview Output
                </p>
                <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap text-xs leading-6 text-slate-700">
                  {previewText}
                </pre>
              </div>
            ) : null}

            {summary ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                {summary}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.99]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onApply}
            disabled={!inputValue.trim()}
            className="rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2">
              {isApplied ? <CheckIcon /> : null}
              {isApplied ? "Applied" : "Apply Changes"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 fill-none stroke-current"
      strokeWidth="2.5"
    >
      <path
        d="m5 12 4.5 4.5L19 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-none stroke-current"
      strokeWidth="2"
    >
      <path d="M6 6 18 18M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}
