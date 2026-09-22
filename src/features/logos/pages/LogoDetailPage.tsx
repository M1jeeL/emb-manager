import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useChangeLogoStatus, useLogo } from "../../../hooks/useLogos";

import { LogoStatusBadge } from "../components/LogoStatusBadge";
import { LogoVersionCard } from "../components/LogoVersionCard";
import { LogoPriceHistory } from "../components/LogoPriceHistory";
import { LogoVersionDialog } from "../components/LogoVersionDialog";
import { Button, ConfirmDialog, useToast } from "../../../components/ui";
import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";
import type { LogoVersion } from "../../../types";

function formatPrice(value: string) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function LogoDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const logoQuery = useLogo(id);
  const changeStatus = useChangeLogoStatus();
  const [openConfirmArchive, setOpenConfirmArchive] = useState<boolean>(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<LogoVersion | null>(
    null,
  );

  if (logoQuery.isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-gray-200" />
          <div className="h-32 rounded-xl bg-gray-200" />
          <div className="h-48 rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  if (logoQuery.isError || !logoQuery.data) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-semibold text-red-800">
            No se pudo cargar el logo
          </h2>

          <p className="mt-1 text-sm text-red-700">
            El logo no existe o ocurrió un error al obtener la información.
          </p>

          <Link
            to="/logos"
            className="mt-4 inline-block text-sm font-medium underline"
          >
            Volver a Logos
          </Link>
        </div>
      </div>
    );
  }

  const logo = logoQuery.data;

  const handleChangeStatus = async () => {
    const nextStatus = logo.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE";

    try {
      await changeStatus.mutateAsync({
        id: logo.id,
        status: nextStatus,
      });
      toast.success(
        `Logo ${nextStatus === "ARCHIVED" ? "archivado" : "activado"}`,
        `${logo.name} fue ${
          nextStatus === "ARCHIVED" ? "archivado" : "activado"
        } correctamente.`,
      );
    } catch (error) {
      toast.error("No se pudo completar la acción", getApiErrorMessage(error));
    }
    setOpenConfirmArchive(false);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2">
            <Link
              to="/logos"
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              ← Volver a Logos
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{logo.name}</h1>

            <LogoStatusBadge status={logo.status} />
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Creado el {formatDate(logo.createdAt)}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/logos/${logo.id}/edit`)}
            className="rounded-lg px-4 py-2 text-sm"
          >
            Editar
          </Button>

          <Button
            type="button"
            variant={logo.status === "ACTIVE" ? "warning" : "success"}
            onClick={() => setOpenConfirmArchive(true)}
            disabled={changeStatus.isPending}
            className="rounded-lg px-4 py-2 text-sm"
          >
            {changeStatus.isPending
              ? "..."
              : logo.status === "ACTIVE"
                ? "Archivar"
                : "Activar"}
          </Button>
        </div>
      </div>

      {/* Información general */}
      <section className="rounded-xl border bg-white">
        <div className="border-b p-5">
          <h2 className="font-semibold text-gray-900">Información del logo</h2>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Cliente
            </p>

            <p className="mt-1 text-sm font-medium">
              {logo.customer?.name ?? "Sin cliente asociado"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Precio actual
            </p>

            <p className="mt-1 text-sm font-semibold">
              {formatPrice(logo.currentPrice)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Versiones
            </p>

            <p className="mt-1 text-sm font-medium">{logo._count.versions}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Usos en pedidos
            </p>

            <p className="mt-1 text-sm font-medium">
              {logo._count.orderItemLogos}
            </p>
          </div>
        </div>

        {logo.description && (
          <div className="border-t p-5">
            <p className="text-xs font-medium uppercase text-gray-500">
              Descripción
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
              {logo.description}
            </p>
          </div>
        )}
      </section>

      {/* Versiones */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Versiones</h2>

            <p className="text-sm text-gray-500">
              Archivos y configuraciones de cada versión.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => {
              setEditingVersion(null);
              setVersionDialogOpen(true);
            }}
            className="rounded-lg bg-black px-4 py-2 text-sm text-white"
          >
            + Nueva versión
          </Button>
        </div>

        {logo.versions.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-white p-10 text-center">
            <h3 className="font-medium">No hay versiones</h3>

            <p className="mt-1 text-sm text-gray-500">
              Crea la primera versión de este logo.
            </p>

            <Button
              type="button"
              onClick={() => {
                setEditingVersion(null);
                setVersionDialogOpen(true);
              }}
              className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white"
            >
              Crear versión
            </Button>
          </div>
        ) : (
          logo.versions.map((version) => (
            <LogoVersionCard
              key={version.id}
              logoId={logo.id}
              version={version}
              onEdit={(selectedVersion) => {
                setEditingVersion(selectedVersion);
                setVersionDialogOpen(true);
              }}
            />
          ))
        )}
      </section>

      {openConfirmArchive && (
        <ConfirmDialog
          open={openConfirmArchive !== null}
          onClose={() => {
            setOpenConfirmArchive(false);
          }}
          onConfirm={handleChangeStatus}
          title={`${logo.status === "ACTIVE" ? "Archivar" : "Activar"} logo`}
          description={`¿Estás seguro de que quieres ${
            logo.status === "ACTIVE" ? "archivar" : "activar"
          } "${logo.name}"?`}
          confirmLabel={logo.status === "ACTIVE" ? "Archivar" : "Activar"}
          cancelLabel="Cancelar"
          danger={logo.status === "ACTIVE"}
          loading={changeStatus.isPending}
        />
      )}

      {/* Historial */}
      <LogoPriceHistory history={logo.priceHistory} />

      <LogoVersionDialog
        logoId={logo.id}
        open={versionDialogOpen}
        version={editingVersion}
        onClose={() => {
          setVersionDialogOpen(false);
          setEditingVersion(null);
        }}
      />
    </div>
  );
}
