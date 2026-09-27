import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  useChangeEmployeeStatus,
  useCreateEmployee,
  useEmployees,
  useUpdateEmployee,
} from "../../../hooks/useEmployees";

import type {
  Employee,
  EmployeeFilters as EmployeeFiltersType,
} from "../../../types";

import {
  Button,
  ConfirmDialog,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from "../../../components/ui";

import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";

import { EmployeeFilters } from "../components/EmployeeFilters";
import { EmployeeForm } from "../components/EmployeeForm";

import type { EmployeeFormData } from "../schemas/employee.schema";

function parsePositiveInteger(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function EmployeesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const toast = useToast();

  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  const [employeeToHandleStatus, setEmployeeToHandleStatus] =
    useState<Employee | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  const initialFilters: EmployeeFiltersType = {
    page: parsePositiveInteger(searchParams.get("page"), 1),

    limit: parsePositiveInteger(searchParams.get("limit"), 20),

    name: searchParams.get("name") || undefined,
    email: searchParams.get("email") || undefined,
    phone: searchParams.get("phone") || undefined,
    position: searchParams.get("position") || undefined,

    status:
      (searchParams.get("status") as EmployeeFiltersType["status"]) ||
      undefined,
  };

  const [filters, setFilters] = useState<EmployeeFiltersType>(initialFilters);

  const { data, isLoading, isError, error } = useEmployees(filters);

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const changeStatus = useChangeEmployeeStatus();

  function updateUrl(nextFilters: EmployeeFiltersType) {
    const params = new URLSearchParams();

    if (nextFilters.name) {
      params.set("name", nextFilters.name);
    }

    if (nextFilters.email) {
      params.set("email", nextFilters.email);
    }

    if (nextFilters.phone) {
      params.set("phone", nextFilters.phone);
    }

    if (nextFilters.position) {
      params.set("position", nextFilters.position);
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

  function handleFiltersChange(nextFilters: EmployeeFiltersType) {
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
    const safeLimit =
      Number.isInteger(limit) && limit >= 1 ? Math.min(limit, 100) : 20;

    handleFiltersChange({
      ...filters,
      page: 1,
      limit: safeLimit,
    });
  }

  function openCreateForm() {
    setEmployeeToEdit(null);
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditForm(employee: Employee) {
    setEmployeeToEdit(employee);
    setFormError(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEmployeeToEdit(null);
    setFormError(null);
  }

  async function handleFormSubmit(formData: EmployeeFormData) {
    try {
      if (employeeToEdit) {
        await updateEmployee.mutateAsync({
          id: employeeToEdit.id,
          payload: formData,
        });

        toast.success(
          "Empleado actualizado",
          "Los datos del empleado se actualizaron correctamente.",
        );
      } else {
        await createEmployee.mutateAsync(formData);

        toast.success("Empleado creado", "El empleado se creó correctamente.");
      }

      closeForm();
    } catch (error) {
      const message = getApiErrorMessage(error);

      setFormError(message);

      toast.error("No se pudo completar la acción", message);
    }
  }

  function handleChangeStatusClick(employee: Employee) {
    setEmployeeToHandleStatus(employee);
  }

  async function toggleStatus() {
    if (!employeeToHandleStatus) {
      return;
    }

    const employee = employeeToHandleStatus;

    try {
      const nextStatus = employee.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      await changeStatus.mutateAsync({
        id: employee.id,
        payload: {
          status: nextStatus,
        },
      });

      toast.success(
        nextStatus === "ACTIVE" ? "Empleado activado" : "Empleado desactivado",
        `${employee.firstName} ${employee.lastName} fue ${
          nextStatus === "ACTIVE" ? "activado" : "desactivado"
        } correctamente.`,
      );
    } catch (error) {
      toast.error("No se pudo cambiar el estado", getApiErrorMessage(error));
    }

    setEmployeeToHandleStatus(null);
  }

  const employees = data?.data ?? [];

  const hasActiveFilters =
    Boolean(filters.name) ||
    Boolean(filters.email) ||
    Boolean(filters.phone) ||
    Boolean(filters.position) ||
    Boolean(filters.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Empleados</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestiona los empleados y responsables de producción.
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreateForm}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700"
        >
          + Nuevo empleado
        </Button>
      </div>

      {/* Filters */}
      <EmployeeFilters filters={filters} onChange={handleFiltersChange} />

      {/* Results */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {isLoading ? (
          <div className="p-10 text-center text-slate-500">
            Cargando empleados...
          </div>
        ) : isError ? (
          <div className="p-6">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {getApiErrorMessage(error)}
            </div>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="font-semibold text-slate-900">
              {hasActiveFilters
                ? "No encontramos empleados"
                : "Aún no tienes empleados"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {hasActiveFilters
                ? "Prueba cambiando los filtros utilizados."
                : "Registra tu primer empleado para comenzar a organizar tu equipo."}
            </p>

            {!hasActiveFilters && (
              <div className="mt-5">
                <Button
                  type="button"
                  onClick={openCreateForm}
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700"
                >
                  + Crear empleado
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Producción</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">
                            {employee.firstName} {employee.lastName}
                          </p>

                          {employee.notes && (
                            <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">
                              {employee.notes}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-0.5 text-sm">
                          {employee.email && (
                            <p className="text-slate-700">{employee.email}</p>
                          )}

                          {employee.phone && (
                            <p className="text-slate-500">{employee.phone}</p>
                          )}

                          {!employee.email && !employee.phone && (
                            <span className="text-slate-400">Sin contacto</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm text-slate-700">
                          {employee.position || "Sin cargo"}
                        </span>
                      </TableCell>

                      <TableCell>
                        {employee.user ? (
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {employee.user.firstName} {employee.user.lastName}
                            </p>

                            <p className="text-xs text-slate-500">
                              {employee.user.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">
                            Sin usuario
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="text-sm text-slate-700">
                          {employee._count.productionJobs}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span
                          className={
                            employee.status === "ACTIVE"
                              ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                              : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                          }
                        >
                          {employee.status === "ACTIVE" ? "Activo" : "Inactivo"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(employee)}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => handleChangeStatusClick(employee)}
                            className={
                              employee.status === "ACTIVE"
                                ? "rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                : "rounded-lg border border-emerald-200 px-3 py-1.5 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
                            }
                          >
                            {employee.status === "ACTIVE"
                              ? "Desactivar"
                              : "Activar"}
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {data && (
              <Pagination
                page={data.meta.page}
                totalPages={data.meta.totalPages}
                limit={data.meta.limit}
                total={data.meta.total}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            )}
          </>
        )}
      </div>

      {/* Form modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {employeeToEdit ? "Editar empleado" : "Nuevo empleado"}
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  {employeeToEdit
                    ? "Actualiza los datos del empleado."
                    : "Registra un nuevo integrante del equipo."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={createEmployee.isPending || updateEmployee.isPending}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="p-5">
              <EmployeeForm
                employee={employeeToEdit}
                onSubmit={handleFormSubmit}
                onCancel={closeForm}
                isSubmitting={
                  createEmployee.isPending || updateEmployee.isPending
                }
                formError={formError}
              />
            </div>
          </div>
        </div>
      )}

      {/* Status confirmation */}
      <ConfirmDialog
        open={Boolean(employeeToHandleStatus)}
        title={
          employeeToHandleStatus?.status === "ACTIVE"
            ? "Desactivar empleado"
            : "Activar empleado"
        }
        description={
          employeeToHandleStatus?.status === "ACTIVE"
            ? `¿Quieres desactivar a ${employeeToHandleStatus.firstName} ${employeeToHandleStatus.lastName}? No se eliminarán sus datos ni su historial de producción.`
            : `¿Quieres activar nuevamente a ${employeeToHandleStatus?.firstName} ${employeeToHandleStatus?.lastName}?`
        }
        confirmLabel={
          employeeToHandleStatus?.status === "ACTIVE" ? "Desactivar" : "Activar"
        }
        cancelLabel="Cancelar"
        onConfirm={toggleStatus}
        onClose={() => setEmployeeToHandleStatus(null)}
        loading={changeStatus.isPending}
      />
    </div>
  );
}
