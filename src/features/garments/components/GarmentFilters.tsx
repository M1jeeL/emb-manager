import { useEffect, useState } from "react";

import { Input, Select } from "../../../components/ui";

import type { GarmentFilters as GarmentFiltersType } from "../../../types";

interface GarmentFiltersProps {
  filters: GarmentFiltersType;
  onChange: (filters: GarmentFiltersType) => void;
}

export function GarmentFilters({ filters, onChange }: GarmentFiltersProps) {
  const [localFilters, setLocalFilters] = useState<GarmentFiltersType>(filters);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const textFilters = {
        name: localFilters.name,
        description: localFilters.description,
      };

      const hasTextChanged =
        textFilters.name !== filters.name ||
        textFilters.description !== filters.description;

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

  function updateTextFilter(key: keyof GarmentFiltersType, value: string) {
    setLocalFilters((current) => ({
      ...current,
      [key]: value || undefined,
    }));
  }

  function updateImmediateFilter(key: keyof GarmentFiltersType, value: string) {
    const nextFilters: GarmentFiltersType = {
      ...filters,
      page: 1,
      [key]: value,
    };
    setLocalFilters((current) => ({ ...current, [key]: value, page: 1 }));
    onChange(nextFilters);
  }

  function clear() {
    const clearedFilters: GarmentFiltersType = {
      page: 1,
      limit: filters.limit ?? 20,
    };

    setLocalFilters(clearedFilters);
    onChange(clearedFilters);
  }

  const hasActiveFilters =
    Boolean(filters.name) ||
    Boolean(filters.description) ||
    filters.active !== undefined;

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">Filtros</h2>

          <p className="text-sm text-slate-500">
            Busca prendas utilizando uno o varios criterios.
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
          <Input
            value={localFilters.name ?? ""}
            label="Nombre"
            onChange={(event) => updateTextFilter("name", event.target.value)}
            placeholder="Nombre de la prenda"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <Input
            label="Descripción"
            value={localFilters.description ?? ""}
            onChange={(event) =>
              updateTextFilter("description", event.target.value)
            }
            placeholder="Descripcion"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <Select
            label="Estado"
            value={
              localFilters.active === undefined
                ? ""
                : String(localFilters.active)
            }
            onChange={(event) =>
              updateImmediateFilter("active", event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            options={[
              {
                value: "",
                label: "Todos",
              },
              {
                value: "true",
                label: "Activos",
              },
              {
                value: "false",
                label: "Inactivos",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
