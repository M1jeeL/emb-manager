import type { DashboardAlert, DashboardAlertsResponse } from "../../../types";

import { formatCurrency } from "../dashboard.utils";

interface AlertsSectionProps {
  data: DashboardAlertsResponse;
}

export function AlertsSection({ data }: AlertsSectionProps) {
  const sortedAlerts = [...data.alerts].sort(
    (a, b) => severityWeight(b.severity) - severityWeight(a.severity),
  );

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-950">Alertas</h2>

        <p className="text-sm text-slate-500">
          Situaciones que requieren atención o seguimiento.
        </p>
      </div>

      {sortedAlerts.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
              ✓
            </div>

            <div>
              <p className="font-semibold text-emerald-900">
                Todo está bajo control
              </p>

              <p className="mt-1 text-sm text-emerald-700">
                No existen alertas que requieran atención en este momento.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {sortedAlerts.map((alert) => (
            <AlertCard key={alert.type} alert={alert} />
          ))}
        </div>
      )}
    </section>
  );
}

function AlertCard({ alert }: { alert: DashboardAlert }) {
  const styles = getAlertStyles(alert.severity);

  return (
    <div className={`rounded-2xl border p-4 ${styles.container}`}>
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${styles.icon}`}
        >
          {alert.severity === "CRITICAL"
            ? "!"
            : alert.severity === "WARNING"
              ? "⚠"
              : "i"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className={`font-semibold ${styles.title}`}>{alert.title}</h3>

            <span className={`text-sm font-bold ${styles.count}`}>
              {alert.count}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-600">{alert.description}</p>

          {alert.amount && (
            <p className="mt-2 text-sm font-semibold text-slate-900">
              Monto asociado: {formatCurrency(alert.amount)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function severityWeight(severity: DashboardAlert["severity"]) {
  if (severity === "CRITICAL") return 3;
  if (severity === "WARNING") return 2;
  return 1;
}

function getAlertStyles(severity: DashboardAlert["severity"]) {
  if (severity === "CRITICAL") {
    return {
      container: "border-red-200 bg-red-50",
      icon: "bg-red-100 text-red-700",
      title: "text-red-900",
      count: "text-red-700",
    };
  }

  if (severity === "WARNING") {
    return {
      container: "border-amber-200 bg-amber-50",
      icon: "bg-amber-100 text-amber-700",
      title: "text-amber-900",
      count: "text-amber-700",
    };
  }

  return {
    container: "border-blue-200 bg-blue-50",
    icon: "bg-blue-100 text-blue-700",
    title: "text-blue-900",
    count: "text-blue-700",
  };
}
