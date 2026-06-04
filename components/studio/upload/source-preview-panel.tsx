import type { StudioSourcePreview } from "@/features/studio/shared/types";

type SourcePreviewPanelProps = {
  sourcePreview: StudioSourcePreview | null;
  variant: "dark" | "light";
  minimized: boolean;
  copyState?: "idle" | "copied";
  onCopy?: () => void;
  onToggleMinimized: () => void;
  onClear?: () => void;
};

export function SourcePreviewPanel({
  sourcePreview,
  variant,
  minimized,
  copyState = "idle",
  onCopy,
  onToggleMinimized,
  onClear,
}: SourcePreviewPanelProps) {
  if (!sourcePreview) {
    return null;
  }

  return variant === "dark" ? (
    <AiSourcePreviewPanel
      sourcePreview={sourcePreview}
      minimized={minimized}
      copyState={copyState}
      onCopy={onCopy}
      onToggleMinimized={onToggleMinimized}
      onClear={onClear}
    />
  ) : (
    <PdfSourcePreviewPanel
      sourcePreview={sourcePreview}
      minimized={minimized}
      onToggleMinimized={onToggleMinimized}
    />
  );
}

function AiSourcePreviewPanel({
  sourcePreview,
  minimized,
  copyState,
  onCopy,
  onToggleMinimized,
  onClear,
}: {
  sourcePreview: StudioSourcePreview;
  minimized: boolean;
  copyState: "idle" | "copied";
  onCopy?: () => void;
  onToggleMinimized: () => void;
  onClear?: () => void;
}) {
  return (
    <>
      <div className="mx-auto mt-6 max-w-4xl rounded-[28px] border border-white/10 bg-white/[0.045] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white/92">
              Temporary Source Preview
            </p>
            <p className="mt-1 text-xs leading-5 text-white/50">
              This shows what the app extracted from attached PDF, image, or
              text files before MCQ generation.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {onCopy ? (
              <button
                type="button"
                onClick={onCopy}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                  copyState === "copied"
                    ? "bg-emerald-500/18 text-emerald-200"
                    : "bg-white/8 text-white/72 hover:bg-white/12"
                }`}
              >
                {copyState === "copied" ? "Copied" : "Copy Preview"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onToggleMinimized}
              className="rounded-full bg-white/8 px-3 py-2 text-xs font-semibold text-white/72 transition hover:bg-white/12"
            >
              {minimized ? "Expand Preview" : "Minimize Preview"}
            </button>
            {onClear ? (
              <button
                type="button"
                onClick={onClear}
                className="rounded-full bg-white/8 px-3 py-2 text-xs font-semibold text-white/72 transition hover:bg-white/12"
              >
                Clear Preview
              </button>
            ) : null}
          </div>
        </div>

        {!minimized ? (
          <div className="mt-4 grid gap-3 lg:grid-cols-[260px_1fr]">
            <div className="space-y-2">
              {sourcePreview.attachments.map((attachment) => (
                <div
                  key={`${attachment.name}-${attachment.size}`}
                  className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3"
                >
                  <p className="truncate text-xs font-semibold text-white/84">
                    {attachment.name}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
                      {attachment.kind}
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
                      {attachment.extractor}
                    </p>
                    {attachment.pages.length > 0 ? (
                      <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-200/70">
                        {attachment.pages.length} pages
                      </p>
                    ) : null}
                    <SourceStatus status={attachment.status} />
                  </div>
                  {attachment.pages.length > 0 ? (
                    <div className="popup-scroll mt-3 max-h-52 space-y-2 overflow-y-auto pr-1">
                      {attachment.pages.map((page) => (
                        <div
                          key={`${attachment.name}-${page.pageNumber}`}
                          className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2"
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
                            Page {page.pageNumber}
                          </p>
                          <p className="mt-1 text-[11px] leading-5 text-white/58">
                            {page.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 line-clamp-4 text-[11px] leading-5 text-white/58">
                      {attachment.text || "No text extracted."}
                    </p>
                  )}
                  {attachment.warning ? (
                    <p className="mt-2 text-[11px] leading-5 text-amber-100/70">
                      {attachment.warning}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Combined Extracted Text
              </p>
              <pre className="popup-scroll mt-3 max-h-80 overflow-y-auto whitespace-pre-wrap text-[11px] leading-6 text-white/76">
                {sourcePreview.combinedText ||
                  "No text extracted from current attachments."}
              </pre>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-3xl border border-white/8 bg-black/20 px-4 py-3 text-[11px] leading-6 text-white/68">
            Preview minimized. Extracted content is still cached and ready to
            expand or generate from.
          </div>
        )}
      </div>
      {sourcePreview.chunkCount > 0 ? (
        <p className="text-xs text-white/50 mt-2">
          Full content split into {sourcePreview.chunkCount} chunks for AI
          processing
        </p>
      ) : null}
    </>
  );
}

function PdfSourcePreviewPanel({
  sourcePreview,
  minimized,
  onToggleMinimized,
}: {
  sourcePreview: StudioSourcePreview;
  minimized: boolean;
  onToggleMinimized: () => void;
}) {
  return (
    <div className="mt-6 rounded-[24px] border border-black/10 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Extracted Source Preview
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Review the page-wise extraction before importing the test.
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleMinimized}
          className="rounded-full border border-black/10 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-stone-50"
        >
          {minimized ? "Expand" : "Collapse"}
        </button>
      </div>

      {!minimized ? (
        <div className="mt-4 space-y-4">
          {sourcePreview.attachments.map((attachment) => (
            <div
              key={`pdf-preview-${attachment.name}-${attachment.size}`}
              className="rounded-2xl border border-black/10 bg-stone-50 p-4"
            >
              <p className="text-sm font-semibold text-slate-900">
                {attachment.name}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {attachment.extractor} • {attachment.pages.length} pages
              </p>
              <div className="mt-3 max-h-72 overflow-y-auto rounded-2xl bg-slate-950 p-4 font-mono text-[12px] leading-6 text-slate-100">
                {attachment.pages.length > 0
                  ? attachment.pages
                      .map(
                        (page) => `[Page ${page.pageNumber}]\n${page.text}`,
                      )
                      .join("\n\n")
                  : attachment.text || "No extracted text."}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SourceStatus({ status }: { status: string }) {
  return (
    <p
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
        status === "success"
          ? "bg-emerald-400/12 text-emerald-200"
          : status === "unsupported"
            ? "bg-amber-400/12 text-amber-200"
            : "bg-rose-400/12 text-rose-200"
      }`}
    >
      {status}
    </p>
  );
}
