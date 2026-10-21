import { useState } from "react";

import { useEmployees } from "../../../hooks/useEmployees";
import { useMachines } from "../../../hooks/useMachines";
import {
  useChangeProductionStatus,
  useCreateOrderProduction,
  useCreateProductionJob,
  useProduction,
  useUpdateProductionJob,
} from "../../../hooks/useProduction";
import { useAuth } from "../../../auth/AuthContext";
import { ConfirmDialog, Modal, useToast } from "../../../components/ui";
import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";
import type { OrderDetail, ProductionJob, ProductionJobStatus } from "../../../types";
import { ProductionForm } from "../../production/components/ProductionForm";
import { getEmployeeName, getProductionStatusClass, getProductionStatusLabel } from "../../production/utils/production.utils";

function availableTransition(status: ProductionJobStatus): ProductionJobStatus[] {
  if (status === "PENDING") return ["IN_PROGRESS", "CANCELLED"];
  if (status === "IN_PROGRESS") return ["PAUSED", "COMPLETED", "CANCELLED"];
  if (status === "PAUSED") return ["IN_PROGRESS", "CANCELLED"];
  return [];
}

const ACTION_LABEL: Partial<Record<ProductionJobStatus, string>> = {
  IN_PROGRESS: "Iniciar / reanudar",
  PAUSED: "Pausar",
  COMPLETED: "Finalizar",
  CANCELLED: "Cancelar trabajo",
};

export function OrderProductionSection({ order }: { order: OrderDetail }) {
  const toast = useToast();
  const { user } = useAuth();
  const canManage = user?.role === "OWNER" || user?.role === "ADMIN" || user?.role === "MANAGER";
  const [page, setPage] = useState(1);
  const jobsQuery = useProduction({ orderId: order.id, page, limit: 100 });
  const employeesQuery = useEmployees({ page: 1, limit: 100, status: "ACTIVE" });
  const machinesQuery = useMachines({ page: 1, limit: 100, status: "ACTIVE" });
  const createJob = useCreateProductionJob();
  const createOrderJobs = useCreateOrderProduction();
  const updateJob = useUpdateProductionJob();
  const changeStatus = useChangeProductionStatus();
  const [formJob, setFormJob] = useState<ProductionJob | null | undefined>(undefined);
  const [statusTarget, setStatusTarget] = useState<{ job: ProductionJob; status: ProductionJobStatus } | null>(null);

  const jobs = jobsQuery.data?.data ?? [];
  const productionOrder = {
    id: order.id,
    orderNumber: order.orderNumber,
    promisedAt: order.promisedAt,
    customer: { id: order.customer.id, name: order.customer.name, companyName: order.customer.companyName },
  };

  async function submitJob(payload: Parameters<React.ComponentProps<typeof ProductionForm>["onSubmit"]>[0]) {
    try {
      await createJob.mutateAsync(payload);
      toast.success("Trabajo agregado a producción.");
      setPage(1);
      setFormJob(undefined);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function submitFullOrder(orderId: string, payload: { machineId?: string; employeeId?: string; notes?: string }) {
    try {
      const result = await createOrderJobs.mutateAsync({ orderId, payload });
      toast.success(`Se crearon ${result.createdCount} trabajos de producción.`);
      setPage(1);
      setFormJob(undefined);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    }
  }

  async function updateProductionJob(payload: Parameters<NonNullable<React.ComponentProps<typeof ProductionForm>["onUpdate"]>>[0]) {
    if (!formJob) return;
    try {
      await updateJob.mutateAsync({ id: formJob.id, payload });
      toast.success("Asignación del trabajo actualizada.");
      setFormJob(undefined);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function confirmStatusChange() {
    if (!statusTarget) return;
    try {
      await changeStatus.mutateAsync({ id: statusTarget.job.id, payload: { status: statusTarget.status } });
      toast.success(`Trabajo ${getProductionStatusLabel(statusTarget.status).toLowerCase()}.`);
      setStatusTarget(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Producción del pedido</h2>
          <p className="mt-1 text-sm text-slate-500">Asigna, actualiza y sigue los trabajos sin salir de esta ficha.</p>
        </div>
        {canManage && order.status !== "QUOTE" && order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
          <button type="button" onClick={() => setFormJob(null)} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">+ Agregar trabajo</button>
        )}
      </div>

      {jobsQuery.isLoading ? <p className="mt-5 text-sm text-slate-500">Cargando trabajos...</p> : jobsQuery.isError ? (
        <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">No se pudo cargar la producción de este pedido.</p>
      ) : jobs.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
          <p className="font-medium text-slate-800">Aún no hay trabajos de producción</p>
          <p className="mt-1 text-sm text-slate-500">Cuando el pedido esté aceptado, puedes crear todos los trabajos pendientes o asignarlos uno por uno.</p>
          {canManage && order.status !== "QUOTE" && order.status !== "CANCELLED" && order.status !== "DELIVERED" && <button type="button" onClick={() => setFormJob(null)} className="mt-3 text-sm font-semibold text-indigo-700 hover:text-indigo-900">Crear producción ahora</button>}
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {jobs.map((job) => (
            <article key={job.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{job.orderItem.garment.name}{job.orderItemLogo ? ` · ${job.orderItemLogo.logoName}` : ""}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getProductionStatusClass(job.status)}`}>{getProductionStatusLabel(job.status)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{job.quantity} unidades{job.orderItem.size ? ` · Talla ${job.orderItem.size}` : ""}{job.orderItem.color ? ` · ${job.orderItem.color}` : ""}{job.orderItemLogo?.placement ? ` · ${job.orderItemLogo.placement}` : ""}</p>
                  <p className="mt-1 text-xs text-slate-500">Máquina: {job.machine?.name ?? "Sin asignar"} · Bordador: {getEmployeeName(job.employee) || "Sin asignar"}</p>
                  {(job.notes || job.orderItem.notes) && <p className="mt-2 whitespace-pre-wrap text-xs text-slate-600">{job.notes || job.orderItem.notes}</p>}
                </div>
                {canManage && <div className="flex flex-wrap gap-2">
                  {job.status !== "COMPLETED" && job.status !== "CANCELLED" && <button type="button" onClick={() => setFormJob(job)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Asignar / editar</button>}
                  {availableTransition(job.status).map((nextStatus) => <button key={nextStatus} type="button" onClick={() => setStatusTarget({ job, status: nextStatus })} className={`rounded-lg px-3 py-2 text-xs font-semibold ${nextStatus === "CANCELLED" ? "border border-red-200 text-red-700 hover:bg-red-50" : "border border-indigo-200 text-indigo-700 hover:bg-indigo-50"}`}>{ACTION_LABEL[nextStatus]}</button>)}
                </div>}
              </div>
            </article>
          ))}
          {(jobsQuery.data?.meta.totalPages ?? 0) > 1 && <div className="flex items-center justify-between border-t border-slate-100 pt-3"><p className="text-xs text-slate-500">Página {jobsQuery.data?.meta.page} de {jobsQuery.data?.meta.totalPages} · {jobsQuery.data?.meta.total} trabajos</p><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold disabled:opacity-40">Anteriores</button><button type="button" disabled={page >= (jobsQuery.data?.meta.totalPages ?? 1)} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold disabled:opacity-40">Siguientes</button></div></div>}
        </div>
      )}

      <Modal open={formJob !== undefined} onClose={() => setFormJob(undefined)} title={formJob ? "Editar trabajo de producción" : "Agregar producción al pedido"} size="lg">
        <ProductionForm
          initialData={formJob ?? null}
          orders={[productionOrder]}
          employees={employeesQuery.data?.data ?? []}
          machines={machinesQuery.data?.data ?? []}
          isSubmitting={createJob.isPending || createOrderJobs.isPending || updateJob.isPending}
          onSubmit={submitJob}
          onSubmitFullOrder={submitFullOrder}
          onUpdate={updateProductionJob}
          onCancel={() => setFormJob(undefined)}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        onConfirm={confirmStatusChange}
        title={statusTarget?.status === "CANCELLED" ? "¿Cancelar este trabajo?" : `¿${ACTION_LABEL[statusTarget?.status ?? "IN_PROGRESS"]}?`}
        description={statusTarget?.status === "CANCELLED" ? "El trabajo dejará de reservar unidades para producción." : `Se cambiará el estado a ${statusTarget ? getProductionStatusLabel(statusTarget.status).toLowerCase() : ""}.`}
        confirmLabel={statusTarget?.status === "CANCELLED" ? "Cancelar trabajo" : "Confirmar"}
        danger={statusTarget?.status === "CANCELLED"}
        loading={changeStatus.isPending}
      />
    </section>
  );
}
