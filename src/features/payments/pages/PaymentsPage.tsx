import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useCreatePayment, usePayments } from "../../../hooks/usePayments";

import type { Payment, PaymentFilters, PaymentMethod } from "../../../types";

import { PaymentForm } from "../components/PaymentForm";
import { PaymentMethodBadge } from "../components/PaymentMethodBadge";
import { PaymentStatusBadge } from "../components/PaymentStatusBadge";

import { Pagination, useToast } from "../../../components/ui";

import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";

function parsePositiveInteger(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function formatCurrency(value: string) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function PaymentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const toast = useToast();

  const page = parsePositiveInteger(searchParams.get("page"), 1);

  const limit = parsePositiveInteger(searchParams.get("limit"), 20);

  const orderNumberParam = searchParams.get("orderNumber");

  const orderNumber =
    orderNumberParam && Number.isInteger(Number(orderNumberParam))
      ? Number(orderNumberParam)
      : undefined;

  const method =
    (searchParams.get("method") as PaymentMethod | null) ?? undefined;

  const from = searchParams.get("from") || undefined;

  const to = searchParams.get("to") || undefined;

  const filters: PaymentFilters = {
    page,
    limit,
    orderNumber,
    method,
    from,
    to,
  };

  const paymentsQuery = usePayments(filters);
  const createPayment = useCreatePayment();

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  const payments = useMemo(
    () => paymentsQuery.data?.data ?? [],
    [paymentsQuery.data?.data],
  );

  const meta = paymentsQuery.data?.meta;

  const updateFilters = useCallback(
    (next: PaymentFilters) => {
      const params = new URLSearchParams();

      if (next.orderNumber) {
        params.set("orderNumber", String(next.orderNumber));
      }

      if (next.method) {
        params.set("method", next.method);
      }

      if (next.from) {
        params.set("from", next.from);
      }

      if (next.to) {
        params.set("to", next.to);
      }

      if (next.page && next.page > 1) {
        params.set("page", String(next.page));
      }

      if (next.limit && next.limit !== 20) {
        params.set("limit", String(next.limit));
      }

      setSearchParams(params);
    },
    [setSearchParams],
  );

  function handleOrderNumberChange(value: string) {
    const nextOrderNumber =
      value.trim() && Number.isInteger(Number(value)) && Number(value) > 0
        ? Number(value)
        : undefined;

    updateFilters({
      ...filters,
      page: 1,
      orderNumber: nextOrderNumber,
    });
  }

  async function handleCreatePayment(
    payload: Parameters<typeof createPayment.mutateAsync>[0],
  ) {
    setFormError(null);

    try {
      await createPayment.mutateAsync(payload);

      setIsFormOpen(false);

      toast.success("El pago se registró correctamente.");
    } catch (error) {
      const message = getApiErrorMessage(error);

      setFormError(message);

      toast.error(message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Pagos</h1>

          <p className="mt-1 text-sm text-slate-500">
            Registra y consulta los pagos realizados por tus clientes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setIsFormOpen(true);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          Registrar pago
        </button>
      </div>

      {/* Filtros */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Orden */}
          <div>
            <label
              htmlFor="payment-order-number"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              N° de orden
            </label>

            <input
              id="payment-order-number"
              type="number"
              min="1"
              value={orderNumberParam ?? ""}
              onChange={(event) => handleOrderNumberChange(event.target.value)}
              placeholder="Ej. 1001"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Método */}
          <div>
            <label
              htmlFor="payment-method"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Método
            </label>

            <select
              id="payment-method"
              value={method ?? ""}
              onChange={(event) =>
                updateFilters({
                  ...filters,
                  page: 1,
                  method: (event.target.value || undefined) as
                    | PaymentMethod
                    | undefined,
                })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Todos</option>

              <option value="CASH">Efectivo</option>

              <option value="BANK_TRANSFER">Transferencia bancaria</option>

              <option value="DEBIT_CARD">Tarjeta de débito</option>

              <option value="CREDIT_CARD">Tarjeta de crédito</option>

              <option value="OTHER">Otro</option>
            </select>
          </div>

          {/* Desde */}
          <div>
            <label
              htmlFor="payment-from"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Desde
            </label>

            <input
              id="payment-from"
              type="date"
              value={from ?? ""}
              onChange={(event) =>
                updateFilters({
                  ...filters,
                  page: 1,
                  from: event.target.value || undefined,
                })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Hasta */}
          <div>
            <label
              htmlFor="payment-to"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Hasta
            </label>

            <input
              id="payment-to"
              type="date"
              value={to ?? ""}
              onChange={(event) =>
                updateFilters({
                  ...filters,
                  page: 1,
                  to: event.target.value || undefined,
                })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {paymentsQuery.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getApiErrorMessage(paymentsQuery.error)}
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {paymentsQuery.isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Cargando pagos...
          </div>
        ) : payments.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              No hay pagos registrados
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Los pagos que registres aparecerán aquí.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Orden
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Cliente
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Monto
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Método
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Estado
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Fecha
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment: Payment) => (
                    <tr
                      key={payment.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="text-sm font-semibold text-slate-900">
                          #{payment.order.orderNumber}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {payment.order.customer.name}
                          </p>

                          {payment.order.customer.companyName && (
                            <p className="mt-0.5 text-xs text-slate-500">
                              {payment.order.customer.companyName}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="text-sm font-semibold text-slate-900">
                          {formatCurrency(payment.amount)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <PaymentMethodBadge method={payment.method} />
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <PaymentStatusBadge
                          status={payment.order.paymentStatus}
                        />
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {formatDate(payment.paidAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta && meta.totalPages > 0 && (
              <div className="border-t border-slate-200 px-4 py-3">
                <Pagination
                  page={meta.page}
                  total={meta.total}
                  limit={meta.limit}
                  totalPages={meta.totalPages}
                  onPageChange={(nextPage) =>
                    updateFilters({
                      ...filters,
                      page: nextPage,
                    })
                  }
                />
              </div>
            )}
          </>
        )}

        {paymentsQuery.isFetching && !paymentsQuery.isLoading && (
          <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">
            Actualizando...
          </div>
        )}
      </div>

      {/* Formulario */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Registrar pago
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Selecciona una orden con saldo pendiente y registra el pago
                recibido.
              </p>
            </div>

            <PaymentForm
              isSubmitting={createPayment.isPending}
              serverError={formError}
              onSubmit={handleCreatePayment}
              onCancel={() => {
                if (!createPayment.isPending) {
                  setIsFormOpen(false);
                  setFormError(null);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
