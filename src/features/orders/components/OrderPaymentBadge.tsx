import type { PaymentStatus } from "../../../types";

interface OrderPaymentBadgeProps {
  status: PaymentStatus;
}

const PAYMENT_CONFIG: Record<
  PaymentStatus,
  {
    label: string;
    className: string;
  }
> = {
  UNPAID: {
    label: "Sin pagar",
    className: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  },

  PARTIAL: {
    label: "Pago parcial",
    className: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  },

  PAID: {
    label: "Pagado",
    className:
      "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  },
};

export function OrderPaymentBadge({ status }: OrderPaymentBadgeProps) {
  const config = PAYMENT_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
