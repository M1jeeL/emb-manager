import type { OrderDetail, OrderStatus } from "../../../types";

interface OrderStatusHistoryProps {
  order: OrderDetail;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  QUOTE: "Cotización",
  PENDING: "Pendiente",
  IN_PROGRESS: "En producción",
  READY: "Listo",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getUserName(history: OrderDetail["statusHistory"][number]) {
  if (!history.changedBy) {
    return "Sistema";
  }

  const fullName = [history.changedBy.firstName, history.changedBy.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || history.changedBy.email;
}

export function OrderStatusHistory({ order }: OrderStatusHistoryProps) {
  const history = [...order.statusHistory].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="font-semibold text-slate-900">Historial de estados</h2>

        <p className="mt-1 text-sm text-slate-500">
          Registro de los cambios realizados sobre esta orden.
        </p>
      </div>

      <div className="p-5 sm:p-6">
        {history.length === 0 ? (
          <p className="text-sm text-slate-500">No hay cambios registrados.</p>
        ) : (
          <ol className="relative ml-2 border-l border-slate-200">
            {history.map((entry) => {
              const fromLabel = entry.fromStatus
                ? (STATUS_LABELS[entry.fromStatus] ?? entry.fromStatus)
                : null;

              const toLabel = STATUS_LABELS[entry.toStatus] ?? entry.toStatus;

              return (
                <li key={entry.id} className="relative pb-7 pl-6 last:pb-0">
                  <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-900 ring-4 ring-white" />

                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {fromLabel ? `${fromLabel} → ${toLabel}` : toLabel}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Por {getUserName(entry)}
                      </p>

                      {entry.notes && (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                          {entry.notes}
                        </p>
                      )}
                    </div>

                    <time className="text-xs text-slate-400">
                      {formatDateTime(entry.createdAt)}
                    </time>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
