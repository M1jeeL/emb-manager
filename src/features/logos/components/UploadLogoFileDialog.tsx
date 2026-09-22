import { useState } from "react";

import type { LogoFileType } from "../../../types";

import { useUploadLogoFile } from "../../../hooks/useLogos";

interface UploadLogoFileDialogProps {
  logoId: string;
  versionId: string;
  open: boolean;
  onClose: () => void;
}

export function UploadLogoFileDialog({
  logoId,
  versionId,
  open,
  onClose,
}: UploadLogoFileDialogProps) {
  const uploadFile = useUploadLogoFile();

  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<LogoFileType>("IMAGE");
  const [format, setFormat] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);

    if (!file) {
      setError("Selecciona un archivo.");
      return;
    }

    if (!format.trim()) {
      setError("Ingresa el formato del archivo.");
      return;
    }

    try {
      await uploadFile.mutateAsync({
        logoId,
        versionId,
        file,
        payload: {
          type,
          format: format.trim().toUpperCase(),
          isPrimary,
        },
      });

      setFile(null);
      setType("IMAGE");
      setFormat("");
      setIsPrimary(false);

      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "No se pudo subir el archivo.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Subir archivo</h2>

          <p className="mt-1 text-sm text-gray-500">
            Agrega un archivo a esta versión del logo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Archivo</label>

            <input
              type="file"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
              }}
              className="w-full rounded-lg border p-2 text-sm"
            />

            {file && <p className="mt-1 text-xs text-gray-500">{file.name}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Tipo</label>

            <select
              value={type}
              onChange={(event) => setType(event.target.value as LogoFileType)}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="IMAGE">Imagen</option>

              <option value="EMBROIDERY">Bordado</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Formato</label>

            <input
              value={format}
              onChange={(event) => setFormat(event.target.value)}
              placeholder={
                type === "IMAGE" ? "PNG, JPG, SVG..." : "DST, PES, JEF..."
              }
              maxLength={20}
              className="w-full rounded-lg border px-3 py-2 uppercase"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(event) => setIsPrimary(event.target.checked)}
            />

            <span className="text-sm">Marcar como archivo principal</span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={uploadFile.isPending}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={uploadFile.isPending}
              className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {uploadFile.isPending ? "Subiendo..." : "Subir archivo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
