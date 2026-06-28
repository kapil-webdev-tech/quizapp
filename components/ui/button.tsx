import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "success"
  | "warning"
  | "danger"
  | "icon"
  | "outline";

type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-slate-900 text-white hover:-translate-y-0.5 hover:bg-slate-800",
  secondary:
    "border border-black/10 bg-white text-slate-800 hover:-translate-y-0.5 hover:bg-stone-100",
  ghost: "bg-transparent text-slate-700 hover:text-slate-950",
  success: "bg-emerald-500 text-white hover:bg-emerald-600",
  warning:
    "border border-yellow-200 bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  danger: "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
  outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  icon: "border border-black/10 bg-white text-slate-500 hover:bg-stone-100 hover:text-slate-700",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm font-semibold",
  md: "px-5 py-3 text-sm font-semibold",
  lg: "px-6 py-3.5 text-base font-semibold",
  icon: "p-2",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  type,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}
