import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, HelpCircle } from "lucide-react";
import { Edit2, Trash2 } from "react-feather";

type RecallCardHeaderProps = {
  mode: "view" | "manage";
  side: "question" | "answer";
  index: number;
  badgeClassName: string;
  labelClassName: string;
  isSaving: boolean;
  onStartEdit: () => void;
  onDelete: () => void;
};

export default function RecallCardHeader({
  mode,
  side,
  index,
  badgeClassName,
  labelClassName,
  isSaving,
  onStartEdit,
  onDelete,
}: RecallCardHeaderProps) {
  const LabelIcon =
    side === "question" ? HelpCircle : CheckCircle2;

  const label =
    side === "question" ? "Question" : "Answer";

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white ${badgeClassName}`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Card {index + 1}
        </span>

        <span
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${labelClassName}`}
        >
          <LabelIcon className="h-3.5 w-3.5" />
          {label}
        </span>
      </div>

      {mode === "manage" && (
        <div className="flex items-center gap-2 print:hidden">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            disabled={isSaving}
            onClick={(event) => {
              event.stopPropagation();
              onStartEdit();
            }}
            className="h-9 w-9 rounded-full border border-black/5 bg-white/80 backdrop-blur transition hover:scale-105 hover:bg-white"
          >
            <Edit2 className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="danger"
            size="icon"
            disabled={isSaving}
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            className="h-9 w-9 rounded-full shadow-sm transition hover:scale-105"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}