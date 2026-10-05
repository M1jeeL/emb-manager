import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useCreatePayment, usePayments } from "../../../hooks/usePayments";

import type {
  Payment,
  PaymentFilters as PaymentFiltersType,
} from "../../../types";

import { PaymentFilters } from "../components/PaymentFilters";
import { PaymentForm } from "../components/PaymentForm";
import { PaymentMethodBadge } from "../components/PaymentMethodBadge";
import { PaymentStatusBadge } from "../components/PaymentStatusBadge";

import type { PaymentFormData } from "../schemas/payment.schema";

import {
  Button,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from "../../../components/ui";

import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";

function parsePositiveInteger(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getCustomerName(payment: Payment) {
  return payment.order.customer.companyName || payment.order.customer.name;
}

export function PaymentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const toast = useToast();

  const initialFilters: PaymentFiltersType = {
    page: parsePositiveInteger(searchParams.get("page"), 1),

    limit: parsePositiveInteger(searchParams.get("limit"), 20),

    orderNumber: searchParams.get("orderNumber")
      ? Number(searchParams.get("orderNumber"))
      : undefined,

    method:
      (searchParams.get("method") as PaymentFiltersType["method"]) || undefined,

    from: searchParams.get("from") || undefined,

    to: searchParams.get("to") || undefined,
  };

  const [filters, setFilters] = useState<PaymentFiltersType>(initialFilters);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading, isFetching, isError, error } = usePayments(filters);

  const createPayment = useCreatePayment();

  const updateUrl = useCallback(
    (nextFilters: PaymentFiltersType) => {
      const params = new URLSearchParams();

      if (nextFilters.orderNumber) {
        params.set("orderNumber", String(nextFilters.orderNumber));
      }

      if (nextFilters.method) {
        params.set("method", nextFilters.method);
      }

      if (nextFilters.from) {
        params.set("from", nextFilters.from);
      }

      if (nextFilters.to) {
        params.set("to", nextFilters.to);
      }

      if (nextFilters.page && nextFilters.page > 1) {
        params.set("page", String(nextFilters.page));
      }

      if (nextFilters.limit && nextFilters.limit !== 20) {
        params.set("limit", String(nextFilters.limit));
      }

      setSearchParams(params);
    },
    [setSearchParams],
  );

  function handleFiltersChange(nextFilters: PaymentFiltersType) {
    setFilters(nextFilters);
    updateUrl(nextFilters);
  }

  function handlePageChange(page: number) {
    handleFiltersChange({
      ...filters,
      page,
    });
  }

  function handleLimitChange(limit: number) {
    handleFiltersChange({
      ...filters,
      page: 1,
      limit,
    });
  }

  function openCreateForm() {
    setFormError(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    if (createPayment.isPending) {
      return;
    }

    setIsFormOpen(false);
    setFormError(null);
  }

  async function handleSubmit(formData: PaymentFormData) {
    setFormError(null);

    try {
      await createPayment.mutateAsync({
        orderId: formData.orderId,
        amount: formData.amount,
        method: formData.method,
        paidAt: formData.paidAt,
        ...(formData.reference?.trim()
          ? {
              reference: formData.reference.trim(),
            }
          : {}),
        ...(formData.notes?.trim()
          ? {
              notes: formData.notes.trim(),
            }
          : {}),
      });

      toast.success("Pago registrado", "El pago se registró correctamente.");

      closeForm();
    } catch (error) {
      const message = getApiErrorMessage(error);

      setFormError(message);

      toast.error("No se pudo registrar el pago", message);
    }
  }

  const payments = data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pagos</h1>

          <p className="mt-1 text-sm text-slate-500">
            Registra y consulta los pagos realizados por tus clientes.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreateForm}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700"
        >
          + Registrar pago
        </Button>
      </div>

      {/* Filtros */}
      <PaymentFilters filters={filters} onChange={handleFiltersChange} />

      {/* Resultados */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {isLoading ? (
          <div className="p-10 text-center text-slate-500">
            Cargando pagos...
          </div>
        ) : isError ? (
          <div className="p-6">
            <p className="rounded-lg bg-red-50 p-4 text-red-700">
              {error instanceof Error
                ? error.message
                : "No fue posible cargar los pagos."}
            </p>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold text-slate-900">No encontramos pagos</p>

            <p className="mt-1 text-sm text-slate-500">
              Prueba cambiando los filtros o registra un nuevo pago.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="border-b border-slate-200 bg-slate-50">
                  <TableRow>
                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Pedido
                    </TableHead>

                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Cliente
                    </TableHead>

                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Monto
                    </TableHead>

                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Método
                    </TableHead>

                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Fecha
                    </TableHead>

                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Estado
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y">
                  {payments.map((payment) => (
                    <TableRow
                      key={payment.id}
                      className="transition hover:bg-slate-50"
                    >
                      <TableCell>
                        <p className="font-medium text-slate-900">
                          #{payment.order.orderNumber}
                        </p>

                        {payment.reference && (
                          <p className="mt-0.5 text-xs text-slate-500">
                            Ref: {payment.reference}
                          </p>
                        )}
                      </TableCell>

                      <TableCell>
                        <p className="font-medium text-slate-900">
                          {getCustomerName(payment)}
                        </p>

                        {payment.order.customer.companyName && (
                          <p className="mt-0.5 text-xs text-slate-500">
                            {payment.order.customer.name}
                          </p>
                        )}
                      </TableCell>

                      <TableCell>
                        <p className="font-semibold text-slate-900">
                          {formatCurrency(payment.amount)}
                        </p>
                      </TableCell>

                      <TableCell>
                        <PaymentMethodBadge method={payment.method} />
                      </TableCell>

                      <TableCell className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(payment.paidAt)}
                      </TableCell>

                      <TableCell>
                        <PaymentStatusBadge
                          status={payment.order.paymentStatus}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {data?.meta && (
              <Pagination
                page={data.meta.page}
                limit={data.meta.limit}
                total={data.meta.total}
                totalPages={data.meta.totalPages}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            )}
          </>
        )}

        {isFetching && !isLoading && (
          <div className="border-t bg-slate-50 px-5 py-2 text-xs text-slate-500">
            Actualizando resultados...
          </div>
        )}
      </div>

      {/* Formulario */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Registrar pago
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Registra un pago asociado a un pedido con saldo pendiente.
              </p>
            </div>

            <PaymentForm
              isSubmitting={createPayment.isPending}
              serverError={formError}
              onSubmit={handleSubmit}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}
