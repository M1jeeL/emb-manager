import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { OrderDetail } from "../../../types";
import {
  paymentSchema,
  type PaymentFormData,
} from "../../payments/schemas/payment.schema";

interface OrderPaymentDialogProps {
  order: OrderDetail;
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentFormData) => void | Promise<void>;
  serverError?: string | null;
}

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function getCustomerName(customer: OrderDetail["customer"]) {
  return customer.companyName || customer.name;
}

export function OrderPaymentDialog({
  order,
  open,
  loading = false,
  onClose,
  onSubmit,
  serverError,
}: OrderPaymentDialogProps) {
  const pendingAmount = Number(order.total) - Number(order.paidAmount);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      orderId: order.id,
      amount: pendingAmount > 0 ? pendingAmount.toFixed(0) : "0",
      method: "CASH",
      paidAt: new Date().toISOString().slice(0, 10),
      reference: "",
      notes: "",
    },
  });

  const amount = watch("amount");
  const numericAmount = Number(amount || 0);
  const amountExceedsBalance = numericAmount > pendingAmount;

  // Sincronizar el formulario cada vez que abre el modal o cambia la orden
  useEffect(() => {
    if (open && order) {
      const currentPending = Number(order.total) - Number(order.paidAmount);
      reset({
        orderId: order.id,
        amount: currentPending > 0 ? currentPending.toFixed(0) : "0",
        method: "CASH",
        paidAt: new Date().toISOString().slice(0, 10),
        reference: "",
        notes: "",
      });
    }
  }, [open, order, reset]);

  function useFullBalance() {
    setValue("amount", pendingAmount.toFixed(0), {
      shouldValidate: true,
    });
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-status-dialog-title"
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        {/* Cabecera */}
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="order-status-dialog-title"
                className="text-lg font-semibold text-slate-900"
              >
                Registrar pago
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Pedido #{order.orderNumber} · {getCustomerName(order.customer)}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 p-5 sm:p-6"
        >
          {/* Resumen financiero de la orden */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold tracking-wider text-indigo-900">
                Estado del Pago
              </p>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600 shadow-sm">
                {order.paymentStatus === "PARTIAL"
                  ? "Pago parcial"
                  : order.paymentStatus === "PAID"
                    ? "Pagado"
                    : "Sin pagar"}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-slate-500">Total</p>
                <p className="mt-0.5 font-semibold text-slate-900">
                  {formatCurrency(order.total)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Pagado</p>
                <p className="mt-0.5 font-semibold text-slate-900">
                  {formatCurrency(order.paidAmount)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Pendiente</p>
                <p className="mt-0.5 font-semibold text-indigo-700">
                  {formatCurrency(pendingAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Campo oculto con orderId para validación del schema */}
          <input type="hidden" {...register("orderId")} />

          {/* Monto */}
          <div>
            <div className="mb-1 flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-slate-700">
                Monto
              </label>

              <button
                type="button"
                onClick={useFullBalance}
                disabled={loading}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
              >
                Usar saldo completo
              </button>
            </div>

            <input
              {...register("amount")}
              type="number"
              disabled={loading}
              placeholder="0"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
            />

            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">
                {errors.amount.message}
              </p>
            )}

            {amount && !amountExceedsBalance && (
              <p className="mt-1.5 text-xs text-slate-500">
                Registrando {formatCurrency(numericAmount)} de un saldo de{" "}
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
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
            >
              <option value="CASH">Efectivo</option>
              <option value="BANK_TRANSFER">Transferencia bancaria</option>
              <option value="DEBIT_CARD">Tarjeta de débito</option>
              <option value="CREDIT_CARD">Tarjeta de crédito</option>
              <option value="OTHER">Otro</option>
            </select>

            {errors.method && (
              <p className="mt-1 text-sm text-red-600">
                {errors.method.message}
              </p>
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
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
            />

            {errors.paidAt && (
              <p className="mt-1 text-sm text-red-600">
                {errors.paidAt.message}
              </p>
            )}
          </div>

          {/* Referencia */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Referencia
              <span className="ml-1 font-normal text-slate-400">
                (opcional)
              </span>
            </label>

            <input
              {...register("reference")}
              disabled={loading}
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
              <span className="ml-1 font-normal text-slate-400">
                (opcional)
              </span>
            </label>

            <textarea
              {...register("notes")}
              rows={3}
              disabled={loading}
              placeholder="Información adicional del pago..."
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
            />

            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">
                {errors.notes.message}
              </p>
            )}
          </div>

          {serverError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading || amountExceedsBalance || pendingAmount <= 0}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Registrar pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
