import { useEffect } from "react";

export type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: React.ReactNode;
  onClose?: () => void;
}

const variantStyles: Record<
  ToastVariant,
  {
    container: string;
    icon: string;
  }
> = {
  success: {
    container: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: "✓",
  },
  error: {
    container: "border-red-200 bg-red-50 text-red-900",
    icon: "!",
  },
  warning: {
    container: "border-amber-200 bg-amber-50 text-amber-900",
    icon: "!",
  },
  info: {
    container: "border-blue-200 bg-blue-50 text-blue-900",
    icon: "i",
  },
};

export function Toast({
  title,
  description,
  variant = "info",
  duration = 4000,
  action,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (!onClose || duration <= 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [duration, onClose]);

  const styles = variantStyles[variant];

  return (
    <div
      role="status"
      className={`w-full rounded-xl border p-4 shadow-lg ${styles.container}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/70 text-sm font-bold">
          {styles.icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{title}</p>

          {description && (
            <p className="mt-1 text-sm opacity-80">{description}</p>
          )}

          {action && <div className="mt-3">{action}</div>}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-current opacity-60 transition hover:bg-black/5 hover:opacity-100"
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
