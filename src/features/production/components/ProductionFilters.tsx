import { useEffect, useState } from "react";

import type {
  ProductionFilters as ProductionFiltersType,
  ProductionJobStatus,
} from "../../../types";

interface ProductionFiltersProps {
  filters: ProductionFiltersType;
  onChange: (filters: ProductionFiltersType) => void;
}

const statuses: Array<{
  value: ProductionJobStatus;
  label: string;
}> = [
  { value: "PENDING", label: "Pendiente" },
  { value: "IN_PROGRESS", label: "En producción" },
  { value: "PAUSED", label: "Pausada" },
  { value: "COMPLETED", label: "Completada" },
  { value: "CANCELLED", label: "Cancelada" },
];

export function ProductionFilters({
  filters,
  onChange,
}: ProductionFiltersProps) {
  const [orderNumber, setOrderNumber] = useState(
    filters.orderNumber ? String(filters.orderNumber) : "",
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      const parsed = Number(orderNumber);

      const nextOrderNumber =
        orderNumber.trim() && Number.isInteger(parsed) && parsed > 0
          ? parsed
          : undefined;

      if (nextOrderNumber !== filters.orderNumber) {
        onChange({
          ...filters,
          orderNumber: nextOrderNumber,
          page: 1,
        });
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [orderNumber, filters, onChange]);

  function updateStatus(value: string) {
    onChange({
      ...filters,
      status: (value as ProductionJobStatus) || undefined,
      page: 1,
    });
  }

  function clear() {
    setOrderNumber("");

    onChange({
      page: 1,
      limit: filters.limit ?? 20,
    });
  }

  const hasActiveFilters =
    Boolean(filters.status) || Boolean(filters.orderNumber);

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">Filtros</h2>

          <p className="text-sm text-slate-500">
            Encuentra rápidamente trabajos de producción.
          </p>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clear}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="production-order-number"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Número de pedido
          </label>

          <input
            id="production-order-number"
            type="number"
            min={1}
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
            placeholder="Ej. 1001"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label
            htmlFor="production-status"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Estado
          </label>

          <select
            id="production-status"
            value={filters.status ?? ""}
            onChange={(event) => updateStatus(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Todos los estados</option>

            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
