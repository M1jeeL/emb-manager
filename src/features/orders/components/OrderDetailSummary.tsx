import type { OrderDetail } from "../../../types";

interface OrderDetailSummaryProps {
  order: OrderDetail;
}

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function OrderDetailSummary({ order }: OrderDetailSummaryProps) {
  const total = Number(order.total);
  const paidAmount = Number(order.paidAmount);
  const balance = Math.max(0, total - paidAmount);
  const discount = Number(order.discount);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="font-semibold text-slate-900">Resumen</h2>
      </div>

      <div className="space-y-3 p-5 sm:p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Subtotal</span>

          <span className="font-medium text-slate-800">
            {formatCurrency(order.subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Descuento</span>

          <span className="font-medium text-slate-800">
            {discount > 0 ? `− ${formatCurrency(discount)}` : formatCurrency(0)}
          </span>
        </div>

        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-end justify-between gap-4">
            <span className="font-semibold text-slate-900">Total</span>

            <span className="text-2xl font-bold text-slate-950">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Pagado</span>

            <span className="font-semibold text-emerald-700">
              {formatCurrency(paidAmount)}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              Saldo pendiente
            </span>

            <span
              className={`text-lg font-bold ${
                balance > 0 ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {formatCurrency(balance)}
            </span>
          </div>
        </div>

        <div className="pt-1 text-xs text-slate-400">
          {order.paymentStatus === "PAID"
            ? "La orden está completamente pagada."
            : order.paymentStatus === "PARTIAL"
              ? "La orden tiene pagos registrados parcialmente."
              : "No se han registrado pagos."}
        </div>
      </div>
    </section>
  );
}
