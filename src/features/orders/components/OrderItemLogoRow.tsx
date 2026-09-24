interface OrderItemLogoRowProps {
  logo: {
    id: string;
    name: string;
    unitPrice: string;
    quantity: number;
  };

  maxQuantity: number;

  onQuantityChange: (quantity: number) => void;

  onRemove: () => void;

  disabled?: boolean;
}

function formatCurrency(value: string | number) {
  const amount = typeof value === "number" ? value : Number(value);

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function OrderItemLogoRow({
  logo,
  maxQuantity,
  onQuantityChange,
  onRemove,
  disabled = false,
}: OrderItemLogoRowProps) {
  const subtotal = Number(logo.unitPrice) * logo.quantity;

  function decrease() {
    if (logo.quantity <= 1) return;

    onQuantityChange(logo.quantity - 1);
  }

  function increase() {
    if (logo.quantity >= maxQuantity) return;

    onQuantityChange(logo.quantity + 1);
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">
          {logo.name}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          {formatCurrency(logo.unitPrice)} por unidad
        </p>
      </div>

      <div className="flex items-center rounded-md border border-slate-200">
        <button
          type="button"
          disabled={disabled || logo.quantity <= 1}
          onClick={decrease}
          className="px-2.5 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          −
        </button>

        <span className="min-w-8 text-center text-sm font-medium text-slate-800">
          {logo.quantity}
        </span>

        <button
          type="button"
          disabled={disabled || logo.quantity >= maxQuantity}
          onClick={increase}
          className="px-2.5 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </div>

      <div className="w-24 text-right">
        <p className="text-sm font-semibold text-slate-900">
          {formatCurrency(subtotal)}
        </p>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onRemove}
        className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={`Eliminar ${logo.name}`}
      >
        ×
      </button>
    </div>
  );
}
