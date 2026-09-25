import type { OrderItem } from "../../../types";

interface OrderDetailItemCardProps {
  item: OrderItem;
}

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

const ITEM_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En producción",
  READY: "Listo",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export function OrderDetailItemCard({ item }: OrderDetailItemCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">
              {item.garment.name}
            </h3>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {ITEM_STATUS_LABELS[item.status] ?? item.status}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Cantidad:{" "}
            <strong className="font-semibold text-slate-700">
              {item.quantity}
            </strong>
          </p>

          {item.description && (
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          )}

          {item.notes && (
            <p className="mt-2 whitespace-pre-wrap text-xs text-slate-500">
              Nota: {item.notes}
            </p>
          )}
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs text-slate-400">Subtotal</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {formatCurrency(item.subtotal)}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-200 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-800">Bordados</h4>

          <span className="text-xs text-slate-400">
            {item.logos.length} {item.logos.length === 1 ? "diseño" : "diseños"}
          </span>
        </div>

        {item.logos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-700">
            Esta prenda no tiene bordados asociados.
          </div>
        ) : (
          <div className="space-y-2">
            {item.logos.map((itemLogo) => {
              const subtotal = Number(itemLogo.unitPrice) * itemLogo.quantity;

              return (
                <div
                  key={itemLogo.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800">
                      {itemLogo.logoName}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {itemLogo.quantity} × {formatCurrency(itemLogo.unitPrice)}
                    </p>

                    {itemLogo.notes && (
                      <p className="mt-1 text-xs text-slate-400">
                        {itemLogo.notes}
                      </p>
                    )}
                  </div>

                  <p className="font-semibold text-slate-900">
                    {formatCurrency(subtotal)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}
