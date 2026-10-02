import type { PaymentMethod } from "../../../types";

interface PaymentMethodBadgeProps {
  method: PaymentMethod;
}

const METHOD_CONFIG: Record<
  PaymentMethod,
  {
    label: string;
    icon: string;
  }
> = {
  CASH: {
    label: "Efectivo",
    icon: "💵",
  },

  BANK_TRANSFER: {
    label: "Transferencia",
    icon: "🏦",
  },

  DEBIT_CARD: {
    label: "Débito",
    icon: "💳",
  },

  CREDIT_CARD: {
    label: "Crédito",
    icon: "💳",
  },

  OTHER: {
    label: "Otro",
    icon: "•",
  },
};

export function PaymentMethodBadge({ method }: PaymentMethodBadgeProps) {
  const config = METHOD_CONFIG[method];

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-700">
      <span aria-hidden="true">{config.icon}</span>

      {config.label}
    </span>
  );
}
