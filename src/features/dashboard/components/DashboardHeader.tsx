import { DashboardPeriodFilter } from "./DashboardPeriodFilter";

interface DashboardHeaderProps {
  from: string;
  to: string;
  onPeriodChange: (values: { from: string; to: string }) => void;
}

export function DashboardHeader({
  from,
  to,
  onPeriodChange,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
          Dashboard
        </h1>

        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Una visión general del negocio, ventas, operaciones, producción y
          clientes.
        </p>
      </div>

      <DashboardPeriodFilter from={from} to={to} onChange={onPeriodChange} />
    </div>
  );
}
