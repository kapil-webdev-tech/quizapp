type ModalFooterProps = {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isDisabled?: boolean;
  isSuccess?: boolean;
};

export function ModalFooter({
  onCancel,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  isDisabled,
  isSuccess,
}: ModalFooterProps) {
  return (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        {cancelLabel}
      </button>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isDisabled}
        className="rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {isSuccess ? "Done" : submitLabel}
      </button>
    </div>
  );
}