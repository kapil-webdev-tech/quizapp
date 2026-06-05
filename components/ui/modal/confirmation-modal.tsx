"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "./modal";

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
      <Trash2 className="h-8 w-8 text-rose-600" />
    ) : (
      <AlertTriangle className="h-8 w-8 text-amber-600" />
    );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width="max-w-md"
      bodyClassName="px-8 py-8"
      
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`
      mb-5 flex h-14 w-14 items-center justify-center
      rounded-2xl border
      ${
        variant === "danger"
          ? "border-rose-200 bg-rose-50 text-rose-600"
          : "border-amber-200 bg-amber-50 text-amber-600"
      }
    `}
        >
          {icon}
        </div>

        <h2 className="text-xl font-semibold tracking-tight text-slate-950">
          {title}
        </h2>

        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          {description}
        </p>

        <div className="mt-6 flex w-full justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>

          <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Deleting..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
