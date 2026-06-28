import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, HelpCircle, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";

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
          className={cn(
            "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/10",
            badgeClassName
          )}
        >
          <BookOpen className="h-3 w-3" />
          Card {index + 1}
        </span>

        <span
          className={cn(
            "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] ring-1 ring-black/5",
            labelClassName
          )}
        >
          <LabelIcon className="h-3 w-3" />
          {label}
        </span>
      </div>

      {mode === "manage" && (
        <div className="flex items-center gap-2 print:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isSaving}
            onClick={(event) => {
              event.stopPropagation();
              onStartEdit();
            }}
            className="h-8 w-8 rounded-full border border-black/5 bg-white/50 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white hover:shadow-lg"
          >
            <Edit2 className="h-3.5 w-3.5 text-slate-600" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isSaving}
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            className="h-8 w-8 rounded-full border border-rose-100 bg-rose-50/50 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/20"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-600 group-hover:text-white transition-colors" />
          </Button>
        </div>
      )}
    </div>
  );
}
