import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { DashboardOperationsResponse } from "../../../types";

import {
  formatCurrency,
  formatDate,
  formatHours,
  formatNumber,
  getOrderStatusLabel,
  getPaymentStatusLabel,
} from "../dashboard.utils";

interface OperationsSectionProps {
  data: DashboardOperationsResponse;
}

const FULFILLMENT_COLORS = ["#22c55e", "#ef4444"];

export function OperationsSection({ data }: OperationsSectionProps) {
  const fulfillmentData = [
    {
      name: "A tiempo",
      value: data.fulfillment.deliveredOnTime,
    },
    {
      name: "Atrasados",
      value: data.fulfillment.deliveredLate,
    },
  ];

  const hasFulfillmentData = data.fulfillment.delivered > 0;

  return (
    <section className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-950">Operaciones</h2>

        <p className="text-sm text-slate-500">
          Estado de los pedidos y capacidad de cumplimiento.
        </p>
      </div>

      {/* KPIs principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Pedidos activos"
          value={data.summary.activeOrders}
          description="Actualmente en proceso"
        />

        <MetricCard
          label="Pendientes"
          value={data.summary.pending}
          description="Esperando producción"
        />

        <MetricCard
          label="En producción"
          value={data.summary.inProgress}
          description="Actualmente trabajando"
        />

        <MetricCard
          label="Listos"
          value={data.summary.ready}
          description="Esperando entrega"
        />
      </div>

      {/* Riesgo operativo */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Atrasados"
          value={data.summary.overdue}
          danger={data.summary.overdue > 0}
          description={
            data.summary.overdue > 0
              ? "Requieren atención"
              : "Sin pedidos atrasados"
          }
        />

        <MetricCard
          label="Vencen hoy"
          value={data.summary.dueToday}
          warning={data.summary.dueToday > 0}
          description={
            data.summary.dueToday > 0
              ? "Entregas para hoy"
              : "Sin entregas para hoy"
          }
        />

        <MetricCard
          label="Próximos 7 días"
          value={data.summary.dueNext7Days}
          description="Entregas programadas"
        />
      </div>

      {/* Cumplimiento + próximos pedidos */}
      <div className="grid gap-4 xl:grid-cols-[1fr_2fr]">
        {/* Cumplimiento */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h3 className="font-semibold text-slate-950">
              Cumplimiento de entregas
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Rendimiento durante el período seleccionado.
            </p>
          </div>

          <div className="mt-4">
            {hasFulfillmentData ? (
              <div className="relative h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fulfillmentData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={82}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {fulfillmentData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={FULFILLMENT_COLORS[index]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value, name) => {
                        const numericValue = Array.isArray(value)
                          ? Number(value[0] ?? 0)
                          : Number(value ?? 0);
                        return [formatNumber(numericValue), name];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-bold text-slate-950">
                    {data.fulfillment.onTimeRatePercent === null
                      ? "—"
                      : `${Number(data.fulfillment.onTimeRatePercent).toFixed(
                          1,
                        )}%`}
                  </p>

                  <p className="text-xs text-slate-500">a tiempo</p>
                </div>
              </div>
            ) : (
              <div className="flex h-52 items-center justify-center text-sm text-slate-500">
                No hay entregas registradas en el período.
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
            <MetricMini label="Entregados" value={data.fulfillment.delivered} />

            <MetricMini
              label="A tiempo"
              value={data.fulfillment.deliveredOnTime}
            />

            <MetricMini
              label="Atrasados"
              value={data.fulfillment.deliveredLate}
            />
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Tiempo promedio de entrega</p>

            <p className="mt-1 text-lg font-bold text-slate-900">
              {formatHours(data.fulfillment.averageTurnaroundHours)}
            </p>
          </div>
        </div>

        {/* Próximas entregas */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h3 className="font-semibold text-slate-950">
                Próximas entregas
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Pedidos que requieren seguimiento.
              </p>
            </div>

            {data.upcoming.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {data.upcoming.length}
              </span>
            )}
          </div>

          {data.upcoming.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center p-8 text-center">
              <div>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg">
                  ✓
                </div>

                <p className="mt-3 text-sm font-medium text-slate-700">
                  No hay entregas próximas
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  No tienes pedidos pendientes de entrega.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.upcoming.map((order) => (
                <UpcomingOrder key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function UpcomingOrder({
  order,
}: {
  order: DashboardOperationsResponse["upcoming"][number];
}) {
  const isPaid = order.paymentStatus === "PAID";

  return (
    <div className="flex flex-col gap-3 p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-900">
            #{order.orderNumber}
          </span>

          <StatusBadge status={order.status} />
        </div>

        <p className="mt-1 truncate text-sm text-slate-600">
          {order.customer.companyName || order.customer.name}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Entrega: {formatDate(order.promisedAt)}
        </p>
      </div>

      <div className="shrink-0 sm:text-right">
        <p className="font-semibold text-slate-900">
          {formatCurrency(order.total)}
        </p>

        <p
          className={`mt-1 text-xs font-medium ${
            isPaid ? "text-emerald-600" : "text-amber-600"
          }`}
        >
          {getPaymentStatusLabel(order.paymentStatus)}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700",
    IN_PROGRESS: "bg-blue-50 text-blue-700",
    READY: "bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        styles[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {getOrderStatusLabel(status)}
    </span>
  );
}

function MetricCard({
  label,
  value,
  description,
  danger = false,
  warning = false,
}: {
  label: string;
  value: number;
  description?: string;
  danger?: boolean;
  warning?: boolean;
}) {
  const valueClass = danger
    ? "text-red-600"
    : warning
      ? "text-amber-600"
      : "text-slate-950";

  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-sm ${
        danger
          ? "border-red-200"
          : warning
            ? "border-amber-200"
            : "border-slate-200"
      }`}
    >
      <p className="text-sm text-slate-500">{label}</p>

      <p className={`mt-2 text-2xl font-bold ${valueClass}`}>
        {formatNumber(value)}
      </p>

      {description && (
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      )}
    </div>
  );
}

function MetricMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-0">
      <p className="text-xs text-slate-500">{label}</p>

      <p className="mt-1 font-bold text-slate-900">{formatNumber(value)}</p>
    </div>
  );
}
