import { useEffect, useState } from "react";

import type {
  EmployeeFilters as EmployeeFiltersType,
  EmployeeStatus,
} from "../../../types";

interface EmployeeFiltersProps {
  filters: EmployeeFiltersType;
  onChange: (filters: EmployeeFiltersType) => void;
}

const STATUS_OPTIONS: Array<{
  value: EmployeeStatus;
  label: string;
}> = [
  {
    value: "ACTIVE",
    label: "Activo",
  },
  {
    value: "INACTIVE",
    label: "Inactivo",
  },
];

export function EmployeeFilters({ filters, onChange }: EmployeeFiltersProps) {
  const [localName, setLocalName] = useState(filters.name ?? "");

  const [localEmail, setLocalEmail] = useState(filters.email ?? "");

  const [localPhone, setLocalPhone] = useState(filters.phone ?? "");

  const [localPosition, setLocalPosition] = useState(filters.position ?? "");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const name = localName.trim() || undefined;
      const email = localEmail.trim() || undefined;
      const phone = localPhone.trim() || undefined;
      const position = localPosition.trim() || undefined;

      if (
        name === filters.name &&
        email === filters.email &&
        phone === filters.phone &&
        position === filters.position
      ) {
        return;
      }

      onChange({
        ...filters,
        page: 1,
        name,
        email,
        phone,
        position,
      });
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [localName, localEmail, localPhone, localPosition, filters, onChange]);

  function handleStatusChange(status: EmployeeStatus | "") {
    onChange({
      ...filters,
      page: 1,
      status: status || undefined,
    });
  }

  function clearFilters() {
    setLocalName("");
    setLocalEmail("");
    setLocalPhone("");
    setLocalPosition("");

    onChange({
      page: 1,
      limit: filters.limit ?? 20,
    });
  }

  const hasActiveFilters =
    Boolean(filters.name) ||
    Boolean(filters.email) ||
    Boolean(filters.phone) ||
    Boolean(filters.position) ||
    Boolean(filters.status);

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">Filtros</h2>

          <p className="text-sm text-slate-500">
            Busca y filtra los empleados registrados.
          </p>
        </div>

        {hasActiveFilters && (
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
            type="text"
            value={localName}
            onChange={(event) => setLocalName(event.target.value)}
            placeholder="Buscar empleado..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Correo
          </label>

          <input
            type="text"
            value={localEmail}
            onChange={(event) => setLocalEmail(event.target.value)}
            placeholder="correo@..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Teléfono
          </label>

          <input
            type="text"
            value={localPhone}
            onChange={(event) => setLocalPhone(event.target.value)}
            placeholder="+569..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Cargo
          </label>

          <input
            type="text"
            value={localPosition}
            onChange={(event) => setLocalPosition(event.target.value)}
            placeholder="Ej. Bordador"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Estado
          </label>

          <select
            value={filters.status ?? ""}
            onChange={(event) =>
              handleStatusChange(event.target.value as EmployeeStatus | "")
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">Todos</option>

            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
