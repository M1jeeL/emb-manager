import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../api/client';
import { Search } from 'lucide-react';

interface Result { id: string; label: string; detail: string; path: string }
interface PageResult<T> { data: T[] }

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen(true); }
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open || term.trim().length < 2) { setResults([]); setError(false); return; }
    const timer = window.setTimeout(async () => {
      setLoading(true); setError(false);
      const query = encodeURIComponent(term.trim());
      const requests: Array<Promise<Result[]>> = [
        apiRequest<PageResult<{ id: string; name: string; companyName: string | null; phone: string | null }>>(`/customers?name=${query}&limit=6`).then((result) => result.data.map((item) => ({ id: item.id, label: item.name, detail: item.companyName || item.phone || 'Cliente', path: `/customers?name=${query}` }))),
        apiRequest<PageResult<{ id: string; name: string; customer: { name: string } | null }>>(`/logos?name=${query}&limit=6`).then((result) => result.data.map((item) => ({ id: item.id, label: item.name, detail: item.customer?.name ?? 'Diseño de bordado', path: `/logos/${item.id}` }))),
      ];
      if (/^\d+$/.test(term.trim())) {
        requests.push(apiRequest<PageResult<{ id: string; orderNumber: number; customer: { name: string } }>>(`/orders?orderNumber=${query}&limit=6`).then((result) => result.data.map((item) => ({ id: item.id, label: `Pedido #${item.orderNumber}`, detail: item.customer.name, path: `/orders/${item.id}` }))));
      }
      const settled = await Promise.allSettled(requests);
      const failed = settled.some((item) => item.status === 'rejected');
      const next = settled.flatMap((item) => item.status === 'fulfilled' ? item.value : []);
      setResults(next); setError(failed && next.length === 0); setLoading(false);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [term, open]);

  if (!open) return <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-500 hover:bg-slate-50 sm:px-3" aria-label="Abrir búsqueda global"><Search size={16} aria-hidden="true" /><span className="hidden sm:inline">Buscar…</span><kbd className="hidden rounded border bg-slate-50 px-1.5 py-0.5 text-[10px] xl:inline">Ctrl K</kbd></button>;

  return <div className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-950/40 p-4 pt-[15vh]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
    <section className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label="Buscar en el taller">
      <label className="flex items-center gap-3 border-b px-4"><span aria-hidden="true">⌕</span><input autoFocus value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Pedidos, clientes o diseños…" className="h-14 min-w-0 flex-1 outline-none" /><button type="button" onClick={() => setOpen(false)} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">Esc</button></label>
      <div className="max-h-[55vh] overflow-y-auto p-2">
        {term.trim().length < 2 ? <p className="p-4 text-sm text-slate-500">Escribe al menos 2 caracteres. Para encontrar un pedido, escribe su número.</p> : loading ? <p className="p-4 text-sm text-slate-500">Buscando…</p> : error ? <p role="alert" className="p-4 text-sm text-red-700">No se pudo completar la búsqueda.</p> : results.length === 0 ? <p className="p-4 text-sm text-slate-500">No se encontraron resultados.</p> : results.map((result) => <Link key={`${result.path}-${result.id}`} to={result.path} onClick={() => setOpen(false)} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-indigo-50"><span className="truncate text-sm font-medium text-slate-900">{result.label}</span><span className="truncate text-xs text-slate-500">{result.detail}</span></Link>)}
      </div>
    </section>
  </div>;
}
