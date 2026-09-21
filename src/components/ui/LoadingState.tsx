import { Spinner } from "./Spinner";

interface LoadingStateProps {
  message?: string;
  minHeight?: string;
}

export function LoadingState({
  message = "Cargando...",
  minHeight = "min-h-48",
}: LoadingStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center gap-3",
        minHeight,
      ].join(" ")}
    >
      <Spinner size="md" />

      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
