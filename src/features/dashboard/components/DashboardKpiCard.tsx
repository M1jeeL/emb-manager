interface DashboardKpiCardProps {
  label: string;
  value: string | number;
  description?: string;
  variation?: number | null;
  icon: string;
}

export function DashboardKpiCard({
  label,
  value,
  description,
  variation,
  icon,
}: DashboardKpiCardProps) {
  const variationClass =
    variation === null || variation === undefined
      ? "text-slate-500"
      : variation > 0
        ? "text-emerald-600"
        : variation < 0
          ? "text-red-600"
          : "text-slate-500";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          )}

          {variation !== undefined && (
            <p className={`mt-3 text-xs font-semibold ${variationClass}`}>
              {variation === null
                ? "Sin período anterior"
                : `${variation > 0 ? "+" : ""}${variation.toFixed(1)}% vs período anterior`}
            </p>
          )}
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-700">
          {icon}
        </div>
      </div>
    </div>
  );
}
