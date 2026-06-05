type LoaderProps = {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
};

export function Loader({
  message = "Loading...",
  size = "md",
  fullScreen = false,
}: LoaderProps) {
  const sizeClass = {
    sm: "dot-loader-sm",
    md: "dot-loader-md",
    lg: "dot-loader-lg",
  }[size];

  const content = (
    <div className="flex flex-col items-center justify-center gap-4 text-slate-900">
      <div className={`dot-loader ${sizeClass}`} />
      {message ? (
        <p className="text-sm text-slate-500">
          {message}
        </p>
      ) : null}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}