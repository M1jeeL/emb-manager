import type { OrderDetail } from "../../../types";

import { OrderDetailItemCard } from "./OrderDetailItemCard";

interface OrderDetailItemsProps {
  order: OrderDetail;
}

export function OrderDetailItems({ order }: OrderDetailItemsProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-900">Prendas</h2>

            <p className="mt-1 text-sm text-slate-500">
              {order.items.length}{" "}
              {order.items.length === 1 ? "tipo de prenda" : "tipos de prenda"}
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {order.items.reduce((total, item) => total + item.quantity, 0)}{" "}
            unidades
          </span>
        </div>
      </div>

      <div className="space-y-3 p-5 sm:p-6">
        {order.items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
            Esta orden no tiene prendas.
          </div>
        ) : (
          order.items.map((item) => (
            <OrderDetailItemCard key={item.id} item={item} />
          ))
        )}
      </div>
    </section>
  );
}
