interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-3",
};

export function Spinner({ size = "md" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={[
        "inline-block animate-spin rounded-full",
        "border-slate-300 border-t-indigo-600",
        sizeClasses[size],
      ].join(" ")}
    />
  );
}
