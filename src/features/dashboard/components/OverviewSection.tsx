import type { DashboardOverviewResponse } from "../../../types";

import { DashboardKpiCard } from "./DashboardKpiCard";

import { formatCurrency, formatNumber } from "../dashboard.utils";

interface OverviewSectionProps {
  data: DashboardOverviewResponse;
}

export function OverviewSection({ data }: OverviewSectionProps) {
  const sales = data.periodMetrics.sales;
  const orders = data.periodMetrics.orders;
  const customers = data.periodMetrics.customers;
  const current = data.current;

  const hasOverdueOrders = current.orders.overdue > 0;
  const hasReceivables = current.receivables.amount !== "0";
  const hasProduction = current.production.inProgressJobs > 0;
  const hasPendingProduction = current.production.pendingJobs > 0;

  const hasOperationalAlerts =
    hasOverdueOrders || hasReceivables || current.machines.maintenance > 0;

  return (
    <section className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-950">Resumen</h2>

        <p className="text-sm text-slate-500">
          Una vista general del estado financiero y operativo del negocio.
        </p>
      </div>

      {/* KPIs principales */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardKpiCard
          label="Ventas"
          value={formatCurrency(sales.revenue)}
          variation={sales.revenueVariationPercent}
          icon="$"
        />

        <DashboardKpiCard
          label="Cobros"
          value={formatCurrency(sales.paid)}
          variation={sales.paidVariationPercent}
          icon="✓"
        />

        <DashboardKpiCard
          label="Ticket promedio"
          value={formatCurrency(sales.averageOrderValue)}
          icon="◉"
        />

        <DashboardKpiCard
          label="Pedidos"
          value={formatNumber(orders.created)}
          variation={sales.ordersVariationPercent}
          icon="#"
        />
      </div>

      {/* Estado operativo */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-950">Estado operativo</h3>

            <p className="text-xs text-slate-500">
              Situación actual de los pedidos del taller.
            </p>
          </div>

          {hasOperationalAlerts ? (
            <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              Requiere atención
            </span>
          ) : (
            <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Operación estable
            </span>
          )}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <OperationalMetric
            label="Pendientes"
            value={current.orders.pending}
            description="Esperando producción"
          />

          <OperationalMetric
            label="En producción"
            value={current.orders.inProgress}
            description="Pedidos en proceso"
            active={current.orders.inProgress > 0}
          />

          <OperationalMetric
            label="Listos"
            value={current.orders.ready}
            description="Esperando entrega"
          />

          <OperationalMetric
            label="Atrasados"
            value={current.orders.overdue}
            description={
              hasOverdueOrders ? "Requieren atención" : "Sin pedidos atrasados"
            }
            danger={hasOverdueOrders}
          />
        </div>
      </div>

      {/* Finanzas + clientes + producción */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Cobranza */}
        <div
          className={`rounded-2xl border bg-white p-5 shadow-sm ${
            hasReceivables ? "border-amber-200" : "border-slate-200"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-950">Por cobrar</h3>

              <p className="mt-1 text-xs text-slate-500">
                Dinero pendiente de recibir.
              </p>
            </div>

            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                hasReceivables
                  ? "bg-amber-50 text-amber-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              $
            </div>
          </div>

          <p
            className={`mt-6 text-2xl font-bold ${
              hasReceivables ? "text-amber-600" : "text-slate-950"
            }`}
          >
            {formatCurrency(current.receivables.amount)}
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
            <span className="text-slate-500">Pedidos pendientes</span>

            <span className="font-semibold text-slate-900">
              {formatNumber(current.receivables.orders)}
            </span>
          </div>
        </div>

        {/* Producción */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-950">Producción</h3>

              <p className="mt-1 text-xs text-slate-500">
                Carga actual del taller.
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              ⚙
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <MiniStat
              label="Pendientes"
              value={current.production.pendingJobs}
              warning={hasPendingProduction}
            />

            <MiniStat
              label="En producción"
              value={current.production.inProgressJobs}
              active={hasProduction}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniStat
              label="Unidades pendientes"
              value={current.production.pendingUnits}
            />

            <MiniStat
              label="Unidades activas"
              value={current.production.inProgressUnits}
            />
          </div>
        </div>

        {/* Clientes + máquinas */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-950">
                Clientes y recursos
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Crecimiento y estado de los recursos.
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              +
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs text-slate-500">Clientes nuevos</p>

            <p className="mt-1 text-2xl font-bold text-slate-950">
              {formatNumber(customers.newCustomers)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Durante el período seleccionado
            </p>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">Estado de máquinas</p>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <ResourceStat label="Activas" value={current.machines.active} />

              <ResourceStat
                label="Mantención"
                value={current.machines.maintenance}
                warning={current.machines.maintenance > 0}
              />

              <ResourceStat
                label="Inactivas"
                value={current.machines.inactive}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actividad del período */}
      <div className="grid gap-4 lg:grid-cols-3">
        <PeriodCard
          title="Pedidos del período"
          description="Movimiento de pedidos durante el período seleccionado."
          items={[
            {
              label: "Creados",
              value: orders.created,
            },
            {
              label: "Entregados",
              value: orders.delivered,
            },
            {
              label: "Cancelados",
              value: orders.cancelled,
              danger: orders.cancelled > 0,
            },
          ]}
        />

        <PeriodCard
          title="Rendimiento comercial"
          description="Indicadores de ventas del período."
          items={[
            {
              label: "Ventas",
              value: formatCurrency(sales.revenue),
            },
            {
              label: "Cobrado",
              value: formatCurrency(sales.paid),
            },
            {
              label: "Ticket promedio",
              value: formatCurrency(sales.averageOrderValue),
            },
          ]}
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-950">Lectura rápida</h3>

          <p className="mt-1 text-xs text-slate-500">
            Señales importantes para tomar decisiones.
          </p>

          <div className="mt-5 space-y-3">
            <Insight
              visible={hasOverdueOrders}
              tone="danger"
              title={`${formatNumber(current.orders.overdue)} pedido${
                current.orders.overdue === 1 ? "" : "s"
              } atrasado${current.orders.overdue === 1 ? "" : "s"}`}
              description="Revisa las entregas comprometidas."
            />

            <Insight
              visible={hasReceivables}
              tone="warning"
              title={`${formatCurrency(current.receivables.amount)} por cobrar`}
              description="Existen pagos pendientes de clientes."
            />

            <Insight
              visible={current.machines.maintenance > 0}
              tone="warning"
              title={`${formatNumber(current.machines.maintenance)} máquina${
                current.machines.maintenance === 1 ? "" : "s"
              } en mantención`}
              description="Puede afectar la capacidad productiva."
            />

            <Insight
              visible={hasPendingProduction}
              tone="info"
              title={`${formatNumber(
                current.production.pendingUnits,
              )} unidades pendientes`}
              description="Existe carga de producción por atender."
            />

            {!hasOverdueOrders &&
              !hasReceivables &&
              current.machines.maintenance === 0 &&
              !hasPendingProduction && (
                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-800">
                    Operación saludable
                  </p>

                  <p className="mt-1 text-xs text-emerald-700">
                    No se detectan señales operativas relevantes en este
                    momento.
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </section>
  );
}

function OperationalMetric({
  label,
  value,
  description,
  danger = false,
  active = false,
}: {
  label: string;
  value: number;
  description: string;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        danger
          ? "border-red-200 bg-red-50"
          : active
            ? "border-blue-100 bg-blue-50"
            : "border-slate-100 bg-slate-50"
      }`}
    >
      <p
        className={`text-xs font-medium ${
          danger ? "text-red-600" : active ? "text-blue-600" : "text-slate-500"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${
          danger ? "text-red-700" : active ? "text-blue-700" : "text-slate-950"
        }`}
      >
        {formatNumber(value)}
      </p>

      <p className="mt-1 text-[11px] text-slate-400">{description}</p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  warning = false,
  active = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
  active?: boolean;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>

      <p
        className={`mt-1 text-lg font-bold ${
          warning
            ? "text-amber-600"
            : active
              ? "text-blue-600"
              : "text-slate-950"
        }`}
      >
        {formatNumber(value)}
      </p>
    </div>
  );
}

function ResourceStat({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[11px] text-slate-500">{label}</p>

      <p
        className={`mt-1 font-bold ${
          warning ? "text-amber-600" : "text-slate-900"
        }`}
      >
        {formatNumber(value)}
      </p>
    </div>
  );
}

function PeriodCard({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: {
    label: string;
    value: string | number;
    danger?: boolean;
  }[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-slate-950">{title}</h3>

      <p className="mt-1 text-xs text-slate-500">{description}</p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">{item.label}</p>

            <p
              className={`mt-1 text-lg font-bold ${
                item.danger ? "text-red-600" : "text-slate-950"
              }`}
            >
              {typeof item.value === "number"
                ? formatNumber(item.value)
                : item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Insight({
  visible,
  tone,
  title,
  description,
}: {
  visible: boolean;
  tone: "danger" | "warning" | "info";
  title: string;
  description: string;
}) {
  if (!visible) {
    return null;
  }

  const styles = {
    danger: {
      container: "border-red-100 bg-red-50",
      title: "text-red-800",
      description: "text-red-700",
      icon: "!",
    },
    warning: {
      container: "border-amber-100 bg-amber-50",
      title: "text-amber-800",
      description: "text-amber-700",
      icon: "!",
    },
    info: {
      container: "border-blue-100 bg-blue-50",
      title: "text-blue-800",
      description: "text-blue-700",
      icon: "i",
    },
  };

  const style = styles[tone];

  return (
    <div className={`rounded-xl border p-3 ${style.container}`}>
      <div className="flex gap-3">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold ${style.title}`}
        >
          {style.icon}
        </span>

        <div className="min-w-0">
          <p className={`text-sm font-semibold ${style.title}`}>{title}</p>

          <p className={`mt-0.5 text-xs ${style.description}`}>{description}</p>
        </div>
      </div>
    </div>
  );
}
