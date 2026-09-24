import type { OrderStatus } from "../../types/order";

interface OrderSummaryProps {
  itemCount: number;

  garmentCount: number;

  subtotal: number;

  discount: number;

  total: number;

  status: OrderStatus;

  onStatusChange?: (status: OrderStatus) => void;

  disabled?: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

const INITIAL_STATUSES: OrderStatus[] = ["QUOTE", "PENDING"];

const STATUS_LABELS: Record<OrderStatus, string> = {
  QUOTE: "Cotización",
  PENDING: "Pendiente",
  IN_PROGRESS: "En producción",
  READY: "Listo",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export function OrderSummary({
  itemCount,
  garmentCount,
  subtotal,
  discount,
  total,
  status,
  onStatusChange,
  disabled = false,
}: OrderSummaryProps) {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-base font-semibold text-slate-900">
          Resumen del pedido
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Revisa los datos antes de crear la cotización.
        </p>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Prendas</p>

            <p className="mt-1 text-lg font-semibold text-slate-900">
              {garmentCount}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Items</p>

            <p className="mt-1 text-lg font-semibold text-slate-900">
              {itemCount}
            </p>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Estado inicial
          </label>

          <select
            value={status}
            disabled={disabled}
            onChange={(event) =>
              onStatusChange?.(event.target.value as OrderStatus)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {INITIAL_STATUSES.map((initialStatus) => (
              <option key={initialStatus} value={initialStatus}>
                {STATUS_LABELS[initialStatus]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>

            <span className="font-medium text-slate-800">
              {formatCurrency(subtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Descuento</span>

            <span className="font-medium text-slate-800">
              {formatCurrency(discount)}
            </span>
          </div>

          <div className="flex items-end justify-between border-t border-slate-200 pt-3">
            <span className="text-sm font-semibold text-slate-700">Total</span>

            <span className="text-2xl font-bold text-slate-900">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
