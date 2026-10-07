import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  useChangeProductionStatus,
  useCreateOrderProduction,
  useCreateProductionJob,
  useProduction,
  useUpdateProductionJob,
  useAvailableProductionOrders,
} from "../../../hooks/useProduction";

import { useEmployees } from "../../../hooks/useEmployees";
import { useMachines } from "../../../hooks/useMachines";

import type {
  ProductionFilters,
  ProductionJob,
  ProductionJobStatus,
} from "../../../types";

import { ProductionFilters as ProductionFiltersComponent } from "../components/ProductionFilters";
import { ProductionForm } from "../components/ProductionForm";

import {
  getEmployeeName,
  getProductionStatusClass,
  getProductionStatusLabel,
} from "../utils/production.utils";

import {
  Button,
  ConfirmDialog,
  Pagination,
  useToast,
} from "../../../components/ui";

import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function ProductionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  // --- Parámetros de Búsqueda y Filtros ---
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const limit = parsePositiveInt(searchParams.get("limit"), 20);
  const status =
    (searchParams.get("status") as ProductionJobStatus | null) ?? undefined;
  const orderNumberParam = searchParams.get("orderNumber");

  const orderNumber =
    orderNumberParam && Number.isInteger(Number(orderNumberParam))
      ? Number(orderNumberParam)
      : undefined;

  const filters: ProductionFilters = useMemo(
    () => ({ page, limit, status, orderNumber }),
    [page, limit, status, orderNumber],
  );

  // --- React Query Hooks ---
  const productionQuery = useProduction(filters);
  const employeesQuery = useEmployees({
    page: 1,
    limit: 100,
    status: "ACTIVE",
  });
  const machinesQuery = useMachines({ page: 1, limit: 100, status: "ACTIVE" });
  const availableOrdersQuery = useAvailableProductionOrders();

  const createProduction = useCreateProductionJob();
  const createOrderProduction = useCreateOrderProduction();
  const updateProduction = useUpdateProductionJob();
  const changeStatus = useChangeProductionStatus();

  // --- Estados Locales ---
  const [formOpen, setFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<ProductionJob | null>(null);
  const [statusJob, setStatusJob] = useState<ProductionJob | null>(null);
  const [nextStatus, setNextStatus] = useState<ProductionJobStatus | null>(
    null,
  );

  // --- Handlers ---
  const updateFilters = useCallback(
    (next: ProductionFilters) => {
      const params = new URLSearchParams();

      if (next.page && next.page !== 1) params.set("page", String(next.page));
      if (next.limit && next.limit !== 20)
        params.set("limit", String(next.limit));
      if (next.status) params.set("status", next.status);
      if (next.orderNumber) params.set("orderNumber", String(next.orderNumber));

      setSearchParams(params);
    },
    [setSearchParams],
  );

  const jobs = useMemo(
    () => productionQuery.data?.data ?? [],
    [productionQuery.data?.data],
  );

  const stats = useMemo(() => {
    return jobs.reduce(
      (acc, job) => {
        if (job.status === "PENDING") acc.pending++;
        if (job.status === "IN_PROGRESS") acc.inProgress++;
        if (job.status === "PAUSED") acc.paused++;
        if (job.status === "COMPLETED") acc.completed++;
        return acc;
      },
      { pending: 0, inProgress: 0, paused: 0, completed: 0 },
    );
  }, [jobs]);

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingJob(null);
  };

  const openCreate = () => {
    setEditingJob(null);
    setFormOpen(true);
  };

  const openEdit = (job: ProductionJob) => {
    setEditingJob(job);
    setFormOpen(true);
  };

  async function handleCreate(
    payload: Parameters<
      NonNullable<React.ComponentProps<typeof ProductionForm>["onSubmit"]>
    >[0],
  ) {
    try {
      await createProduction.mutateAsync(payload);
      toast.success("Trabajo de producción creado correctamente.");
      handleCloseForm();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function handleSubmitFullOrder(
    orderId: string,
    payload: { machineId?: string; employeeId?: string; notes?: string },
  ) {
    try {
      await createOrderProduction.mutateAsync({ orderId, payload });
      toast.success("La producción del pedido fue creada correctamente.");
      handleCloseForm();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    }
  }

  async function handleUpdate(
    payload: Parameters<
      NonNullable<React.ComponentProps<typeof ProductionForm>["onUpdate"]>
    >[0],
  ) {
    if (!editingJob) return;

    try {
      await updateProduction.mutateAsync({ id: editingJob.id, payload });
      toast.success("Trabajo de producción actualizado.");
      handleCloseForm();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function handleStatusChange() {
    if (!statusJob || !nextStatus) return;

    try {
      await changeStatus.mutateAsync({
        id: statusJob.id,
        payload: { status: nextStatus },
      });

      toast.success(
        `Producción ${getProductionStatusLabel(nextStatus).toLowerCase()} correctamente.`,
      );
      setStatusJob(null);
      setNextStatus(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  const isFormSubmitting =
    createProduction.isPending ||
    createOrderProduction.isPending ||
    updateProduction.isPending;

  // Renderizador reutilizable de las acciones según el estado del trabajo
  const renderActionButtons = (job: ProductionJob, isMobile = false) => {
    const baseBtnClass = isMobile
      ? "flex-1 inline-flex justify-center items-center px-3 py-2 text-xs font-semibold rounded-lg border transition shadow-xs"
      : "inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md transition";

    return (
      <div
        className={`flex flex-wrap items-center gap-1.5 ${isMobile ? "w-full pt-2" : "justify-end"}`}
      >
        {job.status === "PENDING" && (
          <button
            type="button"
            onClick={() => {
              setStatusJob(job);
              setNextStatus("IN_PROGRESS");
            }}
            className={`${baseBtnClass} bg-blue-600 text-white hover:bg-blue-700 border-transparent`}
          >
            Iniciar
          </button>
        )}

        {job.status === "IN_PROGRESS" && (
          <button
            type="button"
            onClick={() => {
              setStatusJob(job);
              setNextStatus("PAUSED");
            }}
            className={`${baseBtnClass} bg-amber-500 text-white hover:bg-amber-600 border-transparent`}
          >
            Pausar
          </button>
        )}

        {job.status === "PAUSED" && (
          <button
            type="button"
            onClick={() => {
              setStatusJob(job);
              setNextStatus("IN_PROGRESS");
            }}
            className={`${baseBtnClass} bg-blue-600 text-white hover:bg-blue-700 border-transparent`}
          >
            Reanudar
          </button>
        )}

        {(job.status === "IN_PROGRESS" || job.status === "PAUSED") && (
          <button
            type="button"
            onClick={() => {
              setStatusJob(job);
              setNextStatus("COMPLETED");
            }}
            className={`${baseBtnClass} bg-emerald-600 text-white hover:bg-emerald-700 border-transparent`}
          >
            Completar
          </button>
        )}

        {job.status !== "COMPLETED" && job.status !== "CANCELLED" && (
          <>
            <button
              type="button"
              onClick={() => openEdit(job)}
              className={`${baseBtnClass} bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200`}
            >
              Editar
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusJob(job);
                setNextStatus("CANCELLED");
              }}
              className={`${baseBtnClass} bg-red-50 text-red-600 hover:bg-red-100 border-red-200`}
            >
              Cancelar
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12 sm:pb-0">
      {/* 1. Encabezado Principal */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Producción
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Gestiona los trabajos de bordado, asignaciones y avance en tiempo
            real.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreate}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nueva producción
        </Button>
      </div>

      {/* 2. KPIs / Métricas Adaptables */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Pendientes</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">
              {stats.pending}
            </p>
          </div>
          <div className="h-2 w-2 rounded-full bg-slate-400 sm:h-3 sm:w-3" />
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3.5 sm:p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-blue-700">En producción</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-blue-700">
              {stats.inProgress}
            </p>
          </div>
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse sm:h-3 sm:w-3" />
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3.5 sm:p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-amber-700">Pausadas</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-amber-700">
              {stats.paused}
            </p>
          </div>
          <div className="h-2 w-2 rounded-full bg-amber-500 sm:h-3 sm:w-3" />
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5 sm:p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-700">Completadas</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-emerald-700">
              {stats.completed}
            </p>
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-500 sm:h-3 sm:w-3" />
        </div>
      </div>

      {/* 3. Filtros */}
      <ProductionFiltersComponent filters={filters} onChange={updateFilters} />

      {/* 4. Lista Principal de Contenidos */}
      <div className="space-y-4">
        {productionQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <span className="mt-3 text-sm text-slate-500 font-medium">
              Cargando producción...
            </span>
          </div>
        ) : productionQuery.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
            Ocurrió un error al cargar la lista de producción. Intenta recargar
            la página.
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              🧵
            </div>
            <p className="mt-3 font-semibold text-slate-900">
              No hay trabajos de producción
            </p>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              No se encontraron registros con los filtros seleccionados o aún no
              has creado una producción.
            </p>
          </div>
        ) : (
          <>
            {/* VISTA MÓVIL (< md): Cards Enriquecidas */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3 transition active:bg-slate-50/50"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          Pedido #{job.order.orderNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {job.order.customer.companyName ||
                          job.order.customer.name}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getProductionStatusClass(
                        job.status,
                      )}`}
                    >
                      {getProductionStatusLabel(job.status)}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {job.orderItem.garment.name}
                      </p>
                      {job.orderItemLogo && (
                        <p className="text-slate-500 text-xs">
                          Logo:{" "}
                          <span className="text-slate-700">
                            {job.orderItemLogo.logoName}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="block text-[10px] uppercase font-semibold text-slate-400">
                          Máquina
                        </span>
                        <span className="font-medium text-slate-800">
                          {job.machine?.name ?? "Sin asignar"}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="block text-[10px] uppercase font-semibold text-slate-400">
                          Responsable
                        </span>
                        <span className="font-medium text-slate-800">
                          {getEmployeeName(job.employee) || "Sin asignar"}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1 text-xs font-medium text-slate-700">
                      <span>Cantidad total:</span>
                      <span className="text-sm font-bold text-slate-900">
                        {job.quantity} un.
                      </span>
                    </div>
                  </div>

                  {/* Acciones de la tarjeta móvil */}
                  <div className="border-t border-slate-100 pt-2">
                    {renderActionButtons(job, true)}
                  </div>
                </div>
              ))}
            </div>

            {/* VISTA ESCRITORIO (>= md): Tabla Clásica */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-3.5">Trabajo</th>
                      <th className="px-5 py-3.5">Pedido</th>
                      <th className="px-5 py-3.5">Máquina</th>
                      <th className="px-5 py-3.5">Responsable</th>
                      <th className="px-5 py-3.5">Cantidad</th>
                      <th className="px-5 py-3.5">Estado</th>
                      <th className="px-5 py-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {jobs.map((job) => (
                      <tr
                        key={job.id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-900">
                            {job.orderItem.garment.name}
                          </p>
                          {job.orderItemLogo && (
                            <p className="text-xs text-slate-500">
                              {job.orderItemLogo.logoName}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="font-semibold text-slate-900">
                            #{job.order.orderNumber}
                          </p>
                          <p className="text-xs text-slate-500">
                            {job.order.customer.companyName ||
                              job.order.customer.name}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                          {job.machine?.name ?? (
                            <span className="text-slate-400 italic">
                              Sin asignar
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                          {getEmployeeName(job.employee) || (
                            <span className="text-slate-400 italic">
                              Sin asignar
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">
                          {job.quantity}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getProductionStatusClass(
                              job.status,
                            )}`}
                          >
                            {getProductionStatusLabel(job.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          {renderActionButtons(job)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginación */}
            {productionQuery.data?.meta && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
                <Pagination
                  page={productionQuery.data.meta.page}
                  limit={productionQuery.data.meta.limit}
                  total={productionQuery.data.meta.total}
                  totalPages={productionQuery.data.meta.totalPages}
                  onPageChange={(nextPage) =>
                    updateFilters({
                      ...filters,
                      page: nextPage,
                    })
                  }
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* 5. Modal de Formulario con Fullscreen para Móviles */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4">
          <div className="max-h-[92vh] sm:max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {editingJob ? "Editar producción" : "Nueva producción"}
                </h2>
                <p className="text-xs text-slate-500">
                  {editingJob
                    ? "Actualiza las asignaciones del trabajo."
                    : "Registra un nuevo trabajo para producción."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseForm}
                disabled={isFormSubmitting}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <ProductionForm
                initialData={editingJob}
                orders={availableOrdersQuery.data ?? []}
                employees={employeesQuery.data?.data ?? []}
                machines={machinesQuery.data?.data ?? []}
                isSubmitting={isFormSubmitting}
                onSubmit={handleCreate}
                onSubmitFullOrder={handleSubmitFullOrder}
                onUpdate={handleUpdate}
                onCancel={handleCloseForm}
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. Diálogo de Confirmación */}
      <ConfirmDialog
        open={Boolean(statusJob && nextStatus)}
        title={
          nextStatus
            ? `Cambiar estado a "${getProductionStatusLabel(nextStatus)}"`
            : "Cambiar estado"
        }
        description={
          statusJob && nextStatus
            ? `¿Estás seguro de cambiar el trabajo del pedido #${statusJob.order.orderNumber} a ${getProductionStatusLabel(
                nextStatus,
              ).toLowerCase()}?`
            : ""
        }
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        loading={changeStatus.isPending}
        onConfirm={handleStatusChange}
        onClose={() => {
          setStatusJob(null);
          setNextStatus(null);
        }}
      />
    </div>
  );
}
