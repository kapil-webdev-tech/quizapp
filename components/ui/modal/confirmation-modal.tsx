"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "./modal";
import { cn } from "@/lib/utils";

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;

  title: string;
  description: string;

  confirmLabel?: string;
  cancelLabel?: string;

  isLoading?: boolean;

  variant?: "danger" | "warning";
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading = false,
  variant = "danger",
}: ConfirmationModalProps) {
  const icon =
    variant === "danger" ? (
      <Trash2 className="h-6 w-6" />
    ) : (
      <AlertTriangle className="h-6 w-6" />
    );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width="sm:max-w-[440px]"
      bodyClassName="px-6 pb-6 pt-4 sm:px-8 sm:pb-8 sm:pt-6"
      
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            "mb-5 flex h-14 w-14 items-center justify-center rounded-[20px] border-2 shadow-sm transition-transform hover:scale-105 sm:mb-6 sm:h-16 sm:w-16 sm:rounded-[22px]",
            variant === "danger"
              ? "border-rose-100 bg-rose-50 text-rose-600 shadow-rose-100/50"
              : "border-amber-100 bg-amber-50 text-amber-600 shadow-amber-100/50"
          )}
        >
          {icon}
        </div>

        <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-500/90 sm:mt-3 sm:text-base">
          {description}
        </p>

        <div className="mt-8 flex w-full flex-col-reverse gap-3 sm:mt-10 sm:flex-row">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={isLoading}
            className="flex-1 rounded-full font-bold text-slate-500 hover:bg-slate-100 h-11 sm:h-10"
          >
            {cancelLabel}
          </Button>

          <Button 
            variant={variant === "danger" ? "danger" : "warning"}
            onClick={onConfirm} 
            disabled={isLoading}
            className={cn(
              "flex-1 rounded-full px-8 font-bold text-white transition-all hover:scale-[1.02] active:scale-95 h-11 sm:h-10",
              variant === "danger" ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-500 hover:bg-amber-600"
            )}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
