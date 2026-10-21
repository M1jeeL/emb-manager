import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../../api/dashboard.api';
import { Button } from '../../../components/ui';

function dateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function downloadCsv(rows: Array<Array<string | number>>, filename: string) {
  const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(';')).join('\r\n');
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

const numberFormat = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 });
const moneyFormat = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
const percentFormat = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 });
const formatNumber = (value: string | number | null | undefined) => numberFormat.format(Number(value ?? 0));
const formatMoney = (value: string | number | null | undefined) => moneyFormat.format(Number(value ?? 0));
const formatPercent = (value: string | number | null | undefined) => value == null ? 'Sin datos' : `${percentFormat.format(Number(value))}%`;

export function ReportsPage() {
  const period = useMemo(() => {
    const today = new Date();
    return { from: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`, to: dateInput(new Date(today.getFullYear(), today.getMonth() + 1, 1)) };
  }, []);
  const sales = useQuery({ queryKey: ['report-sales', period], queryFn: () => dashboardApi.getSales(period) });
  const operations = useQuery({ queryKey: ['report-operations', period], queryFn: () => dashboardApi.getOperations(period) });
  const production = useQuery({ queryKey: ['report-production', period], queryFn: () => dashboardApi.getProduction(period) });
  const customers = useQuery({ queryKey: ['report-customers', period], queryFn: () => dashboardApi.getCustomers(period) });
  const queries = [sales, operations, production, customers];

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-2xl font-bold text-slate-950">Reportes del taller</h1><p className="mt-1 text-sm text-slate-500">Resumen del mes y archivos descargables para revisar la operación.</p></div>
      <Button disabled={!sales.data || !operations.data || !production.data || !customers.data} onClick={() => {
        if (!sales.data || !operations.data || !production.data || !customers.data) return;
        downloadCsv([
          ['Reporte', 'Indicador', 'Valor'],
          ['Ventas', 'Ingresos', sales.data.summary.revenue], ['Ventas', 'Pagos recibidos', sales.data.summary.paid], ['Ventas', 'Pedidos', sales.data.summary.orders],
          ['Operación', 'Pedidos atrasados', operations.data.summary.overdue], ['Operación', 'Entregas próximas', operations.data.summary.dueNext7Days], ['Operación', 'Cumplimiento a tiempo (%)', operations.data.fulfillment.onTimeRatePercent ?? 'Sin datos'],
          ['Producción', 'Trabajos pendientes', production.data.summary.pendingJobs], ['Producción', 'Unidades completadas', production.data.summary.completedUnits], ['Clientes', 'Clientes activos', customers.data.summary.activeCustomers],
          ...sales.data.daily.map((day) => ['Ventas diarias', day.date, day.revenue] as Array<string | number>),
          ...customers.data.topCustomers.map((customer) => ['Mejores clientes', customer.name, customer.revenue] as Array<string | number>),
        ], `reporte-taller-${period.from}.csv`);
      }}>Descargar CSV</Button>
    </div>

    {queries.some((query) => query.isLoading) && <div className="rounded-xl border bg-white p-6 text-sm text-slate-500">Cargando reportes…</div>}
    {queries.some((query) => query.isError) && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">No se pudieron cargar todos los reportes. Actualiza la página o revisa tu conexión.</div>}
    {sales.data && operations.data && production.data && customers.data && <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportCard label="Ingresos del período" value={formatMoney(sales.data.summary.revenue)} />
        <ReportCard label="Pagos recibidos" value={formatMoney(sales.data.summary.paid)} />
        <ReportCard label="Pedidos atrasados" value={formatNumber(operations.data.summary.overdue)} />
        <ReportCard label="Unidades completadas" value={formatNumber(production.data.summary.completedUnits)} />
        <ReportCard label="Cumplimiento a tiempo" value={formatPercent(operations.data.fulfillment.onTimeRatePercent)} />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <ReportList title="Ventas por día" rows={sales.data.daily.slice(-10).map((day) => [day.date, formatMoney(day.revenue)])} empty="Sin ventas registradas en el período." />
        <ReportList title="Clientes con más ventas" rows={customers.data.topCustomers.slice(0, 10).map((customer) => [customer.name, formatMoney(customer.revenue)])} empty="Aún no hay clientes en este período." />
        <ReportList title="Próximas entregas" rows={operations.data.upcoming.slice(0, 10).map((order) => [`Pedido #${formatNumber(order.orderNumber)} · ${order.customer.name}`, new Date(order.promisedAt).toLocaleDateString('es-CL')])} empty="No hay entregas próximas." />
        <ReportList title="Carga por máquina" rows={production.data.machines.map((machine) => [machine.machineName, `${formatNumber(machine.activeJobs)} trabajos · ${formatNumber(machine.activeUnits)} unidades`])} empty="Sin trabajos asignados a máquinas." />
      </section>
    </>}
  </div>;
}

function ReportCard({ label, value }: { label: string; value: string }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-950">{value}</p></article>;
}

function ReportList({ title, rows, empty }: { title: string; rows: string[][]; empty: string }) {
  return <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-900">{title}</h2>{rows.length ? <ul className="mt-3 divide-y divide-slate-100">{rows.map(([label, value]) => <li key={`${label}-${value}`} className="flex justify-between gap-4 py-2 text-sm"><span className="truncate text-slate-600">{label}</span><span className="shrink-0 font-medium text-slate-900">{value}</span></li>)}</ul> : <p className="mt-3 text-sm text-slate-500">{empty}</p>}</section>;
}
