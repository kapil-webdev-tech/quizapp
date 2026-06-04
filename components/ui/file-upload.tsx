import {
  ChangeEvent,
  DragEvent,
  useRef,
  useState,
} from "react";

type FileUploadProps = {
  onFileSelect: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
  accept?: string;
  title?: string;
  subtitle?: string;
  isUploading?: boolean;
  className?: string;
};

export function FileUpload({
  onFileSelect,
  accept = "*",
  title = "Drop file here or click to upload",
  subtitle = "Supported formats available",
  isUploading,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  function handleDrop(
    event: DragEvent<HTMLButtonElement>,
  ) {
    event.preventDefault();

    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (!file || !fileInputRef.current) {
      return;
    }

    const transfer = new DataTransfer();

    transfer.items.add(file);

    fileInputRef.current.files = transfer.files;

    fileInputRef.current.dispatchEvent(
      new Event("change", { bubbles: true }),
    );
  }

  return (
    <button
      type="button"
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
        isDragging
          ? "border-black bg-slate-50"
          : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
      } ${className ?? ""}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onFileSelect}
      />

      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-700">
        +
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-900">
        {title}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {isUploading
          ? "Uploading file..."
          : subtitle}
      </p>
    </button>
  );
}