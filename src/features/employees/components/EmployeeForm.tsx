import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Employee } from "../../../types";

import {
  employeeSchema,
  type EmployeeFormData,
} from "../schemas/employee.schema";

interface EmployeeFormProps {
  employee?: Employee | null;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  formError?: string | null;
}

export function EmployeeForm({
  employee,
  onSubmit,
  onCancel,
  isSubmitting = false,
  formError,
}: EmployeeFormProps) {
  const isEditing = Boolean(employee);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),

    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      position: "",
      notes: "",
    },
  });

  useEffect(() => {
    reset({
      firstName: employee?.firstName ?? "",
      lastName: employee?.lastName ?? "",
      phone: employee?.phone ?? "",
      email: employee?.email ?? "",
      position: employee?.position ?? "",
      notes: employee?.notes ?? "",
    });
  }, [employee, reset]);

  async function handleFormSubmit(data: EmployeeFormData) {
    await onSubmit({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone?.trim() || undefined,
      email: data.email?.trim() || undefined,
      position: data.position?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Nombre
          </label>

          <input
            {...register("firstName")}
            disabled={isSubmitting}
            placeholder="Ej. Pedro"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100"
          />

          {errors.firstName && (
            <p className="mt-1 text-xs text-red-600">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Apellido
          </label>

          <input
            {...register("lastName")}
            disabled={isSubmitting}
            placeholder="Ej. González"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100"
          />

          {errors.lastName && (
            <p className="mt-1 text-xs text-red-600">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Teléfono
          </label>

          <input
            {...register("phone")}
            disabled={isSubmitting}
            placeholder="+569..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100"
          />

          {errors.phone && (
            <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Correo electrónico
          </label>

          <input
            {...register("email")}
            type="email"
            disabled={isSubmitting}
            placeholder="correo@ejemplo.cl"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100"
          />

          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Cargo
        </label>

        <input
          {...register("position")}
          disabled={isSubmitting}
          placeholder="Ej. Bordador"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100"
        />

        {errors.position && (
          <p className="mt-1 text-xs text-red-600">{errors.position.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Notas
        </label>

        <textarea
          {...register("notes")}
          disabled={isSubmitting}
          rows={4}
          placeholder="Información adicional del empleado..."
          className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100"
        />

        {errors.notes && (
          <p className="mt-1 text-xs text-red-600">{errors.notes.message}</p>
        )}
      </div>

      {employee?.user && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Usuario vinculado
          </p>

          <p className="mt-1 text-sm font-medium text-slate-900">
            {employee.user.firstName} {employee.user.lastName}
          </p>

          <p className="text-sm text-slate-500">{employee.user.email}</p>
        </div>
      )}

      {formError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Crear empleado"}
        </button>
      </div>
    </form>
  );
}
