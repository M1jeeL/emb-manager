import { useMemo } from "react";

import type { OrderDetail, OrderStatus } from "../../../types";

import { OrderPaymentBadge } from "./OrderPaymenBadge";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderDetailHeaderProps {
  order: OrderDetail;
  onBack: () => void;
  onEdit: () => void;
  onChangeStatus: () => void;
  disabled?: boolean;
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
  }).format(new Date(value));
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  QUOTE: "Cotización",
  PENDING: "Pendiente",
  IN_PROGRESS: "En producción",
  READY: "Listo",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export function OrderDetailHeader({
  order,
  onBack,
  onEdit,
  onChangeStatus,
  disabled = false,
}: OrderDetailHeaderProps) {
  const statusLabel = useMemo(
    () => STATUS_LABELS[order.status] ?? order.status,
    [order.status],
  );

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        <span aria-hidden="true">←</span>
        Volver a pedidos
      </button>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-500">
              Pedido #{order.orderNumber}
            </span>

            <OrderStatusBadge status={order.status} />
            <OrderPaymentBadge status={order.paymentStatus} />
          </div>

          <h1 className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-950">
            {order.customer.name}
          </h1>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
            <span>Creado {formatDate(order.orderedAt)}</span>

            {order.promisedAt && (
              <span>
                Entrega comprometida:{" "}
                <strong className="font-medium text-slate-700">
                  {formatDate(order.promisedAt)}
                </strong>
              </span>
            )}

            {order.deliveredAt && (
              <span>
                Entregado:{" "}
                <strong className="font-medium text-slate-700">
                  {formatDate(order.deliveredAt)}
                </strong>
              </span>
            )}
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Estado actual: {statusLabel}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onEdit}
            disabled={disabled}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={onChangeStatus}
            disabled={disabled}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cambiar estado
          </button>
        </div>
      </div>
    </div>
  );
}