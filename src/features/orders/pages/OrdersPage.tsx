import { Link } from "react-router-dom";
import { useGetOrders } from "../api/useOrders";
import { Plus, Loader2 } from "lucide-react";

export function OrdersPage() {
  const ORGANIZATION_ID = "92feb484-c0b9-4825-9222-e2f70000bb9a"; // Reemplazar con ID dinámico o contexto
  const { data: orders, isLoading, isError } = useGetOrders(ORGANIZATION_ID);
  console.log(orders);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        Error al conectar con la API de NestJS. Revisa que el backend esté
        ejecutándose.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gestión de Pedidos
          </h1>
          <p className="text-sm text-slate-500">
            Panel en tiempo real alimentado por NestJS
          </p>
        </div>
        <Link to="/pedidos/nuevo">
          <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Nuevo Pedido
          </button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
            <tr>
              <th className="px-6 py-3"># Pedido</th>
              <th className="px-6 py-3">Cliente</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders?.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-semibold">
                  #{order.orderNumber}
                </td>
                <td className="px-6 py-4">{order.customer?.name}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold">
                  ${order.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
