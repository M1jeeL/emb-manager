import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button, Input, Textarea } from "../../../components/ui";

import type { Garment } from "../../../types";

import { garmentSchema, type GarmentFormData } from "../schemas/garment.schema";

interface GarmentFormProps {
  garment?: Garment | null;
  loading?: boolean;
  serverError?: string | null;
  onSubmit: (values: GarmentFormData) => void;
  onCancel: () => void;
}

export function GarmentForm({
  garment,
  loading = false,
  serverError,
  onSubmit,
  onCancel,
}: GarmentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GarmentFormData>({
    resolver: zodResolver(garmentSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    reset({
      name: garment?.name ?? "",
      description: garment?.description ?? "",
    });
  }, [garment, reset]);

  const submit: SubmitHandler<GarmentFormData> = async (data) => {
    await onSubmit({
      ...data,
      description: data.description || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <Input
        label="Nombre"
        placeholder="Ej. Polera cuello redondo"
        error={errors.name?.message}
        disabled={loading}
        {...register("name")}
      />

      <Textarea
        label="Descripción"
        placeholder="Describe la prenda..."
        hint="Opcional"
        error={errors.description?.message}
        disabled={loading}
        {...register("description")}
      />

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>

        <Button type="submit" loading={loading}>
          {garment ? "Guardar cambios" : "Crear prenda"}
        </Button>
      </div>
    </form>
  );
}
