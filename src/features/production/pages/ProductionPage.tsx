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

  const page = parsePositiveInt(searchParams.get("page"), 1);

  const limit = parsePositiveInt(searchParams.get("limit"), 20);

  const status =
    (searchParams.get("status") as ProductionJobStatus | null) ?? undefined;

  const orderNumberParam = searchParams.get("orderNumber");

  const orderNumber =
    orderNumberParam && Number.isInteger(Number(orderNumberParam))
      ? Number(orderNumberParam)
      : undefined;

  const filters: ProductionFilters = {
    page,
    limit,
    status,
    orderNumber,
  };

  const productionQuery = useProduction(filters);

  const employeesQuery = useEmployees({
    page: 1,
    limit: 100,
    status: "ACTIVE",
  });

  const machinesQuery = useMachines({
    page: 1,
    limit: 100,
    status: "ACTIVE",
  });

  const availableOrdersQuery = useAvailableProductionOrders();

  const createProduction = useCreateProductionJob();

  const createOrderProduction = useCreateOrderProduction();

  const updateProduction = useUpdateProductionJob();

  const changeStatus = useChangeProductionStatus();

  const [formOpen, setFormOpen] = useState(false);

  const [editingJob, setEditingJob] = useState<ProductionJob | null>(null);

  const [statusJob, setStatusJob] = useState<ProductionJob | null>(null);

  const [nextStatus, setNextStatus] = useState<ProductionJobStatus | null>(
    null,
  );

  const updateFilters = useCallback(
    (next: ProductionFilters) => {
      const params = new URLSearchParams();

      if (next.page && next.page !== 1) {
        params.set("page", String(next.page));
      }

      if (next.limit && next.limit !== 20) {
        params.set("limit", String(next.limit));
      }

      if (next.status) {
        params.set("status", next.status);
      }

      if (next.orderNumber) {
        params.set("orderNumber", String(next.orderNumber));
      }

      setSearchParams(params);
    },
    [setSearchParams],
  );

  const jobs = useMemo(
    () => productionQuery.data?.data ?? [],
    [productionQuery.data?.data],
  );

  const stats = useMemo(() => {
    return {
      pending: jobs.filter((job) => job.status === "PENDING").length,

      inProgress: jobs.filter((job) => job.status === "IN_PROGRESS").length,

      paused: jobs.filter((job) => job.status === "PAUSED").length,

      completed: jobs.filter((job) => job.status === "COMPLETED").length,
    };
  }, [jobs]);

  function openCreate() {
    setEditingJob(null);
    setFormOpen(true);
  }

  function openEdit(job: ProductionJob) {
    setEditingJob(job);
    setFormOpen(true);
  }

  async function handleCreate(
    payload: Parameters<
      NonNullable<React.ComponentProps<typeof ProductionForm>["onSubmit"]>
    >[0],
  ) {
    try {
      await createProduction.mutateAsync(payload);

      toast.success("Trabajo de producción creado correctamente.");

      setFormOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function handleSubmitFullOrder(
    orderId: string,
    payload: {
      machineId?: string;
      employeeId?: string;
      notes?: string;
    },
  ) {
    try {
      await createOrderProduction.mutateAsync({
        orderId,
        payload,
      });

      toast.success("La producción del pedido fue creada correctamente.");

      setFormOpen(false);
      setEditingJob(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));

      /*
       * Importantísimo:
       * relanzamos el error para que
       * ProductionForm no continúe
       * como si todo hubiese salido bien.
       */
      throw error;
    }
  }

  async function handleUpdate(
    payload: Parameters<
      NonNullable<React.ComponentProps<typeof ProductionForm>["onUpdate"]>
    >[0],
  ) {
    if (!editingJob) {
      return;
    }

    try {
      await updateProduction.mutateAsync({
        id: editingJob.id,
        payload,
      });

      toast.success("Trabajo de producción actualizado.");

      setFormOpen(false);
      setEditingJob(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function handleStatusChange() {
    if (!statusJob || !nextStatus) {
      return;
    }

    try {
      await changeStatus.mutateAsync({
        id: statusJob.id,
        payload: {
          status: nextStatus,
        },
      });

      toast.success(
        `Producción ${getProductionStatusLabel(
          nextStatus,
        ).toLowerCase()} correctamente.`,
      );

      setStatusJob(null);
      setNextStatus(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  function requestStatusChange(
    job: ProductionJob,
    status: ProductionJobStatus,
  ) {
    setStatusJob(job);
    setNextStatus(status);
  }

  const isFormSubmitting =
    createProduction.isPending ||
    createOrderProduction.isPending ||
    updateProduction.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Producción</h1>

          <p className="mt-1 text-sm text-slate-500">
            Gestiona los trabajos de bordado, asignaciones y avance de
            producción.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700"
        >
          + Nueva producción
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Pendientes</p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {stats.pending}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">En producción</p>

          <p className="mt-1 text-2xl font-bold text-blue-600">
            {stats.inProgress}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Pausadas</p>

          <p className="mt-1 text-2xl font-bold text-orange-600">
            {stats.paused}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Completadas</p>

          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {stats.completed}
          </p>
        </div>
      </div>

      <ProductionFiltersComponent filters={filters} onChange={updateFilters} />

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {productionQuery.isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Cargando producción...
          </div>
        ) : productionQuery.isError ? (
          <div className="p-8 text-center text-sm text-red-600">
            No fue posible cargar la producción.
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-slate-900">
              No hay trabajos de producción
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Crea el primer trabajo para comenzar a gestionar la producción.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Trabajo
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Pedido
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Máquina
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Responsable
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Cantidad
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Estado
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {jobs.map((job) => (
                    <tr key={job.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-slate-900">
                            {job.orderItem.garment.name}
                          </p>

                          {job.orderItemLogo && (
                            <p className="mt-0.5 text-xs text-slate-500">
                              {job.orderItemLogo.logoName}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">
                          #{job.order.orderNumber}
                        </p>

                        <p className="text-xs text-slate-500">
                          {job.order.customer.companyName ||
                            job.order.customer.name}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {job.machine?.name ?? "Sin asignar"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {getEmployeeName(job.employee)}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-900">
                        {job.quantity}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getProductionStatusClass(
                            job.status,
                          )}`}
                        >
                          {getProductionStatusLabel(job.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {job.status === "PENDING" && (
                            <button
                              type="button"
                              onClick={() =>
                                requestStatusChange(job, "IN_PROGRESS")
                              }
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                            >
                              Iniciar
                            </button>
                          )}

                          {job.status === "IN_PROGRESS" && (
                            <button
                              type="button"
                              onClick={() => requestStatusChange(job, "PAUSED")}
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-50"
                            >
                              Pausar
                            </button>
                          )}

                          {job.status === "PAUSED" && (
                            <button
                              type="button"
                              onClick={() =>
                                requestStatusChange(job, "IN_PROGRESS")
                              }
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                            >
                              Continuar
                            </button>
                          )}

                          {(job.status === "IN_PROGRESS" ||
                            job.status === "PAUSED") && (
                            <button
                              type="button"
                              onClick={() =>
                                requestStatusChange(job, "COMPLETED")
                              }
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                            >
                              Completar
                            </button>
                          )}

                          {(job.status === "PENDING" ||
                            job.status === "IN_PROGRESS" ||
                            job.status === "PAUSED") && (
                            <button
                              type="button"
                              onClick={() =>
                                requestStatusChange(job, "CANCELLED")
                              }
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Cancelar
                            </button>
                          )}

                          {job.status !== "COMPLETED" &&
                            job.status !== "CANCELLED" && (
                              <button
                                type="button"
                                onClick={() => openEdit(job)}
                                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                              >
                                Editar
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {productionQuery.data?.meta && (
              <div className="border-t border-slate-200 p-4">
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

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingJob ? "Editar producción" : "Nueva producción"}
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  {editingJob
                    ? "Actualiza las asignaciones y datos del trabajo."
                    : "Registra un nuevo trabajo para producción."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormOpen(false);
                  setEditingJob(null);
                }}
                disabled={isFormSubmitting}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="p-5">
              <ProductionForm
                initialData={editingJob}
                orders={availableOrdersQuery.data ?? []}
                employees={employeesQuery.data?.data ?? []}
                machines={machinesQuery.data?.data ?? []}
                isSubmitting={isFormSubmitting}
                onSubmit={handleCreate}
                onSubmitFullOrder={handleSubmitFullOrder}
                onUpdate={handleUpdate}
                onCancel={() => {
                  setFormOpen(false);
                  setEditingJob(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(statusJob && nextStatus)}
        title={
          nextStatus
            ? `Cambiar a ${getProductionStatusLabel(nextStatus)}`
            : "Cambiar estado"
        }
        description={
          statusJob && nextStatus
            ? `¿Quieres cambiar el trabajo del pedido #${statusJob.order.orderNumber} a ${getProductionStatusLabel(
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
