import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCreateLogo } from "../../../hooks/useLogos";

import { LogoForm } from "../components/LogoForm";

import type { LogoFormData } from "../schemas/logo.schema";

import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";

import { useToast } from "../../../components/ui";

export function LogoCreatePage() {
  const navigate = useNavigate();

  const toast = useToast();

  const createLogo = useCreateLogo();

  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(formData: LogoFormData) {
    setFormError(null);

    try {
      const logo = await createLogo.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        customerId: formData.customerId || undefined,
        currentPrice: formData.currentPrice || "0",
      });

      toast.success("Logo creado", "El logo se creó correctamente.");

      navigate(`/logos/${logo.id}`);
    } catch (error) {
      const message = getApiErrorMessage(error);

      setFormError(message);

      toast.error("No se pudo crear el logo", message);
    }
  }

  function handleCancel() {
    if (createLogo.isPending) {
      return;
    }

    navigate("/logos");
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={handleCancel}
          className="mb-3 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          ← Volver a logos
        </button>

        <h1 className="text-2xl font-bold text-slate-900">Nuevo logo</h1>

        <p className="mt-1 text-sm text-slate-500">
          Registra un nuevo logo para comenzar a gestionar sus versiones y
          archivos.
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <LogoForm
          loading={createLogo.isPending}
          serverError={formError}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
