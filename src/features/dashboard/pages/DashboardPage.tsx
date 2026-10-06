import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  useDashboardAlerts,
  useDashboardCustomers,
  useDashboardOperations,
  useDashboardOverview,
  useDashboardProduction,
  useDashboardSales,
} from "../../../hooks/useDashboard";

import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";

import { DashboardHeader } from "../components/DashboardHeader";
import { OverviewSection } from "../components/OverviewSection";
import { SalesSection } from "../components/SalesSection";
import { OperationsSection } from "../components/OperationsSection";
import { ProductionSection } from "../components/ProductionSection";
import { CustomersSection } from "../components/CustomersSection";
import { AlertsSection } from "../components/AlertsSection";

function getDefaultPeriod() {
  const today = new Date();

  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  return {
    from: formatDateInput(firstDay),
    to: formatDateInput(nextMonth),
  };
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isValidDate(value: string | null) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const defaults = useMemo(() => getDefaultPeriod(), []);

  const initialFrom = isValidDate(searchParams.get("from"))
    ? searchParams.get("from")!
    : defaults.from;

  const initialTo = isValidDate(searchParams.get("to"))
    ? searchParams.get("to")!
    : defaults.to;

  const [from, setFrom] = useState(initialFrom);

  const [to, setTo] = useState(initialTo);

  const params = useMemo(
    () => ({
      from,
      to,
    }),
    [from, to],
  );

  const overviewQuery = useDashboardOverview(params);

  const salesQuery = useDashboardSales(params);

  const operationsQuery = useDashboardOperations(params);

  const productionQuery = useDashboardProduction(params);

  const customersQuery = useDashboardCustomers(params);

  const alertsQuery = useDashboardAlerts();

  function handlePeriodChange(values: { from: string; to: string }) {
    setFrom(values.from);
    setTo(values.to);

    const next = new URLSearchParams(searchParams);

    next.set("from", values.from);
    next.set("to", values.to);

    setSearchParams(next);
  }

  const queries = [
    overviewQuery,
    salesQuery,
    operationsQuery,
    productionQuery,
    customersQuery,
    alertsQuery,
  ];

  const isLoading = queries.some((query) => query.isLoading);

  const isError = queries.some((query) => query.isError);

  const isFetching = queries.some((query) => query.isFetching);

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (isError) {
    const error = queries.find((query) => query.error)?.error;

    return (
      <div className="space-y-6">
        <DashboardHeader
          from={from}
          to={to}
          onPeriodChange={handlePeriodChange}
        />

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-900">
            No se pudo cargar el Dashboard
          </p>

          <p className="mt-1 text-sm text-red-700">
            {getApiErrorMessage(error)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        from={from}
        to={to}
        onPeriodChange={handlePeriodChange}
      />

      {isFetching && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-medium text-blue-700">
          Actualizando información...
        </div>
      )}

      <OverviewSection data={overviewQuery.data!} />

      <SalesSection data={salesQuery.data!} />

      <OperationsSection data={operationsQuery.data!} />

      <ProductionSection data={productionQuery.data!} />

      <CustomersSection data={customersQuery.data!} />

      <AlertsSection data={alertsQuery.data!} />
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl bg-slate-100"
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}
