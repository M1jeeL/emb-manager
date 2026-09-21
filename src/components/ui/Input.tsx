import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
}

export function Input({
  label,
  error,
  hint,
  leftElement,
  rightElement,
  id,
  className = "",
  ...props
}: InputProps) {
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

      <div className="relative">
        {leftElement && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            {leftElement}
          </div>
        )}

        <input
          id={id}
          className={[
            "w-full rounded-lg border bg-white",
            "px-3 py-2 text-sm text-slate-900",
            "placeholder:text-slate-400",
            "transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
              : "border-slate-300 focus:border-indigo-500",
            leftElement ? "pl-10" : "",
            rightElement ? "pr-10" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
