import { useEffect, useState } from "react";

import { useCustomers } from "../../../hooks/useCustomers";

import type { LogoFilters as LogoFiltersType } from "../../../types";

interface LogoFiltersProps {
  filters: LogoFiltersType;
  onChange: (filters: LogoFiltersType) => void;
}

export function LogoFilters({ filters, onChange }: LogoFiltersProps) {
  const [localFilters, setLocalFilters] = useState<LogoFiltersType>(filters);

  const { data: customersData, isLoading: customersLoading } = useCustomers({
    page: 1,
    limit: 100,
    status: "ACTIVE",
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      const textFilters = {
        name: localFilters.name,
      };

      const hasTextChanged = textFilters.name !== filters.name;

      if (!hasTextChanged) {
        return;
      }

      onChange({
        ...filters,
        ...textFilters,
        page: 1,
      });
    }, 400);

    return () => clearTimeout(timeout);
  }, [localFilters, filters, onChange]);

  function updateTextFilter(key: keyof LogoFiltersType, value: string) {
    setLocalFilters((current) => ({
      ...current,
      [key]: value || undefined,
    }));
  }

  function updateImmediateFilter(key: keyof LogoFiltersType, value: string) {
    const nextFilters = {
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
    const clearedFilters: LogoFiltersType = {
      page: 1,
      limit: filters.limit ?? 20,
    };

    setLocalFilters(clearedFilters);
    onChange(clearedFilters);
  }

  const hasActiveFilters =
    Boolean(filters.name) ||
    Boolean(filters.customerId) ||
    Boolean(filters.status);

  const customers = customersData?.data ?? [];

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">Filtros</h2>

          <p className="text-sm text-slate-500">
            Busca logos utilizando uno o varios criterios.
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Nombre */}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nombre
          </label>

          <input
            value={localFilters.name ?? ""}
            onChange={(event) => updateTextFilter("name", event.target.value)}
            placeholder="Nombre del logo"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Cliente */}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Cliente
          </label>

          <select
            value={localFilters.customerId ?? ""}
            onChange={(event) =>
              updateImmediateFilter("customerId", event.target.value)
            }
            disabled={customersLoading}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
          >
            <option value="">
              {customersLoading ? "Cargando clientes..." : "Todos los clientes"}
            </option>

            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
                {customer.companyName ? ` — ${customer.companyName}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Estado */}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Estado
          </label>

          <select
            value={localFilters.status ?? ""}
            onChange={(event) =>
              updateImmediateFilter("status", event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">Todos</option>

            <option value="ACTIVE">Activos</option>

            <option value="ARCHIVED">Archivados</option>
          </select>
        </div>
      </div>
    </div>
  );
}
