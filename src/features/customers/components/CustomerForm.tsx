import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  customerSchema,
  type CustomerFormData,
} from "../schemas/customer.schema";

import type { Customer } from "../../../types";

interface CustomerFormProps {
  customer?: Customer | null;
  loading?: boolean;
  serverError?: string | null;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onCancel: () => void;
}

function InputError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

export function CustomerForm({
  customer,
  loading = false,
  serverError,
  onSubmit,
  onCancel,
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      taxId: "",
      companyName: "",
      address: "",
      city: "",
      notes: "",
    },
  });

  useEffect(() => {
    reset({
      name: customer?.name ?? "",
      email: customer?.email ?? "",
      phone: customer?.phone ?? "",
      taxId: customer?.taxId ?? "",
      companyName: customer?.companyName ?? "",
      address: customer?.address ?? "",
      city: customer?.city ?? "",
      notes: customer?.notes ?? "",
    });
  }, [customer, reset]);

  const submit: SubmitHandler<CustomerFormData> = async (data) => {
    await onSubmit({
      ...data,
      email: data.email || undefined,
      phone: data.phone || undefined,
      taxId: data.taxId || undefined,
      companyName: data.companyName || undefined,
      address: data.address || undefined,
      city: data.city || undefined,
      notes: data.notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nombre *
          </label>

          <input
            {...register("name")}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500"
            placeholder="Juan Pérez"
          />

          <InputError message={errors.name?.message} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            RUT
          </label>

          <input
            {...register("taxId")}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500"
            placeholder="12.345.678-9"
          />

          <InputError message={errors.taxId?.message} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>

          <input
            {...register("email")}
            type="email"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500"
            placeholder="cliente@empresa.cl"
          />

          <InputError message={errors.email?.message} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Teléfono
          </label>

          <input
            {...register("phone")}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500"
            placeholder="+56 9 1234 5678"
          />

          <InputError message={errors.phone?.message} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Empresa
          </label>

          <input
            {...register("companyName")}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500"
            placeholder="Empresa SpA"
          />

          <InputError message={errors.companyName?.message} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Ciudad
          </label>

          <input
            {...register("city")}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500"
            placeholder="Santiago"
          />

          <InputError message={errors.city?.message} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Dirección
        </label>

        <input
          {...register("address")}
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500"
          placeholder="Av. Ejemplo 123"
        />

        <InputError message={errors.address?.message} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Notas
        </label>

        <textarea
          {...register("notes")}
          rows={4}
          className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500"
          placeholder="Información adicional del cliente..."
        />

        <InputError message={errors.notes?.message} />
      </div>

      <div className="flex justify-end gap-3 border-t pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Guardando..."
            : customer
              ? "Guardar cambios"
              : "Crear cliente"}
        </button>
      </div>
    </form>
  );
}
