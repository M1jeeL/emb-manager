import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
  secondary:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400",
  outline:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-indigo-500",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center gap-2",
        "rounded-lg font-medium",
        "transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}

      {children}
    </button>
  );
}
