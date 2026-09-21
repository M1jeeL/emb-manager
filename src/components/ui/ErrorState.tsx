import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: () => void;
  actionLabel?: string;
}

export function ErrorState({
  title = "Ocurrió un error",
  description = "No pudimos cargar la información. Inténtalo nuevamente.",
  action,
  actionLabel = "Reintentar",
}: ErrorStateProps) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14A2 2 0 003.84 21h16.32a2 2 0 001.72-3.14l-8.18-14a2 2 0 00-3.41 0z"
          />
        </svg>
      </div>

      <h3 className="text-base font-semibold text-slate-900">{title}</h3>

      <p className="mt-1.5 max-w-md text-sm text-slate-500">{description}</p>

      {action && (
        <div className="mt-5">
          <Button variant="outline" onClick={action}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
