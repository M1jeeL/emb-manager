import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAvailablePaymentOrders } from "../../../hooks/usePayments";

import type { CreatePaymentPayload, PaymentMethod } from "../../../types";

import { paymentSchema, type PaymentFormData } from "../schemas/payment.schema";

interface PaymentFormProps {
  isSubmitting?: boolean;
  onSubmit: (payload: CreatePaymentPayload) => void | Promise<void>;
  onCancel: () => void;
  serverError?: string | null;
}

const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
}[] = [
  {
    value: "CASH",
    label: "Efectivo",
  },
  {
    value: "BANK_TRANSFER",
    label: "Transferencia bancaria",
  },
  {
    value: "DEBIT_CARD",
    label: "Tarjeta de débito",
  },
  {
    value: "CREDIT_CARD",
    label: "Tarjeta de crédito",
  },
  {
    value: "OTHER",
    label: "Otro",
  },
];

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function getLocalDateTimeValue() {
  const now = new Date();

  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

export function PaymentForm({
  isSubmitting = false,
  onSubmit,
  onCancel,
  serverError,
}: PaymentFormProps) {
  const availableOrdersQuery = useAvailablePaymentOrders();

  const orders = useMemo(
    () => availableOrdersQuery.data ?? [],
    [availableOrdersQuery.data],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),

    defaultValues: {
      orderId: "",
      amount: "",
      method: "CASH",
      paidAt: getLocalDateTimeValue(),
      reference: "",
      notes: "",
    },
  });

  const selectedOrderId = watch("orderId");
  const amount = watch("amount");

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  const pendingAmount = useMemo(() => {
    if (!selectedOrder) {
      return 0;
    }

    return Math.max(
      0,
      Number(selectedOrder.total) - Number(selectedOrder.paidAmount),
    );
  }, [selectedOrder]);

  useEffect(() => {
    if (!selectedOrder) {
      return;
    }

    setValue("amount", pendingAmount.toFixed(0), {
      shouldValidate: true,
    });
  }, [selectedOrder, pendingAmount, setValue]);

  useEffect(() => {
    if (serverError) {
      setError("root.server", {
        message: serverError,
      });
    }
  }, [serverError, setError]);

  function handleUseFullBalance() {
    if (!selectedOrder) {
      return;
    }

    setValue("amount", pendingAmount.toFixed(0), {
      shouldValidate: true,
    });
  }

  async function submit(data: PaymentFormData) {
    const payload: CreatePaymentPayload = {
      orderId: data.orderId,
      amount: data.amount,
      method: data.method,

      ...(data.paidAt
        ? {
            paidAt: new Date(data.paidAt).toISOString(),
          }
        : {}),

      ...(data.reference?.trim()
        ? {
            reference: data.reference.trim(),
          }
        : {}),

      ...(data.notes?.trim()
        ? {
            notes: data.notes.trim(),
          }
        : {}),
    };

    await onSubmit(payload);
  }

  const isLoadingOrders = availableOrdersQuery.isLoading;

  const hasNoOrders = !isLoadingOrders && orders.length === 0;

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      {/* Orden */}
      <div>
        <label
          htmlFor="orderId"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Orden
        </label>

        <select
          id="orderId"
          {...register("orderId")}
          disabled={isSubmitting || isLoadingOrders}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          <option value="">
            {isLoadingOrders ? "Cargando órdenes..." : "Selecciona una orden"}
          </option>

          {orders.map((order) => {
            const balance = Number(order.total) - Number(order.paidAmount);

            const customerName = order.customer.companyName
              ? `${order.customer.name} · ${order.customer.companyName}`
              : order.customer.name;

            return (
              <option key={order.id} value={order.id}>
                #{order.orderNumber} · {customerName} · Pendiente{" "}
                {formatCurrency(balance)}
              </option>
            );
          })}
        </select>

        {errors.orderId && (
          <p className="mt-1.5 text-sm text-red-600">
            {errors.orderId.message}
          </p>
        )}

        {hasNoOrders && (
          <p className="mt-2 text-sm text-slate-500">
            No existen órdenes con saldo pendiente disponibles para registrar
            pagos.
          </p>
        )}
      </div>

      {/* Resumen de orden */}
      {selectedOrder && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Orden seleccionada
            </p>

            <p className="mt-1 text-base font-semibold text-slate-900">
              #{selectedOrder.orderNumber}
            </p>

            <p className="text-sm text-slate-600">
              {selectedOrder.customer.name}

              {selectedOrder.customer.companyName && (
                <> · {selectedOrder.customer.companyName}</>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-500">Total</p>

              <p className="mt-0.5 text-sm font-semibold text-slate-900">
                {formatCurrency(selectedOrder.total)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Pagado</p>

              <p className="mt-0.5 text-sm font-semibold text-slate-900">
                {formatCurrency(selectedOrder.paidAmount)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Saldo pendiente</p>

              <p className="mt-0.5 text-sm font-semibold text-amber-700">
                {formatCurrency(pendingAmount)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Monto */}
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-slate-700"
          >
            Monto
          </label>

          {selectedOrder && (
            <button
              type="button"
              onClick={handleUseFullBalance}
              disabled={isSubmitting}
              className="text-xs font-medium text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Usar saldo completo
            </button>
          )}
        </div>

        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-500">
            $
          </span>

          <input
            id="amount"
            type="number"
            min="1"
            step="1"
            {...register("amount")}
            disabled={isSubmitting || !selectedOrder}
            placeholder="0"
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-8 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>

        {errors.amount && (
          <p className="mt-1.5 text-sm text-red-600">{errors.amount.message}</p>
        )}

        {selectedOrder && amount && (
          <p className="mt-1.5 text-xs text-slate-500">
            Registrando {formatCurrency(amount)} de un saldo de{" "}
            {formatCurrency(pendingAmount)}.
          </p>
        )}
      </div>

      {/* Método */}
      <div>
        <label
          htmlFor="method"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Método de pago
        </label>

        <select
          id="method"
          {...register("method")}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          {PAYMENT_METHODS.map((method) => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </select>

        {errors.method && (
          <p className="mt-1.5 text-sm text-red-600">{errors.method.message}</p>
        )}
      </div>

      {/* Fecha */}
      <div>
        <label
          htmlFor="paidAt"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Fecha y hora del pago
        </label>

        <input
          id="paidAt"
          type="datetime-local"
          {...register("paidAt")}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        />

        {errors.paidAt && (
          <p className="mt-1.5 text-sm text-red-600">{errors.paidAt.message}</p>
        )}
      </div>

      {/* Referencia */}
      <div>
        <label
          htmlFor="reference"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Referencia
          <span className="ml-1 font-normal text-slate-400">(opcional)</span>
        </label>

        <input
          id="reference"
          type="text"
          {...register("reference")}
          disabled={isSubmitting}
          placeholder="N° de transferencia, comprobante, etc."
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        />

        {errors.reference && (
          <p className="mt-1.5 text-sm text-red-600">
            {errors.reference.message}
          </p>
        )}
      </div>

      {/* Notas */}
      <div>
        <label
          htmlFor="notes"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Notas
          <span className="ml-1 font-normal text-slate-400">(opcional)</span>
        </label>

        <textarea
          id="notes"
          rows={3}
          {...register("notes")}
          disabled={isSubmitting}
          placeholder="Observaciones relacionadas con el pago..."
          className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        />

        {errors.notes && (
          <p className="mt-1.5 text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      {/* Error servidor */}
      {errors.root?.server?.message && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.root.server.message}
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
          disabled={isSubmitting || isLoadingOrders || hasNoOrders}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Registrando..." : "Registrar pago"}
        </button>
      </div>
    </form>
  );
}
