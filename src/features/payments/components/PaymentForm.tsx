import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAvailablePaymentOrders } from "../../../hooks/usePayments";

import type { PaymentAvailableOrder } from "../../../types";

import { paymentSchema, type PaymentFormData } from "../schemas/payment.schema";

interface PaymentFormProps {
  isSubmitting?: boolean;
  serverError?: string | null;
  onSubmit: (data: PaymentFormData) => void | Promise<void>;
  onCancel: () => void;
}

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function getCustomerName(order: PaymentAvailableOrder) {
  return order.customer.companyName || order.customer.name;
}

export function PaymentForm({
  isSubmitting = false,
  serverError,
  onSubmit,
  onCancel,
}: PaymentFormProps) {
  const {
    data: orders,
    isLoading: isLoadingOrders,
    isError: isOrdersError,
  } = useAvailablePaymentOrders();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      orderId: "",
      amount: "",
      method: "CASH",
      paidAt: new Date().toISOString().slice(0, 10),
      reference: "",
      notes: "",
    },
  });

  const selectedOrderId = watch("orderId");
  const amount = watch("amount");

  const selectedOrder = useMemo(
    () => orders?.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  const pendingAmount = selectedOrder
    ? Number(selectedOrder.total) - Number(selectedOrder.paidAmount)
    : 0;

  console.log(pendingAmount);

  useEffect(() => {
    if (!selectedOrder) {
      return;
    }

    setValue("amount", pendingAmount.toFixed(0), {
      shouldValidate: true,
    });
  }, [selectedOrder, pendingAmount, setValue]);

  function useFullBalance() {
    if (!selectedOrder) {
      return;
    }

    setValue("amount", pendingAmount.toFixed(0), {
      shouldValidate: true,
    });
  }

  const numericAmount = Number(amount || 0);

  const amountExceedsBalance =
    selectedOrder !== null && numericAmount > pendingAmount;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Orden */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Pedido
        </label>

        <select
          {...register("orderId")}
          disabled={isSubmitting || isLoadingOrders}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
        >
          <option value="">
            {isLoadingOrders ? "Cargando pedidos..." : "Selecciona un pedido"}
          </option>

          {orders?.map((order) => (
            <option key={order.id} value={order.id}>
              #{order.orderNumber} · {getCustomerName(order)} · Pendiente{" "}
              {formatCurrency(Number(order.total) - Number(order.paidAmount))}
            </option>
          ))}
        </select>

        {errors.orderId && (
          <p className="mt-1 text-sm text-red-600">{errors.orderId.message}</p>
        )}

        {isOrdersError && (
          <p className="mt-1 text-sm text-red-600">
            No se pudieron cargar los pedidos disponibles.
          </p>
        )}

        {!isLoadingOrders && !isOrdersError && orders?.length === 0 && (
          <p className="mt-2 text-sm text-slate-500">
            No existen pedidos con saldo pendiente de pago.
          </p>
        )}
      </div>

      {/* Resumen del pedido */}
      {selectedOrder && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Pedido #{selectedOrder.orderNumber}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {getCustomerName(selectedOrder)}
              </p>
            </div>

            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
              {selectedOrder.paymentStatus === "PARTIAL"
                ? "Pago parcial"
                : "Sin pagar"}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-slate-500">Total</p>

              <p className="mt-1 font-semibold text-slate-900">
                {formatCurrency(selectedOrder.total)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Pagado</p>

              <p className="mt-1 font-semibold text-slate-900">
                {formatCurrency(selectedOrder.paidAmount)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Pendiente</p>

              <p className="mt-1 font-semibold text-indigo-700">
                {formatCurrency(pendingAmount)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Monto */}
      <div>
        <div className="mb-1 flex items-center justify-between gap-3">
          <label className="block text-sm font-medium text-slate-700">
            Monto
          </label>

          {selectedOrder && (
            <button
              type="button"
              onClick={useFullBalance}
              disabled={isSubmitting}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
            >
              Usar saldo completo
            </button>
          )}
        </div>

        <input
          {...register("amount")}
          type="number"
          disabled={!selectedOrder || isSubmitting}
          placeholder="0"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
        />

        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
        )}
        {selectedOrder && amount && (
          <p className="mt-1.5 text-xs text-slate-500">
            Registrando {formatCurrency(amount)} de un saldo de{" "}
            {formatCurrency(pendingAmount)}.
          </p>
        )}

        {amountExceedsBalance && (
          <p className="mt-1 text-sm text-red-600">
            El monto no puede superar el saldo pendiente de{" "}
            {formatCurrency(pendingAmount)}.
          </p>
        )}
      </div>

      {/* Método */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Método de pago
        </label>

        <select
          {...register("method")}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
        >
          <option value="CASH">Efectivo</option>
          <option value="BANK_TRANSFER">Transferencia bancaria</option>
          <option value="DEBIT_CARD">Tarjeta de débito</option>
          <option value="CREDIT_CARD">Tarjeta de crédito</option>
          <option value="OTHER">Otro</option>
        </select>

        {errors.method && (
          <p className="mt-1 text-sm text-red-600">{errors.method.message}</p>
        )}
      </div>

      {/* Fecha */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Fecha del pago
        </label>

        <input
          {...register("paidAt")}
          type="date"
          disabled={isSubmitting}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
        />

        {errors.paidAt && (
          <p className="mt-1 text-sm text-red-600">{errors.paidAt.message}</p>
        )}
      </div>

      {/* Referencia */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Referencia
          <span className="ml-1 font-normal text-slate-400">(opcional)</span>
        </label>

        <input
          {...register("reference")}
          disabled={isSubmitting}
          placeholder="Ej: N° de transferencia"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
        />

        {errors.reference && (
          <p className="mt-1 text-sm text-red-600">
            {errors.reference.message}
          </p>
        )}
      </div>

      {/* Notas */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Notas
          <span className="ml-1 font-normal text-slate-400">(opcional)</span>
        </label>

        <textarea
          {...register("notes")}
          rows={3}
          disabled={isSubmitting}
          placeholder="Información adicional del pago..."
          className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
        />

        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSubmitting || !selectedOrder || amountExceedsBalance}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Registrando..." : "Registrar pago"}
        </button>
      </div>
    </form>
  );
}
