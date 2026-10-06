import { useMemo } from "react";

interface DashboardPeriodFilterProps {
  from: string;
  to: string;
  onChange: (values: { from: string; to: string }) => void;
}

const MONTHS = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

/**
 * Retorna las fechas de inicio (YYYY-MM-01) y fin (YYYY-MM-DD) para un mes y año específicos.
 */
function getMonthRange(monthIndex: number, year: number) {
  const startDate = new Date(year, monthIndex, 1);
  // El día 0 del siguiente mes da el último día del mes actual
  const endDate = new Date(year, monthIndex + 1, 0);

  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return {
    from: formatDate(startDate),
    to: formatDate(endDate),
  };
}

export function DashboardPeriodFilter({
  from,
  to,
  onChange,
}: DashboardPeriodFilterProps) {
  const currentYear = new Date().getFullYear();

  // Determinar si el rango activo coincide con algún mes del año actual
  const selectedMonth = useMemo(() => {
    for (let i = 0; i < 12; i++) {
      const range = getMonthRange(i, currentYear);
      if (range.from === from && range.to === to) {
        return MONTHS[i].value;
      }
    }
    return "CUSTOM";
  }, [from, to, currentYear]);

  // Manejador del cambio en el selector de meses
  function handleMonthChange(monthValue: string) {
    if (monthValue === "CUSTOM") return;

    const monthIndex = parseInt(monthValue, 10) - 1;
    const { from: newFrom, to: newTo } = getMonthRange(monthIndex, currentYear);

    onChange({ from: newFrom, to: newTo });
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
      {/* Selector de Mes */}
      <div>
        <label
          htmlFor="dashboard-month"
          className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500"
        >
          Mes ({currentYear})
        </label>

        <select
          id="dashboard-month"
          value={selectedMonth}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-auto"
        >
          <option value="CUSTOM" disabled hidden={selectedMonth !== "CUSTOM"}>
            Personalizado
          </option>

          {MONTHS.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </div>

      {/* Rango Desde */}
      <div>
        <label
          htmlFor="dashboard-from"
          className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500"
        >
          Desde
        </label>

        <input
          id="dashboard-from"
          type="date"
          value={from}
          onChange={(event) =>
            onChange({
              from: event.target.value,
              to,
            })
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-auto"
        />
      </div>

      {/* Rango Hasta */}
      <div>
        <label
          htmlFor="dashboard-to"
          className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500"
        >
          Hasta
        </label>

        <input
          id="dashboard-to"
          type="date"
          value={to}
          onChange={(event) =>
            onChange({
              from,
              to: event.target.value,
            })
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-auto"
        />
      </div>
    </div>
  );
}
