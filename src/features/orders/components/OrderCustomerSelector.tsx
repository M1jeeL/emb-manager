import { useEffect, useMemo, useRef, useState } from "react";

import { useCustomers } from "../../../hooks/useCustomers";

import type { Customer, CustomerFilters } from "../../../types";

interface OrderCustomerSelectorProps {
  value: Customer | null;

  onChange: (customer: Customer | null) => void;

  onCreateNew: (name: string) => void;

  disabled?: boolean;
}

export function OrderCustomerSelector({
  value,
  onChange,
  onCreateNew,
  disabled = false,
}: OrderCustomerSelectorProps) {
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const filters = useMemo<CustomerFilters>(
    () => ({
      page: 1,
      limit: 8,
      name: search.trim() || undefined,
      status: "ACTIVE",
    }),
    [search],
  );

  const { data, isLoading, isFetching, isError } = useCustomers(filters);

  const customers = data?.data ?? [];

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

  function handleSelect(customer: Customer) {
    onChange(customer);
    setSearch(customer.name);
    setOpen(false);
  }

  function handleClear() {
    onChange(null);
    setSearch("");
    setOpen(true);
  }

  const trimmedSearch = search.trim();

  const exactMatch = customers.some(
    (customer) => customer.name.toLowerCase() === trimmedSearch.toLowerCase(),
  );

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        Cliente
      </label>

      <div className="relative">
        <input
          type="text"
          value={value?.name ?? search}
          disabled={disabled}
          placeholder="Buscar cliente por nombre..."
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
            aria-label="Cambiar cliente"
          >
            ×
          </button>
        )}
      </div>

      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="max-h-72 overflow-y-auto">
            {isLoading || isFetching ? (
              <div className="px-4 py-3 text-sm text-slate-500">
                Buscando clientes...
              </div>
            ) : isError ? (
              <div className="px-4 py-3 text-sm text-red-600">
                No fue posible cargar los clientes.
              </div>
            ) : customers.length > 0 ? (
              customers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => handleSelect(customer)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {customer.name}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {customer.companyName ||
                        customer.phone ||
                        customer.email ||
                        "Sin información adicional"}
                    </p>
                  </div>

                  {value?.id === customer.id && (
                    <span className="ml-3 text-sm font-medium text-blue-600">
                      ✓
                    </span>
                  )}
                </button>
              ))
            ) : trimmedSearch ? (
              <div className="px-4 py-3 text-sm text-slate-500">
                No encontramos un cliente con ese nombre.
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-slate-500">
                Escribe el nombre del cliente para buscar.
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
              Crear nuevo cliente{" "}
              <span className="font-semibold">"{trimmedSearch}"</span>
            </button>
          )}
        </div>
      )}

      {value && (
        <p className="mt-1.5 text-xs text-slate-500">
          Cliente seleccionado: {value.name}
        </p>
      )}
    </div>
  );
}
