import { useEffect, useState } from "react";

import type {
  MachineFilters as MachineFiltersType,
  MachineStatus,
  MachineType,
} from "../../../types";

interface MachineFiltersProps {
  filters: MachineFiltersType;
  onChange: (filters: MachineFiltersType) => void;
}

export function MachineFilters({ filters, onChange }: MachineFiltersProps) {
  const [localFilters, setLocalFilters] = useState<MachineFiltersType>(filters);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextFilters: MachineFiltersType = {
        ...filters,
        name: localFilters.name || undefined,
        code: localFilters.code || undefined,
        brand: localFilters.brand || undefined,
        model: localFilters.model || undefined,
        serialNumber: localFilters.serialNumber || undefined,
        page: 1,
      };

      const changed =
        nextFilters.name !== filters.name ||
        nextFilters.code !== filters.code ||
        nextFilters.brand !== filters.brand ||
        nextFilters.model !== filters.model ||
        nextFilters.serialNumber !== filters.serialNumber;

      if (changed) {
        onChange(nextFilters);
      }
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [localFilters, filters, onChange]);

  const updateTextFilter = (
    field: "name" | "code" | "brand" | "model" | "serialNumber",
    value: string,
  ) => {
    setLocalFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateImmediateFilter = (field: "type" | "status", value: string) => {
    const nextValue = value || undefined;

    setLocalFilters((current) => ({
      ...current,
      [field]: nextValue,
    }));

    onChange({
      ...filters,
      [field]: nextValue as MachineType | MachineStatus | undefined,
      page: 1,
    });
  };

  const clearFilters = () => {
    const cleared: MachineFiltersType = {
      page: 1,
      limit: filters.limit ?? 20,
    };

    setLocalFilters(cleared);
    onChange(cleared);
  };

  const hasFilters = Boolean(
    filters.name ||
    filters.code ||
    filters.brand ||
    filters.model ||
    filters.serialNumber ||
    filters.type ||
    filters.status,
  );

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">Filtros</h2>

          <p className="text-sm text-slate-500">
            Busca máquinas por sus datos principales.
          </p>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
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
            placeholder="Buscar por nombre"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Código
          </label>

          <input
            value={localFilters.code ?? ""}
            onChange={(event) => updateTextFilter("code", event.target.value)}
            placeholder="Buscar por código"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Marca
          </label>

          <input
            value={localFilters.brand ?? ""}
            onChange={(event) => updateTextFilter("brand", event.target.value)}
            placeholder="Buscar por marca"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Modelo
          </label>

          <input
            value={localFilters.model ?? ""}
            onChange={(event) => updateTextFilter("model", event.target.value)}
            placeholder="Buscar por modelo"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Número de serie
          </label>

          <input
            value={localFilters.serialNumber ?? ""}
            onChange={(event) =>
              updateTextFilter("serialNumber", event.target.value)
            }
            placeholder="Buscar por número de serie"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Tipo
          </label>

          <select
            value={localFilters.type ?? ""}
            onChange={(event) =>
              updateImmediateFilter("type", event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">Todos</option>
            <option value="EMBROIDERY">Bordado</option>
            <option value="MULTIHEAD">Multi-cabezal</option>
            <option value="SINGLEHEAD">Un cabezal</option>
            <option value="OTHER">Otro</option>
          </select>
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
            <option value="ACTIVE">Activas</option>
            <option value="MAINTENANCE">En mantenimiento</option>
            <option value="INACTIVE">Inactivas</option>
          </select>
        </div>
      </div>
    </div>
  );
}
