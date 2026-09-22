import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  useUpdateGarmentStatus,
  useCreateGarment,
  useGarments,
  useUpdateGarment,
} from "../../../hooks/useGarments";

import { GarmentFilters } from "../components/GarmentFilters";
import { GarmentForm } from "../components/GarmentForm";

import type {
  Garment,
  GarmentFilters as GarmentFiltersType,
} from "../../../types";

import type { GarmentFormData } from "../schemas/garment.schema";

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

export function GarmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const toast = useToast();

  const initialFilters: GarmentFiltersType = {
    page: parsePositiveInteger(searchParams.get("page"), 1),

    limit: parsePositiveInteger(searchParams.get("limit"), 20),

    name: searchParams.get("name") || undefined,

    description: searchParams.get("description") || undefined,

    active:
      (searchParams.get("active") as GarmentFiltersType["active"]) || undefined,
  };

  const [filters, setFilters] = useState<GarmentFiltersType>(initialFilters);

  const [garmentToHandleStatus, setGarmentToHandleStatus] =
    useState<Garment | null>(null);

  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading, isFetching, isError, error } = useGarments(filters);

  const createGarment = useCreateGarment();

  const updateGarment = useUpdateGarment();

  const changeStatus = useUpdateGarmentStatus();

  function updateUrl(nextFilters: GarmentFiltersType) {
    const params = new URLSearchParams();

    if (nextFilters.name) {
      params.set("name", nextFilters.name);
    }

    if (nextFilters.description) {
      params.set("description", nextFilters.description);
    }

    if (nextFilters.active !== undefined) {
      params.set("active", String(nextFilters.active));
    }

    if (nextFilters.page && nextFilters.page > 1) {
      params.set("page", String(nextFilters.page));
    }

    if (nextFilters.limit && nextFilters.limit !== 20) {
      params.set("limit", String(nextFilters.limit));
    }

    setSearchParams(params);
  }

  function handleFiltersChange(nextFilters: GarmentFiltersType) {
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

  function openCreateForm() {
    setSelectedGarment(null);
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditForm(garment: Garment) {
    setSelectedGarment(garment);
    setFormError(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    if (createGarment.isPending || updateGarment.isPending) {
      return;
    }

    setIsFormOpen(false);
    setSelectedGarment(null);
    setFormError(null);
  }

  async function handleSubmit(formData: GarmentFormData) {
    setFormError(null);

    try {
      if (selectedGarment) {
        await updateGarment.mutateAsync({
          id: selectedGarment.id,
          payload: formData,
        });

        toast.success(
          "Prenda actualizada",
          "La prenda se actualizó correctamente.",
        );
      } else {
        await createGarment.mutateAsync(formData);

        toast.success("Prenda creada", "La prenda se creó correctamente.");
      }

      closeForm();
    } catch (error) {
      const message = getApiErrorMessage(error);

      setFormError(message);

      toast.error("No se pudo completar la acción", message);
    }
  }

  async function toggleStatus() {
    if (!garmentToHandleStatus) {
      return;
    }

    const isActive = garmentToHandleStatus.active;

    try {
      await changeStatus.mutateAsync({
        id: garmentToHandleStatus.id,
        active: !isActive,
      });

      toast.success(
        isActive ? "Prenda desactivada" : "Prenda activada",

        `${garmentToHandleStatus.name} fue ${
          isActive ? "desactivada" : "activada"
        } correctamente.`,
      );
    } catch (error) {
      toast.error("No se pudo completar la acción", getApiErrorMessage(error));
    }

    setGarmentToHandleStatus(null);
  }

  const garments = data?.data ?? [];

  const hasFilters =
    Boolean(filters.name) ||
    Boolean(filters.description) ||
    filters.active !== undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prendas</h1>

          <p className="mt-1 text-sm text-slate-500">
            Gestiona las prendas disponibles para tus pedidos.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreateForm}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700"
        >
          + Nueva prenda
        </Button>
      </div>

      <GarmentFilters filters={filters} onChange={handleFiltersChange} />

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {isLoading ? (
          <div className="p-10 text-center text-slate-500">
            Cargando prendas...
          </div>
        ) : isError ? (
          <div className="p-6">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error instanceof Error
                ? error.message
                : "No se pudieron cargar las prendas"}
            </div>
          </div>
        ) : garments.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="font-semibold text-slate-900">
              {hasFilters
                ? "No encontramos prendas"
                : "Todavía no tienes prendas"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {hasFilters
                ? "Prueba cambiando los filtros."
                : "Registra una nueva prenda para comenzar a trabajar con pedidos."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="border-b bg-slate-50">
                  <TableRow>
                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Prenda
                    </TableHead>

                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Descripción
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
                  {garments.map((garment) => (
                    <TableRow key={garment.id} className="hover:bg-slate-50">
                      <TableCell className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {garment.name}
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4 text-sm text-slate-600">
                        {garment.description ?? "-"}
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <span
                          className={
                            garment.active
                              ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                              : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                          }
                        >
                          {garment.active ? "Activa" : "Inactiva"}
                        </span>
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => openEditForm(garment)}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => setGarmentToHandleStatus(garment)}
                            disabled={changeStatus.isPending}
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
                          >
                            {garment.active ? "Desactivar" : "Activar"}
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

        {isFetching && !isLoading && (
          <div className="border-t bg-slate-50 px-5 py-2 text-xs text-slate-500">
            Actualizando resultados...
          </div>
        )}
      </div>

      {garmentToHandleStatus && (
        <ConfirmDialog
          open={garmentToHandleStatus !== null}
          onClose={() => {
            if (!changeStatus.isPending) {
              setGarmentToHandleStatus(null);
            }
          }}
          onConfirm={toggleStatus}
          title={
            garmentToHandleStatus.active
              ? "Desactivar prenda"
              : "Activar prenda"
          }
          description={`¿Estás seguro de que quieres ${
            garmentToHandleStatus.active ? "desactivar" : "activar"
          } ${garmentToHandleStatus.name}?`}
          confirmLabel={garmentToHandleStatus.active ? "Desactivar" : "Activar"}
          cancelLabel="Cancelar"
          danger={garmentToHandleStatus.active}
          loading={changeStatus.isPending}
        />
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {selectedGarment ? "Editar prenda" : "Nueva prenda"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {selectedGarment
                  ? "Actualiza la información de la prenda."
                  : "Registra una nueva prenda en tu organización."}
              </p>
            </div>

            <GarmentForm
              garment={selectedGarment}
              loading={createGarment.isPending || updateGarment.isPending}
              serverError={formError}
              onSubmit={handleSubmit}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}
