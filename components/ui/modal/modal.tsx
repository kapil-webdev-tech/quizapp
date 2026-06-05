import { ReactNode } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  headerActions?: ReactNode;
  width?: string;
  heightVariant?: "compact" | "default" | "fullscreen";
  bodyClassName?: string;
  contentClassName?: string;
};

const heightStyles = {
  compact: "max-h-[70vh]",
  default: "max-h-[calc(100vh-2rem)]",
  fullscreen: "h-[95vh]",
};

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  headerActions,
  width = "max-w-[640px]",
  heightVariant = "default",
  bodyClassName,
  contentClassName,
}: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/15 backdrop-blur-md"
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={`flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${width} ${heightStyles[heightVariant]} ${contentClassName ?? ""}`}
      >
        {(title || subtitle || headerActions) && (
          <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
            <div>
              {title ? (
                <h2 className="text-xl font-semibold text-slate-950">
                  {title}
                </h2>
              ) : null}

              {subtitle ? (
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {headerActions}

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div
          className={`flex-1 overflow-y-auto px-6 py-5 ${bodyClassName ?? ""}`}
        >
          {children}
        </div>

        {footer ? (
          <div className="border-t border-slate-200 px-6 py-4">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
