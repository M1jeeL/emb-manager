import { useState } from "react";

import type { OrderDetail } from "../../../types";

interface OrderDetailEditFormProps {
  order: OrderDetail;
  loading?: boolean;
  error?: string | null;
  onCancel: () => void;
  onSubmit: (data: {
    promisedAt?: string | null;
    discount?: string;
    notes?: string | null;
  }) => Promise<void>;
}

function formatDateInput(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function OrderDetailEditForm({
  order,
  loading = false,
  error,
  onCancel,
  onSubmit,
}: OrderDetailEditFormProps) {
  const [promisedAt, setPromisedAt] = useState(
    formatDateInput(order.promisedAt),
  );

  const [discount, setDiscount] = useState(String(Number(order.discount)));

  const [notes, setNotes] = useState(order.notes ?? "");

  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setValidationError(null);

    const numericDiscount = Number(discount);

    if (!Number.isFinite(numericDiscount) || numericDiscount < 0) {
      setValidationError(
        "El descuento debe ser un número válido mayor o igual a 0.",
      );
      return;
    }

    if (numericDiscount > Number(order.subtotal)) {
      setValidationError("El descuento no puede ser mayor al subtotal.");
      return;
    }

    if (promisedAt) {
      const selectedDate = new Date(`${promisedAt}T23:59:59`);

      if (Number.isNaN(selectedDate.getTime())) {
        setValidationError("La fecha comprometida no es válida.");
        return;
      }
    }

    await onSubmit({
      promisedAt: promisedAt || null,
      discount: String(numericDiscount),
      notes: notes.trim() || null,
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="font-semibold text-slate-900">Editar pedido</h2>

        <p className="mt-1 text-sm text-slate-500">
          Modifica la información administrativa de la orden.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
        <div>
          <label
            htmlFor="order-promised-at"
            className="block text-sm font-medium text-slate-700"
          >
            Fecha comprometida
          </label>

          <input
            id="order-promised-at"
            type="date"
            value={promisedAt}
            onChange={(event) => setPromisedAt(event.target.value)}
            disabled={loading}
            className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          />
        </div>

        <div>
          <label
            htmlFor="order-discount"
            className="block text-sm font-medium text-slate-700"
          >
            Descuento
          </label>

          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              $
            </span>

            <input
              id="order-discount"
              type="number"
              min="0"
              step="1"
              value={discount}
              onChange={(event) => setDiscount(event.target.value)}
              disabled={loading}
              className="block w-full rounded-lg border border-slate-300 py-2.5 pl-8 pr-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
            />
          </div>

          <p className="mt-1 text-xs text-slate-400">
            Subtotal actual: ${Number(order.subtotal).toLocaleString("es-CL")}
          </p>
        </div>

        <div>
          <label
            htmlFor="order-notes"
            className="block text-sm font-medium text-slate-700"
          >
            Notas
          </label>

          <textarea
            id="order-notes"
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            disabled={loading}
            className="mt-1.5 block w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
            placeholder="Notas internas del pedido..."
          />
        </div>

        {(validationError || error) && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {validationError ?? error}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
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
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </section>
  );
}
