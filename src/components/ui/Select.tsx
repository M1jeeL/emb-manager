import type { SelectHTMLAttributes } from "react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  hint,
  options,
  placeholder,
  id,
  className = "",
  ...props
}: SelectProps) {
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

      <select
        id={id}
        className={[
          "w-full rounded-lg border bg-white",
          "px-3 py-2 text-sm text-slate-900",
          "transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
          "disabled:cursor-not-allowed disabled:bg-slate-50",
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
            : "border-slate-300 focus:border-indigo-500",
          className,
        ].join(" ")}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error ? (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
