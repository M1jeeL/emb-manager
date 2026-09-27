import { useEffect, useState } from "react";

import { OrderCustomerSelector } from "./OrderCustomerSelector";

import type {
  Customer,
  OrderFilters as OrderFiltersType,
  OrderStatus,
  PaymentStatus,
} from "../../../types";

interface OrderFiltersProps {
  filters: OrderFiltersType;
  selectedCustomer: Customer | null;
  onChange: (filters: OrderFiltersType) => void;
  onCustomerChange: (customer: Customer | null) => void;
}

const ORDER_STATUS_OPTIONS: Array<{
  value: OrderStatus;
  label: string;
}> = [
  {
    value: "QUOTE",
    label: "Cotización",
  },
  {
    value: "PENDING",
    label: "Pendiente",
  },
  {
    value: "IN_PROGRESS",
    label: "En producción",
  },
  {
    value: "READY",
    label: "Listo",
  },
  {
    value: "DELIVERED",
    label: "Entregado",
  },
  {
    value: "CANCELLED",
    label: "Cancelado",
  },
];

const PAYMENT_STATUS_OPTIONS: Array<{
  value: PaymentStatus;
  label: string;
}> = [
  {
    value: "UNPAID",
    label: "Sin pagar",
  },
  {
    value: "PARTIAL",
    label: "Pago parcial",
  },
  {
    value: "PAID",
    label: "Pagado",
  },
];

function parsePositiveInteger(value: string) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return undefined;
  }

  return parsed;
}

export function OrderFilters({
  filters,
  selectedCustomer,
  onChange,
  onCustomerChange,
}: OrderFiltersProps) {
  const [localOrderNumber, setLocalOrderNumber] = useState(
    filters.orderNumber ? String(filters.orderNumber) : "",
  );
  console.log(filters);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const parsed = localOrderNumber.trim()
        ? parsePositiveInteger(localOrderNumber.trim())
        : undefined;

      const current = filters.orderNumber;

      if (parsed === current) {
        return;
      }

      onChange({
        ...filters,
        page: 1,
        orderNumber: parsed,
      });
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [localOrderNumber, filters, onChange]);

  function updateImmediateFilter<
    K extends keyof Pick<
      OrderFiltersType,
      | "status"
      | "paymentStatus"
      | "orderedFrom"
      | "orderedTo"
      | "promisedFrom"
      | "promisedTo"
    >,
  >(key: K, value: OrderFiltersType[K]) {
    onChange({
      ...filters,
      page: 1,
      [key]: value || undefined,
    });
  }

  function handleCustomerChange(customer: Customer | null) {
    onCustomerChange(customer);

    onChange({
      ...filters,
      page: 1,
      customerId: customer?.id || undefined,
    });
  }

  function clearFilters() {
    setLocalOrderNumber("");

    onCustomerChange(null);

    onChange({
      page: 1,
      limit: filters.limit ?? 20,
    });
  }

  const hasActiveFilters =
    Boolean(filters.orderNumber) ||
    Boolean(filters.customerId) ||
    Boolean(filters.status) ||
    Boolean(filters.paymentStatus) ||
    Boolean(filters.orderedFrom) ||
    Boolean(filters.orderedTo) ||
    Boolean(filters.promisedFrom) ||
    Boolean(filters.promisedTo);

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">Filtros</h2>

          <p className="mt-1 text-sm text-slate-500">
            Busca pedidos utilizando uno o varios criterios.
          </p>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-indigo-600 transition hover:text-indigo-800"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Número */}
        <div>
          <label
            htmlFor="order-number"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            N.º de pedido
          </label>

          <input
            id="order-number"
            type="number"
            min={1}
            step={1}
            value={localOrderNumber}
            onChange={(event) => setLocalOrderNumber(event.target.value)}
            placeholder="Ej. 1005"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Cliente */}
        <div>
          <OrderCustomerSelector
            value={selectedCustomer}
            onChange={handleCustomerChange}
          />
        </div>

        {/* Estado */}
        <div>
          <label
            htmlFor="order-status"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Estado
          </label>

          <select
            id="order-status"
            value={filters.status ?? ""}
            onChange={(event) =>
              updateImmediateFilter(
                "status",
                event.target.value
                  ? (event.target.value as OrderStatus)
                  : undefined,
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">Todos</option>

            {ORDER_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Estado de pago */}
        <div>
          <label
            htmlFor="payment-status"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Estado de pago
          </label>

          <select
            id="payment-status"
            value={filters.paymentStatus ?? ""}
            onChange={(event) =>
              updateImmediateFilter(
                "paymentStatus",
                event.target.value
                  ? (event.target.value as PaymentStatus)
                  : undefined,
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">Todos</option>

            {PAYMENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Pedido desde */}
        <div>
          <label
            htmlFor="ordered-from"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Pedido desde
          </label>

          <input
            id="ordered-from"
            type="date"
            value={filters.orderedFrom ?? ""}
            onChange={(event) =>
              updateImmediateFilter(
                "orderedFrom",
                event.target.value || undefined,
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Pedido hasta */}
        <div>
          <label
            htmlFor="ordered-to"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Pedido hasta
          </label>

          <input
            id="ordered-to"
            type="date"
            value={filters.orderedTo ?? ""}
            onChange={(event) =>
              updateImmediateFilter(
                "orderedTo",
                event.target.value || undefined,
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Entrega desde */}
        <div>
          <label
            htmlFor="promised-from"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Entrega desde
          </label>

          <input
            id="promised-from"
            type="date"
            value={filters.promisedFrom ?? ""}
            onChange={(event) =>
              updateImmediateFilter(
                "promisedFrom",
                event.target.value || undefined,
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Entrega hasta */}
        <div>
          <label
            htmlFor="promised-to"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Entrega hasta
          </label>

          <input
            id="promised-to"
            type="date"
            value={filters.promisedTo ?? ""}
            onChange={(event) =>
              updateImmediateFilter(
                "promisedTo",
                event.target.value || undefined,
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>
    </div>
  );
}
