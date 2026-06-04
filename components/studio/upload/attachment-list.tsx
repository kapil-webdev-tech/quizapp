import type { StudioAttachmentDraft } from "@/features/studio/shared/types";

type AttachmentListProps = {
  attachments: StudioAttachmentDraft[];
  variant: "dark" | "light";
  onRemove: (id: string) => void;
};

export function AttachmentList({
  attachments,
  variant,
  onRemove,
}: AttachmentListProps) {
  if (attachments.length === 0) {
    return null;
  }

  const dark = variant === "dark";

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className={
            dark
              ? "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-3 py-3 text-sm text-white/85"
              : "flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-slate-800"
          }
        >
          {attachment.previewUrl && dark ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={attachment.previewUrl}
              alt={attachment.name}
              className="h-10 w-10 rounded-xl object-cover"
            />
          ) : (
            <span
              className={
                dark
                  ? "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[11px] font-bold uppercase"
                  : "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-[11px] font-bold uppercase"
              }
            >
              {attachment.kind === "text"
                ? "TXT"
                : attachment.kind === "pdf"
                  ? "PDF"
                  : attachment.kind.toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium">{attachment.name}</p>
            <p className={dark ? "text-xs text-white/55" : "text-xs text-slate-500"}>
              {formatFileSize(attachment.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(attachment.id)}
            className={
              dark
                ? "rounded-full px-2 py-1 text-xs font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
                : "rounded-full px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-stone-100 hover:text-slate-800"
            }
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
