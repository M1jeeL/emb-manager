import { useNavigate } from "react-router-dom";

import { Pagination } from "../../../components/ui/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui";

import { OrderPaymentBadge } from "./OrderPaymentBadge";
import { OrderStatusBadge } from "./OrderStatusBadge";

import type { OrderListItem, OrderListResponse } from "../../../types";

interface OrdersListProps {
  data: OrderListResponse;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

function formatCurrency(value: string) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getBalance(order: OrderListItem) {
  return Math.max(0, Number(order.total) - Number(order.paidAmount));
}

export function OrdersList({
  data,
  isFetching = false,
  onPageChange,
  onLimitChange,
}: OrdersListProps) {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.data.map((order) => {
              const balance = getBalance(order);

              return (
                <TableRow key={order.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-slate-900">
                        #{order.orderNumber}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {order._count.items}{" "}
                        {order._count.items === 1 ? "prenda" : "prendas"}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {order.customer.name}
                      </p>

                      {order.customer.companyName && (
                        <p className="truncate text-xs text-slate-500">
                          {order.customer.companyName}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm text-slate-600">
                      {formatDate(order.orderedAt)}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm text-slate-600">
                      {formatDate(order.promisedAt)}
                    </span>
                  </TableCell>

                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <OrderPaymentBadge status={order.paymentStatus} />

                      {balance > 0 && (
                        <p className="text-xs text-slate-500">
                          Saldo: {formatCurrency(String(balance))}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(order.total)}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="text-sm font-medium text-indigo-600 transition hover:text-indigo-800"
                      >
                        Ver detalle
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={data.meta.page}
        totalPages={data.meta.totalPages}
        total={data.meta.total}
        limit={data.meta.limit}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />

      {isFetching && (
        <div className="border-t bg-slate-50 px-5 py-2 text-xs text-slate-500">
          Actualizando resultados...
        </div>
      )}
    </div>
  );
}
