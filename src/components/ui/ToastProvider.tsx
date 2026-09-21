import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { Toast, type ToastVariant } from "../feedback/Toast";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (
      variant: ToastVariant,
      title: string,
      description?: string,
      duration = 4000,
    ) => {
      const id = Date.now() + Math.random();

      setToasts((current) => [
        ...current,
        {
          id,
          title,
          description,
          variant,
          duration,
        },
      ]);
    },
    [],
  );

  const success = useCallback(
    (title: string, description?: string) => {
      addToast("success", title, description);
    },
    [addToast],
  );

  const error = useCallback(
    (title: string, description?: string) => {
      addToast("error", title, description, 5000);
    },
    [addToast],
  );

  const warning = useCallback(
    (title: string, description?: string) => {
      addToast("warning", title, description);
    },
    [addToast],
  );

  const info = useCallback(
    (title: string, description?: string) => {
      addToast("info", title, description);
    },
    [addToast],
  );

  return (
    <ToastContext.Provider
      value={{
        success,
        error,
        warning,
        info,
      }}
    >
      {children}

      <div
        className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3 sm:right-6 sm:top-6"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              title={toast.title}
              description={toast.description}
              variant={toast.variant}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast debe utilizarse dentro de un ToastProvider");
  }

  return context;
}
