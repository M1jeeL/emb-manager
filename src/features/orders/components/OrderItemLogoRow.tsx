interface OrderItemLogoRowProps {
  logo: {
    id: string;
    name: string;
    unitPrice: string;
    quantity: number;
    placement: string;
  };

  maxQuantity: number;

  onQuantityChange: (quantity: number) => void;
  onPlacementChange: (placement: string) => void;

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
  onPlacementChange,
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
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">
          {logo.name}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          {formatCurrency(logo.unitPrice)} por unidad
        </p>
        <label className="mt-2 block text-xs text-slate-500">Ubicación del bordado
          <input value={logo.placement} onChange={(event) => onPlacementChange(event.target.value)} disabled={disabled} maxLength={100} className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-800" placeholder="Pecho izquierdo, manga, espalda..." />
        </label>
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

        <input
          type="text"
          value={logo.quantity}
          onChange={(e) => onQuantityChange(Number(e.target.value))}
          className="min-w-10 text-center text-sm font-semibold text-slate-900 "
        />

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
