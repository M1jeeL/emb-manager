import type { OrderDetail } from "../../../types";

export function OrderCommercialHistory({ order }: { order: OrderDetail }) {
  const revisions = order.commercialRevisions ?? [];
  if (revisions.length === 0) return null;

  const money = (value: string) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(Number(value));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-900">Historial de cotización</h2>
      <p className="mt-1 text-sm text-slate-500">Versiones guardadas de los términos comerciales.</p>
      <ol className="mt-4 space-y-3">
        {[...revisions].reverse().map((revision) => (
          <li key={revision.id} className="border-l-2 border-indigo-200 pl-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-800">Versión {revision.revision}</span>
              <time className="text-xs text-slate-400">{new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(revision.createdAt))}</time>
            </div>
            <p className="mt-1 text-xs text-slate-600">Subtotal {money(revision.subtotal)} · Descuento {money(revision.discount)} · Total {money(revision.total)}</p>
            <p className="mt-1 text-xs text-slate-500">{revision.reason ?? "Cambio de términos"}{revision.changedBy ? ` · ${revision.changedBy.firstName} ${revision.changedBy.lastName}` : ""}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
