import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { machineSchema, type MachineFormData } from "../schemas/machine.schema";

import type { Machine } from "../../../types";

interface MachineFormProps {
  machine?: Machine | null;
  onSubmit: (data: MachineFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  formError?: string | null;
}

export function MachineForm({
  machine,
  onSubmit,
  onCancel,
  isSubmitting = false,
  formError,
}: MachineFormProps) {
  const isEditing = Boolean(machine);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MachineFormData>({
    resolver: zodResolver(machineSchema),

    defaultValues: {
      name: machine?.name ?? "",
      code: machine?.code ?? "",
      type: machine?.type ?? "EMBROIDERY",
      brand: machine?.brand ?? "",
      model: machine?.model ?? "",
      serialNumber: machine?.serialNumber ?? "",
      needleCount: machine?.needleCount ?? undefined,
      headCount: machine?.headCount ?? undefined,
      notes: machine?.notes ?? "",
    },
  });

  useEffect(() => {
    reset({
      name: machine?.name ?? "",
      code: machine?.code ?? "",
      type: machine?.type ?? "EMBROIDERY",
      brand: machine?.brand ?? "",
      model: machine?.model ?? "",
      serialNumber: machine?.serialNumber ?? "",
      needleCount: machine?.needleCount ?? undefined,
      headCount: machine?.headCount ?? undefined,
      notes: machine?.notes ?? "",
    });
  }, [machine, reset]);

  const submit = async (data: MachineFormData) => {
    await onSubmit({
      ...data,

      code: data.code?.trim() || undefined,
      brand: data.brand?.trim() || undefined,
      model: data.model?.trim() || undefined,
      serialNumber: data.serialNumber?.trim() || undefined,
      notes: data.notes?.trim() || undefined,

      needleCount: data.needleCount ?? undefined,

      headCount: data.headCount ?? undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nombre *
          </label>

          <input
            {...register("name")}
            placeholder="Ej: Brother PR1055X"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Código
          </label>

          <input
            {...register("code")}
            placeholder="Ej: MAQ-001"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Tipo *
          </label>

          <select
            {...register("type")}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="EMBROIDERY">Bordado</option>

            <option value="MULTIHEAD">Multi-cabezal</option>

            <option value="SINGLEHEAD">Un cabezal</option>

            <option value="OTHER">Otro</option>
          </select>

          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Marca
          </label>

          <input
            {...register("brand")}
            placeholder="Ej: Brother"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

          {errors.brand && (
            <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Modelo
          </label>

          <input
            {...register("model")}
            placeholder="Ej: PR1055X"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

          {errors.model && (
            <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Número de serie
          </label>

          <input
            {...register("serialNumber")}
            placeholder="Ej: BR-123456"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

          {errors.serialNumber && (
            <p className="mt-1 text-sm text-red-600">
              {errors.serialNumber.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Cantidad de agujas
          </label>

          <input
            type="number"
            min={1}
            {...register("needleCount", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
            placeholder="Ej: 15"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

          {errors.needleCount && (
            <p className="mt-1 text-sm text-red-600">
              {errors.needleCount.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Cantidad de cabezales
          </label>

          <input
            type="number"
            min={1}
            {...register("headCount", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
            placeholder="Ej: 1"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

          {errors.headCount && (
            <p className="mt-1 text-sm text-red-600">
              {errors.headCount.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Notas
        </label>

        <textarea
          {...register("notes")}
          rows={4}
          placeholder="Información adicional sobre la máquina..."
          className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />

        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

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
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Crear máquina"}
        </button>
      </div>
    </form>
  );
}
