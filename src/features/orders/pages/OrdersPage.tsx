import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useCustomer } from "../../../hooks/useCustomers";
import { useOrders } from "../../../hooks/useOrders";

import type {
  Customer,
  OrderFilters as OrderFiltersType,
} from "../../../types";

import { Button } from "../../../components/ui";
import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";

import { OrderFilters } from "../components/OrderFilters";
import { OrdersList } from "../components/OrdersList";

function parsePage(value: string | null) {
  if (!value) {
    return 1;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed >= 1 ? parsed : 1;
}

function parseLimit(value: string | null) {
  if (!value) {
    return 20;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 20;
  }

  return Math.min(parsed, 100);
}

function parseOrderNumber(value: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed >= 1 ? parsed : undefined;
}

export function OrdersPage() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilters: OrderFiltersType = {
    page: parsePage(searchParams.get("page")),
    limit: parseLimit(searchParams.get("limit")),

    orderNumber: parseOrderNumber(searchParams.get("orderNumber")),

    customerId: searchParams.get("customerId") || undefined,

    status:
      (searchParams.get("status") as OrderFiltersType["status"]) || undefined,

    paymentStatus:
      (searchParams.get(
        "paymentStatus",
      ) as OrderFiltersType["paymentStatus"]) || undefined,

    orderedFrom: searchParams.get("orderedFrom") || undefined,
    orderedTo: searchParams.get("orderedTo") || undefined,

    promisedFrom: searchParams.get("promisedFrom") || undefined,
    promisedTo: searchParams.get("promisedTo") || undefined,
  };
  const [filters, setFilters] = useState<OrderFiltersType>(initialFilters);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const { data: customerFromFilter } = useCustomer(filters.customerId);
  const customerForFilter = filters.customerId
    ? customerFromFilter ?? selectedCustomer
    : null;

  const { data, isLoading, isFetching, isError, error } = useOrders(filters);

  function updateUrl(nextFilters: OrderFiltersType) {
    const params = new URLSearchParams();

    if (nextFilters.orderNumber) {
      params.set("orderNumber", String(nextFilters.orderNumber));
    }

    if (nextFilters.customerId) {
      params.set("customerId", nextFilters.customerId);
    }

    if (nextFilters.status) {
      params.set("status", nextFilters.status);
    }

    if (nextFilters.paymentStatus) {
      params.set("paymentStatus", nextFilters.paymentStatus);
    }

    if (nextFilters.orderedFrom) {
      params.set("orderedFrom", nextFilters.orderedFrom);
    }

    if (nextFilters.orderedTo) {
      params.set("orderedTo", nextFilters.orderedTo);
    }

    if (nextFilters.promisedFrom) {
      params.set("promisedFrom", nextFilters.promisedFrom);
    }

    if (nextFilters.promisedTo) {
      params.set("promisedTo", nextFilters.promisedTo);
    }

    if (nextFilters.page && nextFilters.page > 1) {
      params.set("page", String(nextFilters.page));
    }

    if (nextFilters.limit && nextFilters.limit !== 20) {
      params.set("limit", String(nextFilters.limit));
    }

    setSearchParams(params);
  }

  function handleFiltersChange(nextFilters: OrderFiltersType) {
    if (nextFilters.customerId !== filters.customerId) {
      setSelectedCustomer(null);
    }

    setFilters(nextFilters);
    updateUrl(nextFilters);
  }

  function handleCustomerChange(customer: Customer | null) {
    setSelectedCustomer(customer);
  }

  function handlePageChange(page: number) {
    const safePage = Number.isInteger(page) && page >= 1 ? page : 1;

    handleFiltersChange({
      ...filters,
      page: safePage,
    });
  }

  function handleLimitChange(limit: number) {
    const safeLimit =
      Number.isInteger(limit) && limit >= 1 ? Math.min(limit, 100) : 20;

    handleFiltersChange({
      ...filters,
      page: 1,
      limit: safeLimit,
    });
  }

  const orders = data?.data ?? [];

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pedidos</h1>

          <p className="mt-1 text-sm text-slate-500">
            Gestiona tus pedidos, estados y pagos.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => navigate("/orders/new")}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700"
        >
          + Nueva orden
        </Button>
      </div>

      {/* Filtros */}
      <OrderFilters
        filters={filters}
        selectedCustomer={customerForFilter}
        onChange={handleFiltersChange}
        onCustomerChange={handleCustomerChange}
      />

      {/* Resultados */}
      {isLoading ? (
        <div className="rounded-xl bg-white p-10 text-center text-slate-500 shadow-sm">
          Cargando pedidos...
        </div>
      ) : isError ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {getApiErrorMessage(error)}
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <h3 className="font-semibold text-slate-900">
            {hasActiveFilters
              ? "No encontramos pedidos"
              : "Aún no tienes pedidos"}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {hasActiveFilters
              ? "Prueba cambiando los filtros utilizados."
              : "Crea tu primer pedido para comenzar a gestionar tu producción."}
          </p>

          {!hasActiveFilters && (
            <div className="mt-5">
              <Button
                type="button"
                onClick={() => navigate("/orders/new")}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700"
              >
                + Crear pedido
              </Button>
            </div>
          )}
        </div>
      ) : data ? (
        <OrdersList
          data={data}
          isFetching={isFetching}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      ) : null}
    </div>
  );
}
