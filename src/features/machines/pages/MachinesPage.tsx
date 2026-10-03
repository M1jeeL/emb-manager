 import { useState } from "react";
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
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getMachineTypeLabel(type: Machine["type"]) {
  switch (type) {
    case "EMBROIDERY":
      return "Bordado";

    case "MULTIHEAD":
      return "Multi-cabezal";

    case "SINGLEHEAD":
      return "Un cabezal";

    case "OTHER":
      return "Otro";

    default:
      return type;
  }
}

function getMachineStatusLabel(status: MachineStatus) {
  switch (status) {
    case "ACTIVE":
      return "Activa";

    case "MAINTENANCE":
      return "Mantenimiento";

    case "INACTIVE":
      return "Inactiva";

    default:
      return status;
  }
}

function getMachineStatusClass(status: MachineStatus) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-700";

    case "MAINTENANCE":
      return "bg-amber-100 text-amber-700";

    case "INACTIVE":
      return "bg-slate-100 text-slate-600";

    default:
      return "bg-slate-100 text-slate-600";
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

  const updateFilters = (nextFilters: MachineFiltersType) => {
    setFilters(nextFilters);

    const params = new URLSearchParams();

    if (nextFilters.page && nextFilters.page !== 1) {
      params.set("page", String(nextFilters.page));
    }

    if (nextFilters.limit && nextFilters.limit !== 20) {
      params.set("limit", String(nextFilters.limit));
    }

    if (nextFilters.name) {
      params.set("name", nextFilters.name);
    }

    if (nextFilters.code) {
      params.set("code", nextFilters.code);
    }

    if (nextFilters.type) {
      params.set("type", nextFilters.type);
    }

    if (nextFilters.status) {
      params.set("status", nextFilters.status);
    }

    if (nextFilters.brand) {
      params.set("brand", nextFilters.brand);
    }

    if (nextFilters.model) {
      params.set("model", nextFilters.model);
    }

    if (nextFilters.serialNumber) {
      params.set("serialNumber", nextFilters.serialNumber);
    }

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
    if (createMachine.isPending || updateMachine.isPending) {
      return;
    }

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
    if (!machineToHandleStatus) {
      return;
    }

    const machine = machineToHandleStatus;

    const nextStatus: MachineStatus =
      machine.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await changeMachineStatus.mutateAsync({
        id: machine.id,
        payload: {
          status: nextStatus,
        },
      });

      toast.success(
        nextStatus === "ACTIVE"
          ? "Máquina activada correctamente"
          : "Máquina desactivada correctamente",
      );

      setMachineToHandleStatus(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Máquinas</h1>

          <p className="mt-1 text-sm text-slate-500">
            Administra las máquinas disponibles para la producción del taller.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreateForm}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700"
        >
          + Nueva máquina
        </Button>
      </div>

      <MachineFilters filters={filters} onChange={updateFilters} />

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {isLoading ? (
          <div className="p-10 text-center text-slate-500">
            Cargando máquinas...
          </div>
        ) : isError ? (
          <div className="p-6">
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              {error instanceof Error
                ? error.message
                : "No se pudieron cargar las máquinas"}
            </div>
          </div>
        ) : machines.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="font-semibold text-slate-900">
              No encontramos máquinas
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Prueba cambiando los filtros o registra una nueva máquina.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="border-b bg-slate-50">
                  <TableRow>
                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Máquina
                    </TableHead>

                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Tipo
                    </TableHead>

                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Fabricante
                    </TableHead>

                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Configuración
                    </TableHead>

                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Producciones
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
                  {machines.map((machine) => (
                    <TableRow key={machine.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">
                            {machine.name}
                          </p>

                          {machine.code && (
                            <p className="text-xs text-slate-500">
                              {machine.code}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm text-slate-700">
                          {getMachineTypeLabel(machine.type)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="text-sm text-slate-700">
                            {machine.brand || "—"}
                          </p>

                          {machine.model && (
                            <p className="text-xs text-slate-500">
                              {machine.model}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm text-slate-700">
                          {machine.needleCount
                            ? `${machine.needleCount} agujas`
                            : "—"}

                          {machine.headCount && (
                            <span className="text-slate-500">
                              {" "}
                              · {machine.headCount} cabezal(es)
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm text-slate-700">
                          {machine._count.productionJobs}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getMachineStatusClass(
                            machine.status,
                          )}`}
                        >
                          {getMachineStatusLabel(machine.status)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(machine)}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            Editar
                          </button>

                          {machine.status === "MAINTENANCE" ? (
                            <button
                              type="button"
                              onClick={() =>
                                toast.info(
                                  "La máquina está en mantenimiento. Para activarla, cambia su estado desde edición o cuando finalice el mantenimiento.",
                                )
                              }
                              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
                            >
                              En mantenimiento
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setMachineToHandleStatus(machine)}
                              className="text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
                            >
                              {machine.status === "ACTIVE"
                                ? "Desactivar"
                                : "Activar"}
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {data?.meta && (
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
            )}
          </>
        )}

        {isFetching && !isLoading && (
          <div className="border-t border-slate-100 px-6 py-2 text-right text-xs text-slate-400">
            Actualizando...
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-lg font-semibold text-slate-900">
                {selectedMachine ? "Editar máquina" : "Nueva máquina"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {selectedMachine
                  ? "Actualiza la información de la máquina."
                  : "Registra una nueva máquina del taller."}
              </p>
            </div>

            <div className="p-6">
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

      <ConfirmDialog
        open={Boolean(machineToHandleStatus)}
        title={
          machineToHandleStatus?.status === "ACTIVE"
            ? "Desactivar máquina"
            : "Activar máquina"
        }
        description={
          machineToHandleStatus?.status === "ACTIVE"
            ? `¿Seguro que quieres desactivar "${machineToHandleStatus?.name}"?`
            : `¿Seguro que quieres activar "${machineToHandleStatus?.name}"?`
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
