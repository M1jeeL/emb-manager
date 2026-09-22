import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useLogo, useUpdateLogo } from "../../../hooks/useLogos";

import { LogoForm } from "../components/LogoForm";

import type { LogoFormData } from "../schemas/logo.schema";

import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";

import { useToast } from "../../../components/ui";

export function LogoEditPage() {
  const { id } = useParams<{
    id: string;
  }>();

  const navigate = useNavigate();

  const toast = useToast();

  const { data: logo, isLoading, isError, error } = useLogo(id ?? "");

  const updateLogo = useUpdateLogo();

  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(formData: LogoFormData) {
    if (!id) {
      return;
    }

    setFormError(null);

    try {
      await updateLogo.mutateAsync({
        id,
        payload: {
          name: formData.name,
          description: formData.description || undefined,
          customerId: formData.customerId || undefined,
          currentPrice: formData.currentPrice || "0",
        },
      });

      toast.success(
        "Logo actualizado",
        "Los cambios se guardaron correctamente.",
      );

      navigate(`/logos/${id}`);
    } catch (error) {
      const message = getApiErrorMessage(error);

      setFormError(message);

      toast.error("No se pudo actualizar el logo", message);
    }
  }

  if (isLoading) {
    return (
      <div className="p-10 text-center text-slate-500">Cargando logo...</div>
    );
  }

  if (isError || !logo) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {error instanceof Error ? error.message : "No se pudo cargar el logo"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate(`/logos/${id}`)}
          className="mb-3 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          ← Volver al logo
        </button>

        <h1 className="text-2xl font-bold text-slate-900">Editar logo</h1>

        <p className="mt-1 text-sm text-slate-500">
          Actualiza la información general del logo.
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <LogoForm
          logo={logo}
          loading={updateLogo.isPending}
          serverError={formError}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/logos/${id}`)}
        />
      </div>
    </div>
  );
}
