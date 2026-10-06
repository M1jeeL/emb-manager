import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { DashboardProductionResponse } from "../../../types";

import { formatHours, formatNumber } from "../dashboard.utils";

interface ProductionSectionProps {
  data: DashboardProductionResponse;
}

const STATUS_COLORS = ["#f59e0b", "#3b82f6", "#f97316", "#22c55e"];

export function ProductionSection({ data }: ProductionSectionProps) {
  const totalActive =
    data.summary.pendingUnits +
    data.summary.inProgressUnits +
    data.summary.pausedUnits;

  const totalUnits =
    data.summary.pendingUnits +
    data.summary.inProgressUnits +
    data.summary.pausedUnits +
    data.summary.completedUnits;

  const distributionData = [
    {
      name: "Pendiente",
      value: data.summary.pendingUnits,
    },
    {
      name: "En producción",
      value: data.summary.inProgressUnits,
    },
    {
      name: "Pausado",
      value: data.summary.pausedUnits,
    },
    {
      name: "Completado",
      value: data.summary.completedUnits,
    },
  ];

  const hasDistributionData = totalUnits > 0;

  return (
    <section className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-950">Producción</h2>

        <p className="text-sm text-slate-500">
          Carga de trabajo, rendimiento y distribución.
        </p>
      </div>

      {/* Estado de producción */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ProductionMetric
          label="Pendiente"
          jobs={data.summary.pendingJobs}
          units={data.summary.pendingUnits}
          tone="warning"
        />

        <ProductionMetric
          label="En producción"
          jobs={data.summary.inProgressJobs}
          units={data.summary.inProgressUnits}
          tone="primary"
        />

        <ProductionMetric
          label="Pausado"
          jobs={data.summary.pausedJobs}
          units={data.summary.pausedUnits}
          tone="danger"
        />

        <ProductionMetric
          label="Completado"
          jobs={data.summary.completedJobs}
          units={data.summary.completedUnits}
          tone="success"
        />
      </div>

      {/* Distribución + rendimiento */}
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        {/* Distribución */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h3 className="font-semibold text-slate-950">
              Distribución de producción
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Distribución de unidades según su estado actual.
            </p>
          </div>

          {hasDistributionData ? (
            <div className="mt-4 grid items-center gap-4 sm:grid-cols-[1fr_180px]">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={82}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[index]} />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value, name) => {
                        return [
                          formatNumber(
                            Number(
                              Array.isArray(value) ? value[0] : (value ?? 0),
                            ),
                          ),
                          name,
                        ];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {distributionData.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: STATUS_COLORS[index],
                        }}
                      />

                      <span className="truncate text-sm text-slate-600">
                        {item.name}
                      </span>
                    </div>

                    <span className="shrink-0 text-sm font-semibold text-slate-900">
                      {formatNumber(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-56 items-center justify-center text-sm text-slate-500">
              No hay datos de producción para mostrar.
            </div>
          )}
        </div>

        {/* Rendimiento */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h3 className="font-semibold text-slate-950">Rendimiento</h3>

            <p className="mt-1 text-xs text-slate-500">
              Resultado de producción durante el período seleccionado.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <PerformanceCard
              label="Trabajos completados"
              value={data.performance.completedJobs}
            />

            <PerformanceCard
              label="Unidades completadas"
              value={data.performance.completedUnits}
            />
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Tiempo promedio de finalización
            </p>

            <p className="mt-1 text-xl font-bold text-slate-950">
              {formatHours(data.performance.averageCompletionHours)}
            </p>
          </div>
        </div>
      </div>

      {/* Carga por recursos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ResourceList
          title="Carga por máquina"
          description="Unidades activas asignadas a cada máquina."
          empty="No hay carga asignada a máquinas."
          items={data.machines.map((machine) => ({
            id: machine.machineId,
            name: machine.machineName,
            detail: machine.machineCode || "Sin código",
            jobs: machine.activeJobs,
            units: machine.activeUnits,
          }))}
        />

        <ResourceList
          title="Carga por empleado"
          description="Unidades activas asignadas a cada empleado."
          empty="No hay producción asignada a empleados."
          items={data.employees.map((employee) => ({
            id: employee.employeeId,
            name: employee.employeeName,
            detail: "",
            jobs: employee.activeJobs,
            units: employee.activeUnits,
          }))}
        />
      </div>

      {/* Estado sin producción */}
      {totalActive === 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
            ✓
          </div>

          <div>
            <p className="text-sm font-semibold text-emerald-900">
              No hay producción pendiente
            </p>

            <p className="mt-1 text-xs text-emerald-700">
              Actualmente no existen unidades pendientes, en producción o
              pausadas.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function ProductionMetric({
  label,
  jobs,
  units,
  tone,
}: {
  label: string;
  jobs: number;
  units: number;
  tone: "warning" | "primary" | "danger" | "success";
}) {
  const toneStyles = {
    warning: {
      border: "border-amber-200",
      value: "text-amber-600",
      dot: "bg-amber-500",
    },
    primary: {
      border: "border-blue-200",
      value: "text-blue-600",
      dot: "bg-blue-500",
    },
    danger: {
      border: "border-orange-200",
      value: "text-orange-600",
      dot: "bg-orange-500",
    },
    success: {
      border: "border-emerald-200",
      value: "text-emerald-600",
      dot: "bg-emerald-500",
    },
  };

  const styles = toneStyles[tone];

  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm ${styles.border}`}
    >
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${styles.dot}`} />

        <p className="text-sm text-slate-500">{label}</p>
      </div>

      <p className={`mt-3 text-2xl font-bold ${styles.value}`}>
        {formatNumber(units)}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {formatNumber(jobs)} trabajos
      </p>
    </div>
  );
}

function PerformanceCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs leading-5 text-slate-500">{label}</p>

      <p className="mt-2 text-xl font-bold text-slate-950">
        {formatNumber(value)}
      </p>
    </div>
  );
}

function ResourceList({
  title,
  description,
  empty,
  items,
}: {
  title: string;
  description: string;
  empty: string;
  items: {
    id: string;
    name: string;
    detail: string;
    jobs: number;
    units: number;
  }[];
}) {
  const visibleItems = items.slice(0, 6);

  const maxUnits = Math.max(...visibleItems.map((item) => item.units), 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="font-semibold text-slate-950">{title}</h3>

        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>

      <div className="mt-5 space-y-4">
        {visibleItems.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-5 text-center">
            <p className="text-sm text-slate-500">{empty}</p>
          </div>
        ) : (
          visibleItems.map((item) => {
            const percentage =
              item.units === 0 ? 0 : Math.max((item.units / maxUnits) * 100, 4);

            return (
              <div key={item.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {item.name}
                    </p>

                    {item.detail && (
                      <p className="text-xs text-slate-400">{item.detail}</p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {formatNumber(item.units)}
                    </p>

                    <p className="text-[10px] text-slate-400">unidades</p>
                  </div>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                <p className="mt-1 text-xs text-slate-400">
                  {formatNumber(item.jobs)} trabajos activos
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
