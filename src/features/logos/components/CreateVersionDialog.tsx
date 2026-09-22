import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  createLogoVersionSchema,
  type CreateLogoVersionForm,
} from "../schemas/logo-version.schema";

import { useCreateLogoVersion } from "../../../hooks/useLogos";

interface CreateVersionDialogProps {
  logoId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateVersionDialog({
  logoId,
  open,
  onClose,
  onSuccess,
}: CreateVersionDialogProps) {
  const createVersion = useCreateLogoVersion();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLogoVersionForm>({
    resolver: zodResolver(createLogoVersionSchema),
    defaultValues: {
      widthMm: "",
      heightMm: "",
      notes: "",
    },
  });

  if (!open) {
    return null;
  }

  const onSubmit = async (data: CreateLogoVersionForm) => {
    try {
      await createVersion.mutateAsync({
        logoId,
        payload: {
          widthMm: data.widthMm || undefined,
          heightMm: data.heightMm || undefined,
          stitchCount:
            data.stitchCount === undefined || Number.isNaN(data.stitchCount)
              ? undefined
              : data.stitchCount,
          notes: data.notes || undefined,
        },
      });

      reset();
      onClose();
      onSuccess?.();
    } catch {
      // El error se muestra debajo.
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Crear nueva versión
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Agrega las características de la nueva versión del logo.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Ancho (mm)
              </label>

              <input
                {...register("widthMm")}
                placeholder="Ej: 12.50"
                className="w-full rounded-lg border px-3 py-2"
              />

              {errors.widthMm && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.widthMm.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Alto (mm)
              </label>

              <input
                {...register("heightMm")}
                placeholder="Ej: 8.25"
                className="w-full rounded-lg border px-3 py-2"
              />

              {errors.heightMm && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.heightMm.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Cantidad de puntadas
            </label>

            <input
              type="number"
              min={0}
              {...register("stitchCount", {
                valueAsNumber: true,
              })}
              placeholder="Ej: 4500"
              className="w-full rounded-lg border px-3 py-2"
            />

            {errors.stitchCount && (
              <p className="mt-1 text-xs text-red-600">
                {errors.stitchCount.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Notas</label>

            <textarea
              {...register("notes")}
              rows={4}
              placeholder="Información adicional..."
              className="w-full rounded-lg border px-3 py-2"
            />

            {errors.notes && (
              <p className="mt-1 text-xs text-red-600">
                {errors.notes.message}
              </p>
            )}
          </div>

          {createVersion.isError && (
            <p className="text-sm text-red-600">No se pudo crear la versión.</p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={createVersion.isPending}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={createVersion.isPending}
              className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {createVersion.isPending ? "Creando..." : "Crear versión"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
