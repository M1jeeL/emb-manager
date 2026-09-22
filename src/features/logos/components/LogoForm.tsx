import { useEffect } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { useCustomers } from "../../../hooks/useCustomers";

import type { Logo } from "../../../types";

import { logoSchema, type LogoFormData } from "../schemas/logo.schema";

interface LogoFormProps {
  logo?: Logo | null;
  loading?: boolean;
  serverError?: string | null;
  onSubmit: (data: LogoFormData) => void | Promise<void>;
  onCancel: () => void;
}

export function LogoForm({
  logo,
  loading = false,
  serverError,
  onSubmit,
  onCancel,
}: LogoFormProps) {
  const { data: customersData, isLoading: customersLoading } = useCustomers({
    page: 1,
    limit: 100,
    status: "ACTIVE",
  });

  const customers = customersData?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LogoFormData>({
    resolver: zodResolver(logoSchema),
    defaultValues: {
      name: "",
      customerId: "",
      description: "",
      currentPrice: "0",
    },
  });

  useEffect(() => {
    reset({
      name: logo?.name ?? "",
      customerId: logo?.customerId ?? "",
      description: logo?.description ?? "",
      currentPrice: logo?.currentPrice ?? "0",
    });
  }, [logo, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {/* Nombre */}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nombre del logo
          </label>

          <input
            {...register("name")}
            disabled={loading}
            placeholder="Ej: Logo Nike"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
          />

          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Cliente */}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Cliente
          </label>

          <select
            {...register("customerId")}
            disabled={loading || customersLoading}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
          >
            <option value="">Sin cliente</option>

            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
                {customer.companyName ? ` — ${customer.companyName}` : ""}
              </option>
            ))}
          </select>

          {errors.customerId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.customerId.message}
            </p>
          )}
        </div>

        {/* Precio */}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Precio actual
          </label>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
              $
            </span>

            <input
              {...register("currentPrice")}
              type="number"
              min="0"
              step="1"
              disabled={loading}
              placeholder="0"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-8 pr-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
            />
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Este precio corresponde al valor actual del logo para nuevos
            trabajos.
          </p>

          {errors.currentPrice && (
            <p className="mt-1 text-sm text-red-600">
              {errors.currentPrice.message}
            </p>
          )}
        </div>

        {/* Descripción */}

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Descripción
          </label>

          <textarea
            {...register("description")}
            disabled={loading}
            rows={4}
            placeholder="Información adicional del logo..."
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
          />

          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Guardando..." : logo ? "Guardar cambios" : "Crear logo"}
        </button>
      </div>
    </form>
  );
}
