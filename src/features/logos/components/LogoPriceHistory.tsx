import type { LogoPriceHistory } from "../../../types";

interface LogoPriceHistoryProps {
  history: LogoPriceHistory[];
}

function formatPrice(value: string) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function LogoPriceHistory({ history }: LogoPriceHistoryProps) {
  return (
    <section className="rounded-xl border bg-white">
      <div className="border-b p-5">
        <h2 className="font-semibold text-gray-900">Historial de precios</h2>

        <p className="mt-1 text-sm text-gray-500">
          Registro de los cambios de precio del logo.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="p-6 text-sm text-gray-500">
          No hay historial de precios.
        </div>
      ) : (
        <div className="divide-y">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-5"
            >
              <div>
                <p className="font-medium">{formatPrice(item.price)}</p>

                <p className="mt-1 text-xs text-gray-500">
                  {formatDate(item.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
