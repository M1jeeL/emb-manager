import { useState } from "react";

import type { LogoFile } from "../../../types";

import {
  useDeleteLogoFile,
  useDownloadLogoFile,
} from "../../../hooks/useLogos";
import { Button, ConfirmDialog, useToast } from "../../../components/ui";
import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";
interface LogoFileCardProps {
  logoId: string;
  versionId: string;
  file: LogoFile;
}

function formatFileSize(value: string | null) {
  if (!value) return "Tamaño desconocido";

  const bytes = Number(value);

  if (!Number.isFinite(bytes)) {
    return "Tamaño desconocido";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(file: LogoFile) {
  return file.type === "IMAGE" && Boolean(file.mimeType?.startsWith("image/"));
}

export function LogoFileCard({ logoId, versionId, file }: LogoFileCardProps) {
  const downloadFile = useDownloadLogoFile();
  const deleteFile = useDeleteLogoFile();
  const toast = useToast();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [openConfirmDelete, setOpenConfirmDelete] = useState<boolean>(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState<boolean>(false);

  const handleDownload = async () => {
    const result = await downloadFile.mutateAsync({
      logoId,
      versionId,
      fileId: file.id,
    });

    const anchor = document.createElement("a");

    anchor.href = result.url;
    anchor.download = result.fileName;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handlePreview = async () => {
    if (!isImage(file)) {
      return;
    }

    const result = await downloadFile.mutateAsync({
      logoId,
      versionId,
      fileId: file.id,
    });

    setPreviewUrl(result.url);
    setPreviewOpen(true);
  };

  const handleDelete = async () => {
    setIsLoadingDelete(true);
    try {
      await deleteFile.mutateAsync({
        logoId,
        versionId,
        fileId: file.id,
      });
      toast.success(
        "Archivo eliminado",
        "Se ha eliminado el archivo correctamente",
      );
    } catch (error) {
      const message = getApiErrorMessage(error);
      toast.error("No se pudo completar la acción", message);
    }
    setOpenConfirmDelete(false);
    setIsLoadingDelete(false);
  };

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg border bg-white p-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
          {isImage(file) ? (
            <button
              type="button"
              onClick={handlePreview}
              disabled={downloadFile.isPending}
              className="h-full w-full"
              title="Ver preview"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={file.fileName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lg">🖼️</span>
              )}
            </button>
          ) : (
            <span className="text-xs font-semibold text-gray-500">
              {file.format}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium">{file.fileName}</p>

            {file.isPrimary && (
              <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[11px] text-white">
                Principal
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-gray-500">
            {file.type === "IMAGE" ? "Imagen" : "Bordado"} · {file.format} ·{" "}
            {formatFileSize(file.fileSize)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isImage(file) && (
            <Button
              type="button"
              variant="info"
              onClick={handlePreview}
              disabled={downloadFile.isPending}
              className="rounded-lg border px-3 py-1.5 text-xs"
            >
              Ver
            </Button>
          )}

          <Button
            type="button"
            variant="link"
            onClick={handleDownload}
            disabled={downloadFile.isPending}
            className="rounded-lg border px-3 py-1.5 text-xs"
          >
            {downloadFile.isPending ? "..." : "Descargar"}
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={() => setOpenConfirmDelete(true)}
            disabled={deleteFile.isPending}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600"
          >
            Eliminar
          </Button>
        </div>
      </div>
      {openConfirmDelete && (
        <ConfirmDialog
          open={openConfirmDelete !== null}
          onClose={() => {
            setOpenConfirmDelete(false);
          }}
          onConfirm={handleDelete}
          title="Eliminar archivo"
          description="¿Estás seguro que quieres eliminar el archivo seleccionado?"
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          danger
          loading={isLoadingDelete}
        />
      )}

      {previewOpen && previewUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={() => {
            setPreviewOpen(false);
          }}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={previewUrl}
              alt={file.fileName}
              className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain"
            />

            <Button
              type="button"
              onClick={() => {
                setPreviewOpen(false);
              }}
              className="absolute right-2 top-2 rounded-full bg-black/70 px-3 py-1 text-white"
            >
              ×
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
