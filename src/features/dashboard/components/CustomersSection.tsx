import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

import type { DashboardCustomersResponse } from "../../../types";
import { formatCurrency, formatNumber } from "../dashboard.utils";

interface CustomersSectionProps {
  data: DashboardCustomersResponse;
}

// Colores consistentes con Tailwind (Slate / Indigo / Emerald / Amber)
const STATUS_COLORS = {
  new: "#6366f1", // Indigo 500
  active: "#10b981", // Emerald 500
  inactive: "#cbd5e1", // Slate 300
};

export function CustomersSection({ data }: CustomersSectionProps) {
  // Datos formateados para el Donut Chart de resumen
  const statusPieData = useMemo(() => {
    return [
      {
        name: "Nuevos",
        value: data.summary.newCustomers,
        color: STATUS_COLORS.new,
      },
      {
        name: "Activos",
        value: data.summary.activeCustomers,
        color: STATUS_COLORS.active,
      },
      {
        name: "Inactivos",
        value: data.summary.inactiveCustomers,
        color: STATUS_COLORS.inactive,
      },
    ].filter((item) => item.value > 0);
  }, [data.summary]);

  // Datos de Top 5 Clientes para el gráfico de barras horizontales
  const topCustomersChartData = useMemo(() => {
    return data.topCustomers.slice(0, 5).map((c) => ({
      name: c.companyName || c.name,
      revenue: Number(c.revenue),
      pendingAmount: Number(c.pendingAmount),
      orders: c.orders,
    }));
  }, [data.topCustomers]);

  return (
    <section className="space-y-6">
      {/* Cabecera */}
      <div>
        <h2 className="text-lg font-bold text-slate-950">Clientes</h2>
        <p className="text-sm text-slate-500">
          Estado de la cartera y comportamiento de clientes de mayor valor.
        </p>
      </div>

      {/* Tarjetas de Métricas + Gráfico Donut de Estado */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Grid de 4 KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          <MetricCard
            label="Total clientes"
            value={data.summary.total}
            badge="Cartera global"
          />
          <MetricCard
            label="Nuevos"
            value={data.summary.newCustomers}
            color="indigo"
          />
          <MetricCard
            label="Activos"
            value={data.summary.activeCustomers}
            color="emerald"
          />
          <MetricCard
            label="Inactivos"
            value={data.summary.inactiveCustomers}
            color="slate"
          />
        </div>

        {/* Donut Chart: Distribución de Clientes */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              Distribución de cartera
            </h3>
            <p className="text-xs text-slate-500">
              Proporción por estado actual
            </p>
          </div>

          <div className="relative h-48 w-full">
            {statusPieData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                Sin datos de clientes
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}

            {/* Texto al centro del Donut */}
            {statusPieData.length > 0 && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-slate-900">
                  {formatNumber(data.summary.total)}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">
                  Clientes
                </span>
              </div>
            )}
          </div>

          {/* Leyenda personalizada */}
          <div className="flex justify-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              Nuevos
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Activos
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              Inactivos
            </span>
          </div>
        </div>
      </div>

      {/* Gráfico de Barras: Comparativo Top Clientes */}
      {topCustomersChartData.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-semibold text-slate-950">
              Top 5 Clientes por Ingresos y Saldo Pendiente
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Comparativa entre lo facturado y el saldo por cobrar.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topCustomersChartData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  type="number"
                  tickFormatter={(val) => `$${formatNumber(val)}`}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#334155" }}
                  width={130}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }}
                  formatter={(value) => (
                    <span className="text-slate-600 font-medium">
                      {value === "revenue"
                        ? "Ingresos Realizados"
                        : "Saldo Pendiente"}
                    </span>
                  )}
                />
                <Bar
                  dataKey="revenue"
                  fill="#4f46e5"
                  radius={[0, 4, 4, 0]}
                  barSize={12}
                />
                <Bar
                  dataKey="pendingAmount"
                  fill="#f59e0b"
                  radius={[0, 4, 4, 0]}
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabla Completa de Clientes Principales */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h3 className="font-semibold text-slate-950">
            Detalle de clientes principales
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Ordenados por volumen total de ventas en el período.
          </p>
        </div>

        {data.topCustomers.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No hay ventas asociadas a clientes en este período.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="border-b border-slate-100 bg-slate-50/70">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Cliente
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Pedidos
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ingresos
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Pendiente
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.topCustomers.map((customer) => (
                  <tr
                    key={customer.customerId}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {customer.name}
                      </p>
                      {customer.companyName && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {customer.companyName}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right text-sm text-slate-700">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        {formatNumber(customer.orders)} ped.
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                      {formatCurrency(customer.revenue)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-medium">
                      {Number(customer.pendingAmount) > 0 ? (
                        <span className="text-amber-600">
                          {formatCurrency(customer.pendingAmount)}
                        </span>
                      ) : (
                        <span className="text-slate-400">$0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

{
  /* Sub-componentes auxiliares de UI */
}

interface MetricCardProps {
  label: string;
  value: number;
  badge?: string;
  color?: "indigo" | "emerald" | "slate";
}

function MetricCard({ label, value, badge, color }: MetricCardProps) {
  const colorStyles = {
    indigo: "border-l-4 border-l-indigo-500",
    emerald: "border-l-4 border-l-emerald-500",
    slate: "border-l-4 border-l-slate-300",
  };

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 ${
        color ? colorStyles[color] : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {badge && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            {badge}
          </span>
        )}
      </div>

      <p className="mt-3 text-3xl font-bold text-slate-950">
        {formatNumber(value)}
      </p>
    </div>
  );
}

type PieTooltipPayloadItem = {
  name?: string;
  value?: number | string;
};

type BarTooltipPayloadItem = {
  fill?: string;
  dataKey?: string;
  value?: number | string;
};

interface CustomPieTooltipProps {
  active?: boolean;
  payload?: PieTooltipPayloadItem[];
}

interface CustomBarTooltipProps {
  active?: boolean;
  payload?: BarTooltipPayloadItem[];
  label?: string | number;
}

// Custom Tooltip para PieChart
function CustomPieTooltip({ active, payload }: CustomPieTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-md text-xs">
        <p className="font-semibold text-slate-900">{data.name}</p>
        <p className="text-slate-600 mt-1">
          Clientes:{" "}
          <span className="font-bold">{formatNumber(Number(data.value ?? 0))}</span>
        </p>
      </div>
    );
  }
  return null;
}

// Custom Tooltip para BarChart
function CustomBarTooltip({ active, payload, label }: CustomBarTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-md text-xs space-y-1">
        <p className="font-bold text-slate-900 mb-1.5">{label}</p>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              {item.dataKey === "revenue" ? "Ingresos:" : "Pendiente:"}
            </span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(Number(item.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}
