import type { OrderDetail } from "../../../types";

interface OrderDetailInfoProps {
  order: OrderDetail;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>

      <dd className="mt-1 text-sm font-medium text-slate-800">
        {value?.trim() || "No informado"}
      </dd>
    </div>
  );
}

export function OrderDetailInfo({ order }: OrderDetailInfoProps) {
  const customer = order.customer;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="font-semibold text-slate-900">
          Información del cliente
        </h2>
      </div>

      <dl className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        <Field label="Cliente" value={customer.name} />
        <Field label="Empresa" value={customer.companyName} />
        <Field label="Teléfono" value={customer.phone} />
        <Field label="Correo" value={customer.email} />
        <Field label="RUT" value={customer.taxId} />
        <Field label="Ciudad" value={customer.city} />
        <Field label="Dirección" value={customer.address} />
        <Field
          label="Estado del cliente"
          value={customer.status === "ACTIVE" ? "Activo" : "Inactivo"}
        />
      </dl>

      {order.notes && (
        <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Notas del pedido
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {order.notes}
          </p>
        </div>
      )}
    </section>
  );
}
