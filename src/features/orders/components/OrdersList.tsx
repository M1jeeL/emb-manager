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
    <div className="space-y-4">
      {/* 
        ===================================================================
        1. VISTA MÓVIL (< md): Formato en Tarjetas (Cards)
        ===================================================================
      */}

      {isFetching && (
        <div className="flex items-center justify-center gap-2 border-t bg-indigo-50/50 px-5 py-2 text-xs font-medium text-indigo-700">
          <span className="h-1.5 w-1.5 animate-ping rounded-full bg-indigo-600" />
          Actualizando resultados...
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {data.data.map((order) => {
          const balance = getBalance(order);

          return (
            <div
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="group relative flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition active:scale-[0.99] active:bg-slate-50 hover:border-slate-300"
            >
              {/* Header de la tarjeta: Pedido, Fecha y Flecha */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      #{order.orderNumber}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {order._count.items}{" "}
                      {order._count.items === 1 ? "prenda" : "prendas"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Pedido: {formatDate(order.orderedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-medium text-indigo-600 group-hover:text-indigo-800">
                  <span>Ver</span>
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>

              {/* Cliente */}
              <div className="py-2.5">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Cliente
                </p>
                <p className="font-semibold text-slate-900 text-sm">
                  {order.customer.name}
                </p>
                {order.customer.companyName && (
                  <p className="text-xs text-slate-500">
                    {order.customer.companyName}
                  </p>
                )}
              </div>

              {/* Badges de Estado y Pago */}
              <div className="flex flex-wrap items-center gap-2 py-2">
                <OrderStatusBadge status={order.status} />
                <OrderPaymentBadge status={order.paymentStatus} />
              </div>

              {/* Footer de la tarjeta: Fecha de entrega y Montos */}
              <div className="mt-1 flex items-end justify-between border-t border-slate-100 pt-3">
                <div>
                  <p className="text-[11px] text-slate-400">
                    Entrega prometida
                  </p>
                  <p className="text-xs font-medium text-slate-700">
                    {formatDate(order.promisedAt)}
                  </p>
                </div>

                <div className="text-right">
                  {balance > 0 && (
                    <p className="text-[11px] font-medium text-amber-600">
                      Saldo: {formatCurrency(String(balance))}
                    </p>
                  )}
                  <p className="text-base font-bold text-slate-900">
                    {formatCurrency(order.total)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 
        ===================================================================
        2. VISTA ESCRITORIO (>= md): Tabla Clásica
        ===================================================================
      */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="w-[110px]">Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.data.map((order) => {
                const balance = getBalance(order);

                return (
                  <TableRow
                    key={order.id}
                    className="transition-colors hover:bg-slate-50/80 cursor-pointer"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-bold text-slate-900">
                          #{order.orderNumber}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {order._count.items}{" "}
                          {order._count.items === 1 ? "prenda" : "prendas"}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="min-w-[140px]">
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

                    <TableCell className="whitespace-nowrap">
                      <span className="text-sm text-slate-600">
                        {formatDate(order.orderedAt)}
                      </span>
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
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
                          <p className="text-xs font-medium text-amber-600">
                            Saldo: {formatCurrency(String(balance))}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right whitespace-nowrap">
                      <span className="font-bold text-slate-900">
                        {formatCurrency(order.total)}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Evitar doble evento si clickea el botón
                          navigate(`/orders/${order.id}`);
                        }}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
                      >
                        Ver detalle
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Paginador universal y feedback de estado */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          total={data.meta.total}
          limit={data.meta.limit}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      </div>
    </div>
  );
}
