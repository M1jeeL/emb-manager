import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../api/client';
import type { DashboardAlert } from '../../types';
import { Bell } from 'lucide-react';

const alertPath: Record<DashboardAlert['type'], string> = {
  OVERDUE_ORDER: '/orders', UPCOMING_DELIVERY: '/orders', PRODUCTION_BACKLOG: '/production',
  MACHINE_MAINTENANCE: '/machines', RECEIVABLE: '/payments',
};

export function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const alerts = useQuery({ queryKey: ['dashboard-alerts'], queryFn: () => apiRequest<{ alerts: DashboardAlert[] }>('/dashboard/alerts'), enabled: open, staleTime: 60_000 });
  const count = alerts.data?.alerts.reduce((total, alert) => total + alert.count, 0) ?? 0;
  return <div className="relative">
    <button type="button" onClick={() => setOpen((value) => !value)} className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label={`Notificaciones${count ? `, ${count} elementos` : ''}`} aria-expanded={open}>
      <Bell size={18} aria-hidden="true" />{count > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">{count > 99 ? '99+' : count}</span>}
    </button>
    {open && <div className="absolute right-0 z-40 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
      <div className="flex items-center justify-between px-1"><h2 className="font-semibold text-slate-900">Alertas del taller</h2><button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-500">Cerrar</button></div>
      {alerts.isLoading ? <p className="p-3 text-sm text-slate-500">Cargando alertas…</p> : alerts.isError ? <p className="p-3 text-sm text-red-700">No se pudieron cargar las alertas.</p> : !alerts.data?.alerts.length ? <p className="p-3 text-sm text-slate-500">No hay alertas pendientes.</p> : <ul className="mt-2 divide-y">{alerts.data.alerts.map((alert) => <li key={alert.type}><Link to={alertPath[alert.type]} onClick={() => setOpen(false)} className="block rounded-lg px-2 py-3 hover:bg-slate-50"><span className="flex justify-between gap-3 text-sm font-medium text-slate-800"><span>{alert.title}</span><span className="text-indigo-600">{alert.count}</span></span><span className="mt-1 block text-xs text-slate-500">{alert.description}</span></Link></li>)}</ul>}
    </div>}
  </div>;
}
