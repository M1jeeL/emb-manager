import { useEffect, useState } from "react";

import { formatRut } from "../../../lib/utils";
import type { CustomerFilters as CustomerFiltersType } from "../../../types";

interface CustomerFiltersProps {
  filters: CustomerFiltersType;
  onChange: (filters: CustomerFiltersType) => void;
}

export function CustomerFilters({ filters, onChange }: CustomerFiltersProps) {
  const [localFilters, setLocalFilters] =
    useState<CustomerFiltersType>(filters);

  /**
   * Debounce para los filtros de texto.
   *
   * Mientras el usuario escribe:
   *
   * j
   * ju
   * jua
   * juan
   *
   * NO hacemos peticiones.
   *
   * Esperamos 400ms después de que deje de escribir.
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      const textFilters = {
        name: localFilters.name,
        companyName: localFilters.companyName,
        phone: localFilters.phone,
        email: localFilters.email,
        taxId: localFilters.taxId,
      };

      const hasTextChanged =
        textFilters.name !== filters.name ||
        textFilters.companyName !== filters.companyName ||
        textFilters.phone !== filters.phone ||
        textFilters.email !== filters.email ||
        textFilters.taxId !== filters.taxId;

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

  function updateTextFilter(key: keyof CustomerFiltersType, value: string) {
    setLocalFilters((current) => ({
      ...current,
      [key]: value || undefined,
    }));
  }

  function updateImmediateFilter(
    key: keyof CustomerFiltersType,
    value: string,
  ) {
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
    const clearedFilters: CustomerFiltersType = {
      page: 1,
      limit: filters.limit ?? 20,
    };

    setLocalFilters(clearedFilters);
    onChange(clearedFilters);
  }

  const hasActiveFilters =
    Boolean(filters.name) ||
    Boolean(filters.companyName) ||
    Boolean(filters.phone) ||
    Boolean(filters.email) ||
    Boolean(filters.taxId) ||
    Boolean(filters.status);

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">Filtros</h2>

          <p className="text-sm text-slate-500">
            Busca clientes utilizando uno o varios criterios.
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
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nombre
          </label>

          <input
            value={localFilters.name ?? ""}
            onChange={(event) => updateTextFilter("name", event.target.value)}
            placeholder="Nombre del cliente"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Empresa
          </label>

          <input
            value={localFilters.companyName ?? ""}
            onChange={(event) =>
              updateTextFilter("companyName", event.target.value)
            }
            placeholder="Nombre de empresa"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Teléfono
          </label>

          <input
            value={localFilters.phone ?? ""}
            onChange={(event) => updateTextFilter("phone", event.target.value)}
            placeholder="+56 9..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>

          <input
            value={localFilters.email ?? ""}
            onChange={(event) => updateTextFilter("email", event.target.value)}
            placeholder="correo@empresa.cl"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            RUT
          </label>

          <input
            value={localFilters.taxId ?? ""}
            onChange={(event) =>
              updateTextFilter("taxId", formatRut(event.target.value))
            }
            placeholder="12.345.678-9"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

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
            <option value="INACTIVE">Inactivos</option>
          </select>
        </div>
      </div>
    </div>
  );
}
