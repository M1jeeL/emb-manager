import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}

      <textarea
        id={id}
        className={[
          "min-h-24 w-full resize-y rounded-lg border bg-white",
          "px-3 py-2 text-sm text-slate-900",
          "placeholder:text-slate-400",
          "transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
          "disabled:cursor-not-allowed disabled:bg-slate-50",
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
            : "border-slate-300 focus:border-indigo-500",
          className,
        ].join(" ")}
        {...props}
      />

      {error ? (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
