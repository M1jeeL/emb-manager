import type { DashboardSalesResponse } from "../../../types";

import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DashboardKpiCard } from "./DashboardKpiCard";

import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatShortDate,
  getPaymentMethodLabel,
} from "../dashboard.utils";

interface SalesSectionProps {
  data: DashboardSalesResponse;
}

const PAYMENT_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

function formatChartCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatChartDate(value: string) {
  return formatShortDate(value);
}

function SalesTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    dataKey?: string;
    value?: number | string;
    name?: string;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="mb-2 text-xs font-semibold text-slate-500">
        {label ? formatChartDate(label) : ""}
      </p>

      <div className="space-y-1.5">
        {payload.map((entry) => {
          const value = Number(entry.value ?? 0);

          return (
            <div
              key={entry.dataKey}
              className="flex items-center justify-between gap-6"
            >
              <span className="text-sm text-slate-600">
                {entry.dataKey === "revenue" ? "Ingresos" : "Cobrado"}
              </span>

              <span className="text-sm font-semibold text-slate-950">
                {formatChartCurrency(value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PaymentTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload?: {
      method: string;
      amount: string;
      percentage: number;
    };
  }>;
}) {
  if (!active || !payload?.length || !payload[0]?.payload) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-slate-950">
        {getPaymentMethodLabel(item.method)}
      </p>

      <p className="mt-1 text-sm text-slate-600">
        {formatCurrency(item.amount)}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {formatPercent(item.percentage)} del total
      </p>
    </div>
  );
}

export function SalesSection({ data }: SalesSectionProps) {
  const chartData = data.daily.map((day) => ({
    ...day,
    revenueValue: Number(day.revenue),
    paidValue: Number(day.paid),
  }));

  const paymentData = data.paymentMethods.map((method) => ({
    ...method,
    percentageValue: Number(method.percentage),
  }));

  const hasDailyData = chartData.some(
    (day) => day.revenueValue > 0 || day.paidValue > 0,
  );

  const hasPaymentData = paymentData.length > 0;

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-950">Ventas</h2>

        <p className="text-sm text-slate-500">
          Evolución de ventas, cobros y medios de pago.
        </p>
      </div>

      {/* ============================================================
          KPIs
      ============================================================ */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardKpiCard
          label="Ingresos"
          value={formatCurrency(data.summary.revenue)}
          variation={data.summary.revenueVariationPercent}
          icon="$"
        />

        <DashboardKpiCard
          label="Cobrado"
          value={formatCurrency(data.summary.paid)}
          variation={data.summary.paidVariationPercent}
          icon="✓"
        />

        <DashboardKpiCard
          label="Pedidos"
          value={formatNumber(data.summary.orders)}
          variation={data.summary.ordersVariationPercent}
          icon="#"
        />

        <DashboardKpiCard
          label="Ticket promedio"
          value={formatCurrency(data.summary.averageOrderValue)}
          icon="◉"
        />
      </div>

      {/* ============================================================
          EVOLUCIÓN + MÉTODOS DE PAGO
      ============================================================ */}

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        {/* Evolución diaria */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-semibold text-slate-950">Evolución diaria</h3>

              <p className="text-xs text-slate-500">
                Comparación entre ingresos generados y dinero cobrado.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                <span className="text-slate-500">Ingresos</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-500">Cobrado</span>
              </div>
            </div>
          </div>

          <div className="mt-6 h-72 w-full">
            {!hasDailyData ? (
              <div className="flex h-full items-center justify-center rounded-xl bg-slate-50">
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700">
                    Sin actividad de ventas
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    No existen ingresos o pagos registrados en este período.
                  </p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="date"
                    tickFormatter={formatChartDate}
                    tick={{
                      fontSize: 11,
                      fill: "#94a3b8",
                    }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={20}
                  />

                  <YAxis
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("es-CL", {
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(value)
                    }
                    tick={{
                      fontSize: 11,
                      fill: "#94a3b8",
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={55}
                  />

                  <Tooltip
                    content={<SalesTooltip />}
                    cursor={{
                      stroke: "#cbd5e1",
                      strokeDasharray: "4 4",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="revenueValue"
                    name="Ingresos"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{
                      r: 5,
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="paidValue"
                    name="Cobrado"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{
                      r: 5,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {hasDailyData && (
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <div>
                <p className="text-xs text-slate-400">Ingresos del período</p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatCurrency(data.summary.revenue)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Cobrado del período</p>

                <p className="mt-1 text-sm font-semibold text-emerald-600">
                  {formatCurrency(data.summary.paid)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Métodos de pago */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h3 className="font-semibold text-slate-950">Medios de pago</h3>

            <p className="text-xs text-slate-500">
              Distribución de los cobros registrados.
            </p>
          </div>

          <div className="mt-4 h-56">
            {!hasPaymentData ? (
              <div className="flex h-full items-center justify-center rounded-xl bg-slate-50">
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700">
                    Sin pagos registrados
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    No existen cobros en este período.
                  </p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    dataKey="percentageValue"
                    nameKey="method"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={82}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {paymentData.map((method, index) => (
                      <Cell
                        key={method.method}
                        fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip content={<PaymentTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {hasPaymentData && (
            <div className="mt-2 space-y-3">
              {paymentData.map((method, index) => (
                <div
                  key={method.method}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          PAYMENT_COLORS[index % PAYMENT_COLORS.length],
                      }}
                    />

                    <span className="truncate text-sm text-slate-600">
                      {getPaymentMethodLabel(method.method)}
                    </span>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(method.amount)}
                    </p>

                    <p className="text-xs text-slate-400">
                      {formatPercent(method.percentage)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
