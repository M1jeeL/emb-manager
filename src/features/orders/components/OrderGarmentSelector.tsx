import { useEffect, useMemo, useRef, useState } from "react";

import { useGarments } from "../../../hooks/useGarments";

import type { Garment, GarmentFilters } from "../../../types";

interface OrderGarmentSelectorProps {
  value: Garment | null;

  onChange: (garment: Garment | null) => void;

  onCreateNew: (name: string) => void;

  disabled?: boolean;
}

export function OrderGarmentSelector({
  value,
  onChange,
  onCreateNew,
  disabled = false,
}: OrderGarmentSelectorProps) {
  const [search, setSearch] = useState(() => value?.name ?? "");

  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const filters = useMemo<GarmentFilters>(
    () => ({
      page: 1,
      limit: 8,
      name: search.trim() || undefined,
    }),
    [search],
  );

  const { data, isLoading, isFetching, isError } = useGarments(filters);

  const garments = data?.data ?? [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSelect(garment: Garment) {
    onChange(garment);
    setSearch(garment.name);
    setOpen(false);
  }

  function handleClear() {
    onChange(null);
    setSearch("");
    setOpen(true);
  }

  const trimmedSearch = search.trim();

  const exactMatch = garments.some(
    (garment) => garment.name.toLowerCase() === trimmedSearch.toLowerCase(),
  );

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        Prenda
      </label>

      <div className="relative">
        <input
          type="text"
          value={search}
          disabled={disabled}
          placeholder="Buscar prenda..."
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setSearch(event.target.value);
            onChange(null);
            setOpen(true);
          }}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100"
        />

        {value && (
          <button
            type="button"
            disabled={disabled}
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            aria-label="Cambiar prenda"
          >
            ×
          </button>
        )}
      </div>

      {open && !disabled && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="max-h-64 overflow-y-auto">
            {isLoading || isFetching ? (
              <div className="px-4 py-3 text-sm text-slate-500">
                Buscando prendas...
              </div>
            ) : isError ? (
              <div className="px-4 py-3 text-sm text-red-600">
                No fue posible cargar las prendas.
              </div>
            ) : garments.length > 0 ? (
              garments.map((garment) => (
                <button
                  key={garment.id}
                  type="button"
                  onClick={() => handleSelect(garment)}
                  className="w-full px-4 py-3 text-left text-sm transition hover:bg-slate-50"
                >
                  <p className="font-medium text-slate-900">{garment.name}</p>

                  {garment.description && (
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {garment.description}
                    </p>
                  )}
                </button>
              ))
            ) : trimmedSearch ? (
              <div className="px-4 py-3 text-sm text-slate-500">
                No encontramos esa prenda.
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-slate-500">
                Escribe para buscar una prenda.
              </div>
            )}
          </div>

          {trimmedSearch && !exactMatch && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onCreateNew(trimmedSearch);
              }}
              className="flex w-full items-center gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-blue-600 transition hover:bg-blue-50"
            >
              <span className="text-base">＋</span>
              Crear nueva prenda{" "}
              <span className="font-semibold">"{trimmedSearch}"</span>
            </button>
          )}
        </div>
      )}

      {value && (
        <p className="mt-1.5 text-xs text-slate-500">
          Prenda seleccionada: {value.name}
        </p>
      )}
    </div>
  );
}
