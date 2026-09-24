import { useEffect, useMemo, useRef, useState } from "react";

import { useLogos } from "../../../hooks/useLogos";

import type { Logo, LogoFilters } from "../../../types";

interface OrderLogoSelectorProps {
  customerId?: string;

  itemQuantity: number;

  selectedLogoIds: string[];

  onSelect: (logo: Logo) => void;

  onCreateNew: (name: string) => void;

  disabled?: boolean;
}

function formatCurrency(value: string) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function OrderLogoSelector({
  customerId,
  itemQuantity,
  selectedLogoIds,
  onSelect,
  onCreateNew,
  disabled = false,
}: OrderLogoSelectorProps) {
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const filters = useMemo<LogoFilters>(
    () => ({
      page: 1,
      limit: 8,
      name: search.trim() || undefined,
      status: "ACTIVE",
    }),
    [search],
  );

  const { data, isLoading, isFetching, isError } = useLogos(filters);

  const logos = data?.data ?? [];

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

  function handleSelect(logo: Logo) {
    onSelect(logo);

    setSearch("");

    setOpen(false);
  }

  const trimmedSearch = search.trim();

  const exactMatch = logos.some(
    (logo) => logo.name.toLowerCase() === trimmedSearch.toLowerCase(),
  );

  const filteredLogos = logos.filter((logo) => {
    if (!customerId) {
      return true;
    }

    return logo.customerId === null || logo.customerId === customerId;
  });

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled || itemQuantity <= 0}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="text-base">＋</span>
        Agregar bordado
      </button>

      {open && !disabled && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-200 p-3">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar bordado..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {isLoading || isFetching ? (
              <div className="px-4 py-3 text-sm text-slate-500">
                Buscando bordados...
              </div>
            ) : isError ? (
              <div className="px-4 py-3 text-sm text-red-600">
                No fue posible cargar los bordados.
              </div>
            ) : filteredLogos.length > 0 ? (
              filteredLogos.map((logo) => {
                const selected = selectedLogoIds.includes(logo.id);

                return (
                  <button
                    key={logo.id}
                    type="button"
                    disabled={selected}
                    onClick={() => handleSelect(logo)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-50 disabled:cursor-default disabled:bg-slate-50 disabled:opacity-60"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {logo.name}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {logo.customerId
                          ? "Bordado del cliente"
                          : "Bordado general"}
                      </p>
                    </div>

                    <div className="ml-3 flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-700">
                        {formatCurrency(logo.currentPrice)}
                      </span>

                      {selected && (
                        <span className="text-xs font-medium text-slate-500">
                          Agregado
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : trimmedSearch ? (
              <div className="px-4 py-3 text-sm text-slate-500">
                No encontramos ese bordado.
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-slate-500">
                No hay bordados disponibles.
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
              Crear nuevo bordado{" "}
              <span className="font-semibold">"{trimmedSearch}"</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
