import type { ChangeEvent } from "react";
import SectionShell from "@/components/ui/section/section-shell";
import { PlusIcon } from "@/components/ui/icon";
import type {
  StudioAttachmentDraft,
  StudioSourcePreview,
} from "@/features/studio/shared/types";
import { AttachmentList } from "@/components/studio/upload/attachment-list";
import { SourcePreviewPanel } from "@/components/studio/upload/source-preview-panel";

type PdfImportSectionProps = {
  attachments: StudioAttachmentDraft[];
  sourcePreview: StudioSourcePreview | null;
  sourcePreviewMinimized: boolean;
  pdfSkipPages: number;
  isPreviewingSource: boolean;
  isImportingPdf: boolean;
  hasEditorQuiz: boolean;
  isAddingToSavedQuiz: boolean;
  onBack: () => void;
  onOpenEditor: () => void;
  onAttachmentSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (id: string) => void;
  onPreviewSource: () => void;
  onImportPdf: () => void;
  onSkipPagesChange: (value: number) => void;
  onTogglePreview: () => void;
};

export function PdfImportSection({
  attachments,
  sourcePreview,
  sourcePreviewMinimized,
  pdfSkipPages,
  isPreviewingSource,
  isImportingPdf,
  hasEditorQuiz,
  isAddingToSavedQuiz,
  onBack,
  onOpenEditor,
  onAttachmentSelect,
  onRemoveAttachment,
  onPreviewSource,
  onImportPdf,
  onSkipPagesChange,
  onTogglePreview,
}: PdfImportSectionProps) {
  return (
    <SectionShell
      title="PDF Import"
      description="Attach a multi-column UPSC prelims PDF, preview the extracted server-side text, then import the parsed questions into the editor."
      aside={
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-stone-100"
          >
            {isAddingToSavedQuiz ? "Back To Edit Options" : "Back To Path Choice"}
          </button>
          {hasEditorQuiz ? (
            <button
              type="button"
              onClick={onOpenEditor}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
            >
              Open Existing Draft
            </button>
          ) : null}
        </div>
      }
    >
      <div className="rounded-[28px] border border-black/10 bg-stone-50 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-stone-100">
            <input
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={onAttachmentSelect}
            />
            <PlusIcon />
            Attach PDF
          </label>
          <button
            type="button"
            onClick={onPreviewSource}
            disabled={isPreviewingSource}
            className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPreviewingSource ? "Previewing..." : "Preview Extract"}
          </button>
          <button
            type="button"
            onClick={onImportPdf}
            disabled={isImportingPdf}
            className="rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isImportingPdf ? "Importing..." : "Import Into Editor"}
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">
              Skip Initial Pages
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Ignore cover pages before the test begins. Use `0` if Question 1
              starts immediately.
            </p>
          </div>
          <input
            type="number"
            min={0}
            max={10}
            value={pdfSkipPages}
            onChange={(event) =>
              onSkipPagesChange(
                Math.max(
                  0,
                  Math.min(10, Number.parseInt(event.target.value, 10) || 0),
                ),
              )
            }
            className="w-20 rounded-xl border border-black/10 bg-stone-50 px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-600">
          Expected structure: Question 1 may start as `Q.1)` or `1.`. Total
          questions should be 100 for GS and 80 for CSAT.
        </p>

        <AttachmentList
          attachments={attachments}
          variant="light"
          onRemove={onRemoveAttachment}
        />

        <SourcePreviewPanel
          sourcePreview={sourcePreview}
          variant="light"
          minimized={sourcePreviewMinimized}
          onToggleMinimized={onTogglePreview}
        />
      </div>
    </SectionShell>
  );
}
