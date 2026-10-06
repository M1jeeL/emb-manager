export function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("es-CL").format(value);
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function formatHours(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "—";
  }

  if (value < 1) {
    return `${Math.round(value * 60)} min`;
  }

  return `${value.toFixed(1)} h`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${value}T12:00:00`));
}

export function getVariationClass(value: number | null | undefined) {
  if (value === null || value === undefined || value === 0) {
    return "text-slate-500";
  }

  return value > 0 ? "text-emerald-600" : "text-red-600";
}

export function getVariationIcon(value: number | null | undefined) {
  if (value === null || value === undefined || value === 0) {
    return "→";
  }

  return value > 0 ? "↑" : "↓";
}

export function getOrderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    QUOTE: "Cotización",
    PENDING: "Pendiente",
    IN_PROGRESS: "En producción",
    READY: "Listo",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
  };

  return labels[status] ?? status;
}

export function getPaymentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    UNPAID: "Pendiente",
    PARTIAL: "Abono parcial",
    PAID: "Pagado",
  };

  return labels[status] ?? status;
}

export function getPaymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    CASH: "Efectivo",
    BANK_TRANSFER: "Transferencia",
    DEBIT_CARD: "Débito",
    CREDIT_CARD: "Crédito",
    OTHER: "Otro",
  };

  return labels[method] ?? method;
}
