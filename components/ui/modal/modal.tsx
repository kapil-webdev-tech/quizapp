"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  headerActions?: ReactNode;
  width?: string;
  heightVariant?: "compact" | "default" | "fullscreen"; // Deprecated
  bodyClassName?: string;
  contentClassName?: string;
};

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  headerActions,
  width = "sm:max-w-[640px]",
  bodyClassName,
  contentClassName,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 p-0 overflow-hidden sm:rounded-[32px]",
          width,
          contentClassName,
        )}
      >
        <DialogHeader className="px-5 pt-6 pb-2 sm:px-8 sm:pt-8 sm:pb-0">
          {!title && (
            <VisuallyHidden.Root>
              <DialogTitle>Dialog</DialogTitle>
            </VisuallyHidden.Root>
          )}

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 sm:space-y-1.5">
              {title && (
                <DialogTitle className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                  {title}
                </DialogTitle>
              )}

              {subtitle && (
                <DialogDescription className="text-xs font-medium text-slate-500 sm:text-sm">
                  {subtitle}
                </DialogDescription>
              )}
            </div>

            {headerActions && <div className="mr-8">{headerActions}</div>}
          </div>
        </DialogHeader>

        <div
          className={cn(
            "flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8",
            bodyClassName,
          )}
        >
          {children}
        </div>

        {footer && (
          <DialogFooter className="border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-8 sm:py-6 sm:justify-end">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
