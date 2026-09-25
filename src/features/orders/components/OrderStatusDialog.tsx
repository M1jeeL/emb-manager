import { useMemo, useState } from "react";

import type { OrderStatus } from "../../../types";

interface OrderStatusDialogProps {
  currentStatus: OrderStatus;
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (status: OrderStatus, notes?: string) => Promise<void>;
}

const STATUS_OPTIONS: Array<{
  value: OrderStatus;
  label: string;
  description: string;
}> = [
  {
    value: "QUOTE",
    label: "Cotización",
    description: "El pedido todavía está en etapa de cotización.",
  },
  {
    value: "PENDING",
    label: "Pendiente",
    description: "El pedido fue confirmado y espera producción.",
  },
  {
    value: "IN_PROGRESS",
    label: "En producción",
    description: "El pedido se encuentra siendo bordado.",
  },
  {
    value: "READY",
    label: "Listo",
    description: "El pedido está listo para ser entregado.",
  },
  {
    value: "DELIVERED",
    label: "Entregado",
    description: "El pedido fue entregado al cliente.",
  },
  {
    value: "CANCELLED",
    label: "Cancelado",
    description: "El pedido fue cancelado.",
  },
];

export function OrderStatusDialog({
  currentStatus,
  open,
  loading = false,
  onClose,
  onConfirm,
}: OrderStatusDialogProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedOption = useMemo(
    () => STATUS_OPTIONS.find((option) => option.value === status),
    [status],
  );

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setValidationError(null);

    if (status === currentStatus) {
      setValidationError("Selecciona un estado diferente al actual.");
      return;
    }

    if (status === "CANCELLED" && !notes.trim()) {
      setValidationError("Indica el motivo de la cancelación.");
      return;
    }

    await onConfirm(status, notes.trim() || undefined);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-status-dialog-title"
        className="w-full max-w-lg rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="order-status-dialog-title"
                className="text-lg font-semibold text-slate-900"
              >
                Cambiar estado
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                El cambio quedará registrado en el historial.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          <div>
            <label
              htmlFor="order-status"
              className="block text-sm font-medium text-slate-700"
            >
              Nuevo estado
            </label>

            <select
              id="order-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as OrderStatus)}
              disabled={loading}
              className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {selectedOption && (
              <p className="mt-2 text-xs text-slate-500">
                {selectedOption.description}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="order-status-notes"
              className="block text-sm font-medium text-slate-700"
            >
              Nota del cambio
              {status === "CANCELLED" && (
                <span className="ml-1 text-red-500">*</span>
              )}
            </label>

            <textarea
              id="order-status-notes"
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              disabled={loading}
              className="mt-1.5 block w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              placeholder="Ej. Cliente confirmó el pedido..."
            />
          </div>

          {validationError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {validationError}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Confirmar cambio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
