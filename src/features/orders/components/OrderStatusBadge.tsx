import type { OrderStatus } from "../../../types";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    className: string;
  }
> = {
  QUOTE: {
    label: "Cotización",
    className: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  },

  PENDING: {
    label: "Pendiente",
    className: "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/20",
  },

  IN_PROGRESS: {
    label: "En producción",
    className: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  },

  READY: {
    label: "Listo",
    className:
      "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  },

  DELIVERED: {
    label: "Entregado",
    className: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
  },

  CANCELLED: {
    label: "Cancelado",
    className: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
