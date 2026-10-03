import { useEffect, useState } from "react";

import type { PaymentFilters as PaymentFiltersType } from "../../../types";

interface PaymentFiltersProps {
  filters: PaymentFiltersType;
  onChange: (filters: PaymentFiltersType) => void;
}

export function PaymentFilters({ filters, onChange }: PaymentFiltersProps) {
  const [localFilters, setLocalFilters] = useState<PaymentFiltersType>(filters);

  /*
   * Debounce para el número de pedido.
   *
   * Mientras el usuario escribe:
   *
   * 1
   * 10
   * 100
   * 1001
   *
   * no realizamos peticiones inmediatamente.
   *
   * Esperamos 400ms después de que deje de escribir.
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      const orderNumber =
        localFilters.orderNumber !== undefined
          ? localFilters.orderNumber
          : undefined;

      if (orderNumber === filters.orderNumber) {
        return;
      }

      onChange({
        ...filters,
        orderNumber,
        page: 1,
      });
    }, 400);

    return () => clearTimeout(timeout);
  }, [localFilters.orderNumber, filters, onChange]);

  function updateOrderNumber(value: string) {
    const normalized = value.replace(/\D/g, "");

    setLocalFilters((current) => ({
      ...current,
      orderNumber: normalized.length > 0 ? Number(normalized) : undefined,
    }));
  }

  function updateImmediateFilter(key: keyof PaymentFiltersType, value: string) {
    const nextFilters: PaymentFiltersType = {
      ...filters,
      page: 1,
      [key]: value || undefined,
    };

    setLocalFilters((current) => ({
      ...current,
      [key]: value || undefined,
      page: 1,
    }));

    onChange(nextFilters);
  }

  function clear() {
    const clearedFilters: PaymentFiltersType = {
      page: 1,
      limit: filters.limit ?? 20,
    };

    setLocalFilters(clearedFilters);

    onChange(clearedFilters);
  }

  const hasActiveFilters =
    filters.orderNumber !== undefined ||
    Boolean(filters.method) ||
    Boolean(filters.from) ||
    Boolean(filters.to);

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">Filtros</h2>

          <p className="text-sm text-slate-500">
            Busca pagos utilizando uno o varios criterios.
          </p>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clear}
            className="self-start text-sm font-medium text-indigo-600 hover:text-indigo-800 sm:self-auto"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Número de pedido */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            N° de pedido
          </label>

          <input
            type="text"
            inputMode="numeric"
            value={localFilters.orderNumber ?? ""}
            onChange={(event) => updateOrderNumber(event.target.value)}
            placeholder="Ej: 1001"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Método */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Método de pago
          </label>

          <select
            value={localFilters.method ?? ""}
            onChange={(event) =>
              updateImmediateFilter("method", event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">Todos</option>
            <option value="CASH">Efectivo</option>
            <option value="BANK_TRANSFER">Transferencia</option>
            <option value="DEBIT_CARD">Débito</option>
            <option value="CREDIT_CARD">Crédito</option>
            <option value="OTHER">Otro</option>
          </select>
        </div>

        {/* Desde */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Desde
          </label>

          <input
            type="date"
            value={localFilters.from ?? ""}
            onChange={(event) =>
              updateImmediateFilter("from", event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Hasta */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Hasta
          </label>

          <input
            type="date"
            value={localFilters.to ?? ""}
            onChange={(event) =>
              updateImmediateFilter("to", event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>
    </div>
  );
}
