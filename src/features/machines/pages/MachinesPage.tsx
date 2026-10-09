import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import {
  useChangeMachineStatus,
  useCreateMachine,
  useMachines,
  useUpdateMachine,
} from "../../../hooks/useMachines";

import { MachineFilters } from "../components/MachineFilters";
import { MachineForm } from "../components/MachineForm";

import type {
  Machine,
  MachineFilters as MachineFiltersType,
  MachineStatus,
} from "../../../types";

import type { MachineFormData } from "../schemas/machine.schema";

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
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getMachineTypeLabel(type: Machine["type"]) {
  switch (type) {
    case "EMBROIDERY":
      return "Bordadora estándar";
    case "MULTIHEAD":
      return "Multicabezal";
    case "SINGLEHEAD":
      return "Monocabezal (1 Cbz)";
    case "OTHER":
      return "Otra / Auxiliar";
    default:
      return type;
  }
}

function getMachineStatusLabel(status: MachineStatus) {
  switch (status) {
    case "ACTIVE":
      return "Operativa";
    case "MAINTENANCE":
      return "Mantenimiento";
    case "INACTIVE":
      return "Fuera de servicio";
    default:
      return status;
  }
}

function getMachineStatusClass(status: MachineStatus) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
    case "MAINTENANCE":
      return "bg-amber-50 text-amber-700 border-amber-200/80";
    case "INACTIVE":
      return "bg-slate-100 text-slate-600 border-slate-200/80";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200/80";
  }
}

export function MachinesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [machineToHandleStatus, setMachineToHandleStatus] =
    useState<Machine | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const initialFilters: MachineFiltersType = {
    page: parsePositiveInteger(searchParams.get("page"), 1),
    limit: parsePositiveInteger(searchParams.get("limit"), 20),
    name: searchParams.get("name") || undefined,
    code: searchParams.get("code") || undefined,
    type: (searchParams.get("type") as MachineFiltersType["type"]) || undefined,
    status:
      (searchParams.get("status") as MachineFiltersType["status"]) || undefined,
    brand: searchParams.get("brand") || undefined,
    model: searchParams.get("model") || undefined,
    serialNumber: searchParams.get("serialNumber") || undefined,
  };

  const [filters, setFilters] = useState<MachineFiltersType>(initialFilters);

  const { data, isLoading, isFetching, isError, error } = useMachines(filters);
  const createMachine = useCreateMachine();
  const updateMachine = useUpdateMachine();
  const changeMachineStatus = useChangeMachineStatus();

  const machines = data?.data ?? [];

  // --- Métricas / KPIs Operativos del Taller ---
  const kpis = useMemo(() => {
    return machines.reduce(
      (acc, m) => {
        if (m.status === "ACTIVE") {
          acc.activeCount++;
          acc.activeHeads += m.headCount || 1;
        } else if (m.status === "MAINTENANCE") {
          acc.maintenanceCount++;
        } else {
          acc.inactiveCount++;
        }
        return acc;
      },
      { activeCount: 0, activeHeads: 0, maintenanceCount: 0, inactiveCount: 0 }
    );
  }, [machines]);

  const updateFilters = (nextFilters: MachineFiltersType) => {
    setFilters(nextFilters);

    const params = new URLSearchParams();
    if (nextFilters.page && nextFilters.page !== 1) {
      params.set("page", String(nextFilters.page));
    }
    if (nextFilters.limit && nextFilters.limit !== 20) {
      params.set("limit", String(nextFilters.limit));
    }
    if (nextFilters.name) params.set("name", nextFilters.name);
    if (nextFilters.code) params.set("code", nextFilters.code);
    if (nextFilters.type) params.set("type", nextFilters.type);
    if (nextFilters.status) params.set("status", nextFilters.status);
    if (nextFilters.brand) params.set("brand", nextFilters.brand);
    if (nextFilters.model) params.set("model", nextFilters.model);
    if (nextFilters.serialNumber) params.set("serialNumber", nextFilters.serialNumber);

    setSearchParams(params);
  };

  const openCreateForm = () => {
    setSelectedMachine(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (machine: Machine) => {
    setSelectedMachine(machine);
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (createMachine.isPending || updateMachine.isPending) return;
    setIsFormOpen(false);
    setSelectedMachine(null);
    setFormError(null);
  };

  const handleSubmit = async (formData: MachineFormData) => {
    setFormError(null);
    try {
      if (selectedMachine) {
        await updateMachine.mutateAsync({
          id: selectedMachine.id,
          payload: {
            ...formData,
            needleCount: formData.needleCount ?? undefined,
            headCount: formData.headCount ?? undefined,
          },
        });
        toast.success("Máquina actualizada correctamente");
      } else {
        await createMachine.mutateAsync({
          ...formData,
          needleCount: formData.needleCount ?? undefined,
          headCount: formData.headCount ?? undefined,
        });
        toast.success("Máquina creada correctamente");
      }
      closeForm();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  const confirmStatusChange = async () => {
    if (!machineToHandleStatus) return;

    const machine = machineToHandleStatus;
    const nextStatus: MachineStatus =
      machine.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await changeMachineStatus.mutateAsync({
        id: machine.id,
        payload: { status: nextStatus },
      });

      toast.success(
        nextStatus === "ACTIVE"
          ? "Máquina activada correctamente"
          : "Máquina desactivada correctamente"
      );
      setMachineToHandleStatus(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6 pb-12 sm:pb-0">
      {/* 1. Encabezado Principal */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl flex items-center gap-2">
            <span>⚙️</span> Máquinas de Bordado
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Gestiona el parque de máquinas, configuración de cabezales y estado técnico.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreateForm}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-indigo-700 active:scale-[0.98]"
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
          Nueva máquina
        </Button>
      </div>

      {/* 2. KPIs de Capacidad del Taller */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Máquinas</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">
              {machines.length}
            </p>
          </div>
          <div className="h-3 w-3 rounded-full bg-slate-300" />
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5 sm:p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Operativas</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-emerald-700">
              {kpis.activeCount}
            </p>
          </div>
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600" />
          </div>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 sm:p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Capacidad Cabezales</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-indigo-700">
              {kpis.activeHeads} <span className="text-xs font-medium text-indigo-500">cbz</span>
            </p>
          </div>
          <div className="h-3 w-3 rounded-full bg-indigo-500" />
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3.5 sm:p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Mantenimiento</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-amber-700">
              {kpis.maintenanceCount}
            </p>
          </div>
          <div className="h-3 w-3 rounded-full bg-amber-500" />
        </div>
      </div>

      {/* 3. Filtros */}
      <MachineFilters filters={filters} onChange={updateFilters} />

      {/* 4. Lista Principal */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <span className="mt-3 text-sm text-slate-500 font-medium">
              Cargando parque de máquinas...
            </span>
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
            {error instanceof Error
              ? error.message
              : "No se pudieron cargar las máquinas."}
          </div>
        ) : machines.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-xl">
              ⚙️
            </div>
            <p className="mt-3 font-semibold text-slate-900">
              No se encontraron máquinas
            </p>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              Ajusta los criterios de búsqueda o añade una nueva máquina al taller.
            </p>
          </div>
        ) : (
          <>
            {/* VISTA MÓVIL (< md): Cards Enriquecidas */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {machines.map((machine) => (
                <div
                  key={machine.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
                >
                  {/* Encabezado: Nombre, Código y Estado */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {machine.name}
                        </span>
                        {machine.code && (
                          <span className="bg-slate-100 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded">
                            {machine.code}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {getMachineTypeLabel(machine.type)}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getMachineStatusClass(
                        machine.status
                      )}`}
                    >
                      {getMachineStatusLabel(machine.status)}
                    </span>
                  </div>

                  {/* Configuración Técnica (Cabezales / Agujas) */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">
                        Capacidad / Cbz
                      </span>
                      <span className="font-bold text-indigo-700">
                        {machine.headCount ? `${machine.headCount} Cabezal(es)` : "1 Cabezal"}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">
                        Agujas / Colores
                      </span>
                      <span className="font-semibold text-slate-800">
                        {machine.needleCount ? `${machine.needleCount} agujas` : "Sin definir"}
                      </span>
                    </div>
                  </div>

                  {/* Detalles Fabricante & Trabajos */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>
                      {machine.brand ? `${machine.brand} ${machine.model || ""}` : "Marca no especificada"}
                    </span>
                    <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      📋 {machine._count?.productionJobs ?? 0} trabajos
                    </span>
                  </div>

                  {machine.notes && (
                    <p className="text-xs text-amber-800 bg-amber-50/60 p-2 rounded-lg border border-amber-100 italic">
                      📝 {machine.notes}
                    </p>
                  )}

                  {/* Acciones */}
                  <div className="border-t border-slate-100 pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(machine)}
                      className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                    >
                      Editar
                    </button>

                    {machine.status === "MAINTENANCE" ? (
                      <button
                        type="button"
                        onClick={() =>
                          toast.info(
                            "La máquina está en mantenimiento. Cambia su estado en edición para habilitarla."
                          )
                        }
                        className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 transition"
                      >
                        En revisión
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setMachineToHandleStatus(machine)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                          machine.status === "ACTIVE"
                            ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        }`}
                      >
                        {machine.status === "ACTIVE" ? "Desactivar" : "Activar"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* VISTA ESCRITORIO (>= md): Tabla Clásica y Limpia */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-slate-50/80">
                    <TableRow>
                      <TableHead className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Máquina
                      </TableHead>
                      <TableHead className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Tipo
                      </TableHead>
                      <TableHead className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Capacidad Taller
                      </TableHead>
                      <TableHead className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Fabricante / Serie
                      </TableHead>
                      <TableHead className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Trabajos
                      </TableHead>
                      <TableHead className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Estado
                      </TableHead>
                      <TableHead className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-slate-100">
                    {machines.map((machine) => (
                      <TableRow key={machine.id} className="transition hover:bg-slate-50/80">
                        {/* Máquina */}
                        <TableCell className="px-5 py-4">
                          <p className="font-bold text-slate-900">
                            {machine.name}
                          </p>
                          {machine.code ? (
                            <span className="text-xs text-slate-500 font-mono">
                              {machine.code}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Sin código</span>
                          )}
                          {machine.notes && (
                            <p className="text-[11px] text-amber-700 italic truncate max-w-[180px] mt-0.5" title={machine.notes}>
                              📝 {machine.notes}
                            </p>
                          )}
                        </TableCell>

                        {/* Tipo */}
                        <TableCell className="px-5 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-700">
                            {getMachineTypeLabel(machine.type)}
                          </span>
                        </TableCell>

                        {/* Configuración Taller (Cabezales/Agujas) */}
                        <TableCell className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs border border-indigo-100">
                              {machine.headCount ?? 1} cabezal(es)
                            </span>
                            {machine.needleCount && (
                              <span className="text-xs text-slate-500 font-medium">
                                · {machine.needleCount} agujas
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Fabricante */}
                        <TableCell className="px-5 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-slate-800">
                            {machine.brand || "—"}
                          </p>
                          {machine.model && (
                            <p className="text-xs text-slate-400">
                              Mod: {machine.model}
                            </p>
                          )}
                        </TableCell>

                        {/* Trabajos de Producción */}
                        <TableCell className="px-5 py-4 text-center whitespace-nowrap">
                          <span className="bg-slate-100 font-bold text-slate-700 px-2 py-1 rounded text-xs">
                            {machine._count?.productionJobs ?? 0}
                          </span>
                        </TableCell>

                        {/* Estado */}
                        <TableCell className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getMachineStatusClass(
                              machine.status
                            )}`}
                          >
                            {getMachineStatusLabel(machine.status)}
                          </span>
                        </TableCell>

                        {/* Acciones */}
                        <TableCell className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex justify-end items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditForm(machine)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                            >
                              Editar
                            </button>

                            {machine.status === "MAINTENANCE" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  toast.info(
                                    "Máquina en mantenimiento. Cambia su estado en la edición para reactivarla."
                                  )
                                }
                                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-50 text-amber-700 border border-amber-200"
                              >
                                En revisión
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setMachineToHandleStatus(machine)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                                  machine.status === "ACTIVE"
                                    ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100"
                                }`}
                              >
                                {machine.status === "ACTIVE" ? "Desactivar" : "Activar"}
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Paginación */}
            {data?.meta && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
                <Pagination
                  limit={data.meta.limit}
                  total={data.meta.total}
                  page={data.meta.page}
                  totalPages={data.meta.totalPages}
                  onPageChange={(page) =>
                    updateFilters({
                      ...filters,
                      page,
                    })
                  }
                />
              </div>
            )}
          </>
        )}

        {isFetching && !isLoading && (
          <div className="text-right text-xs text-slate-400 pr-2">
            Actualizando datos...
          </div>
        )}
      </div>

      {/* 5. Modal de Formulario con Diseño Ajustado */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4 backdrop-blur-xs">
          <div className="max-h-[92vh] sm:max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-xs">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {selectedMachine ? "Editar máquina" : "Nueva máquina"}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedMachine
                    ? "Actualiza la configuración y parámetros técnicos de la máquina."
                    : "Registra una nueva máquina de bordar en la base de datos."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={createMachine.isPending || updateMachine.isPending}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <MachineForm
                machine={selectedMachine}
                onSubmit={handleSubmit}
                onCancel={closeForm}
                isSubmitting={
                  createMachine.isPending || updateMachine.isPending
                }
                formError={formError}
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. Diálogo de Confirmación */}
      <ConfirmDialog
        open={Boolean(machineToHandleStatus)}
        title={
          machineToHandleStatus?.status === "ACTIVE"
            ? "Desactivar máquina"
            : "Activar máquina"
        }
        description={
          machineToHandleStatus?.status === "ACTIVE"
            ? `¿Estás seguro de desactivar la máquina "${machineToHandleStatus?.name}"? No estará disponible para nuevas asignaciones de producción.`
            : `¿Estás seguro de activar la máquina "${machineToHandleStatus?.name}"?`
        }
        confirmLabel={
          machineToHandleStatus?.status === "ACTIVE" ? "Desactivar" : "Activar"
        }
        onConfirm={confirmStatusChange}
        onClose={() => setMachineToHandleStatus(null)}
        loading={changeMachineStatus.isPending}
      />
    </div>
  );
}