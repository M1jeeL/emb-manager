import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useChangeLogoStatus, useLogos } from "../../../hooks/useLogos";

import { LogoFilters } from "../components/LogoFilters";

import type { Logo, LogoFilters as LogoFiltersType } from "../../../types";

import { Pagination } from "../../../components/ui/Pagination";

import {
  Button,
  ConfirmDialog,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from "../../../components/ui";

import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";

function parsePositiveInteger(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function formatPrice(value: string) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function LogosPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();
  const toast = useToast();

  const [logoToHandleStatus, setLogoToHandleStatus] = useState<Logo | null>(
    null,
  );

  const initialFilters: LogoFiltersType = {
    page: parsePositiveInteger(searchParams.get("page"), 1),

    limit: parsePositiveInteger(searchParams.get("limit"), 20),

    name: searchParams.get("name") || undefined,

    customerId: searchParams.get("customerId") || undefined,

    status:
      (searchParams.get("status") as LogoFiltersType["status"]) || undefined,
  };

  const [filters, setFilters] = useState<LogoFiltersType>(initialFilters);

  const { data, isLoading, isFetching, isError, error } = useLogos(filters);

  const changeStatus = useChangeLogoStatus();

  function updateUrl(nextFilters: LogoFiltersType) {
    const params = new URLSearchParams();

    if (nextFilters.name) {
      params.set("name", nextFilters.name);
    }

    if (nextFilters.customerId) {
      params.set("customerId", nextFilters.customerId);
    }

    if (nextFilters.status) {
      params.set("status", nextFilters.status);
    }

    if (nextFilters.page && nextFilters.page > 1) {
      params.set("page", String(nextFilters.page));
    }

    if (nextFilters.limit && nextFilters.limit !== 20) {
      params.set("limit", String(nextFilters.limit));
    }

    setSearchParams(params);
  }

  function handleFiltersChange(nextFilters: LogoFiltersType) {
    setFilters(nextFilters);
    updateUrl(nextFilters);
  }

  function handlePageChange(page: number) {
    const nextFilters = {
      ...filters,
      page,
    };

    handleFiltersChange(nextFilters);
  }

  function handleLimitChange(limit: number) {
    const nextFilters = {
      ...filters,
      page: 1,
      limit,
    };

    handleFiltersChange(nextFilters);
  }

  function openCreatePage() {
    navigate("/logos/new");
  }

  function openDetailPage(logo: Logo) {
    navigate(`/logos/${logo.id}`);
  }

  function handleChangeStatusClick(logo: Logo) {
    setLogoToHandleStatus(logo);
  }

  async function toggleStatus() {
    if (!logoToHandleStatus) {
      return;
    }

    try {
      const nextStatus =
        logoToHandleStatus.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE";

      await changeStatus.mutateAsync({
        id: logoToHandleStatus.id,
        status: nextStatus,
      });

      toast.success(
        `Logo ${nextStatus === "ARCHIVED" ? "archivado" : "activado"}`,
        `${logoToHandleStatus.name} fue ${
          nextStatus === "ARCHIVED" ? "archivado" : "activado"
        } correctamente.`,
      );
    } catch (error) {
      toast.error("No se pudo completar la acción", getApiErrorMessage(error));
    }

    setLogoToHandleStatus(null);
  }

  const logos = data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Logos</h1>

          <p className="mt-1 text-sm text-slate-500">
            Gestiona los logos de tus clientes, sus precios, versiones y
            archivos.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreatePage}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700"
        >
          + Nuevo logo
        </Button>
      </div>

      {/* Filtros */}

      <LogoFilters filters={filters} onChange={handleFiltersChange} />

      {/* Resultados */}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {isLoading ? (
          <div className="p-10 text-center text-slate-500">
            Cargando logos...
          </div>
        ) : isError ? (
          <div className="p-6">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error instanceof Error
                ? error.message
                : "No se pudieron cargar los logos"}
            </div>
          </div>
        ) : logos.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="font-semibold text-slate-900">
              No encontramos logos
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Prueba cambiando los filtros o registra un nuevo logo.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="border-b bg-slate-50">
                  <TableRow>
                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Logo
                    </TableHead>

                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Cliente
                    </TableHead>

                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Precio
                    </TableHead>

                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Estado
                    </TableHead>

                    <TableHead className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y">
                  {logos.map((logo) => (
                    <TableRow key={logo.id} className="hover:bg-slate-50">
                      <TableCell className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => openDetailPage(logo)}
                          className="text-left"
                        >
                          <div className="font-medium text-indigo-600 hover:text-indigo-800">
                            {logo.name}
                          </div>

                          <div className="text-sm text-slate-500">
                            {logo.description ?? "Sin descripción"}
                          </div>
                        </button>
                      </TableCell>

                      <TableCell className="px-6 py-4 text-sm text-slate-600">
                        {logo.customer?.name ?? "Sin cliente"}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-sm font-medium text-slate-700">
                        {formatPrice(logo.currentPrice)}
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <span
                          className={
                            logo.status === "ACTIVE"
                              ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                              : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                          }
                        >
                          {logo.status === "ACTIVE" ? "Activo" : "Archivado"}
                        </span>
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => openDetailPage(logo)}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            Ver
                          </button>

                          <button
                            type="button"
                            onClick={() => handleChangeStatusClick(logo)}
                            disabled={changeStatus.isPending}
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
                          >
                            {logo.status === "ACTIVE" ? "Archivar" : "Activar"}
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {data?.meta && (
              <Pagination
                page={data.meta.page}
                totalPages={data.meta.totalPages}
                total={data.meta.total}
                limit={data.meta.limit}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            )}
          </>
        )}

        {logoToHandleStatus && (
          <ConfirmDialog
            open={logoToHandleStatus !== null}
            onClose={() => {
              if (!changeStatus.isPending) {
                setLogoToHandleStatus(null);
              }
            }}
            onConfirm={toggleStatus}
            title={`${
              logoToHandleStatus.status === "ACTIVE" ? "Archivar" : "Activar"
            } logo`}
            description={`¿Estás seguro de que quieres ${
              logoToHandleStatus.status === "ACTIVE" ? "archivar" : "activar"
            } "${logoToHandleStatus.name}"?`}
            confirmLabel={
              logoToHandleStatus.status === "ACTIVE" ? "Archivar" : "Activar"
            }
            cancelLabel="Cancelar"
            danger={logoToHandleStatus.status === "ACTIVE"}
            loading={changeStatus.isPending}
          />
        )}

        {isFetching && !isLoading && (
          <div className="border-t bg-slate-50 px-5 py-2 text-xs text-slate-500">
            Actualizando resultados...
          </div>
        )}
      </div>
    </div>
  );
}
