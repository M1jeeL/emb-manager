import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  useChangeCustomerStatus,
  useCreateCustomer,
  useCustomers,
  useUpdateCustomer,
} from "../../../hooks/useCustomers";

import { CustomerFilters } from "../components/CustomerFilters";
import { CustomerForm } from "../components/CustomerForm";

import type {
  Customer,
  CustomerFilters as CustomerFiltersType,
} from "../../../types";

import type { CustomerFormData } from "../schemas/customer.schema";
import { Pagination } from "../../../components/ui/Pagination";
import { ConfirmDialog, useToast } from "../../../components/ui";
import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";

function parsePositiveInteger(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function CustomersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [customerToHandleStatus, setCustomerToHandleStatus] =
    useState<Customer | null>(null);

  const initialFilters: CustomerFiltersType = {
    page: parsePositiveInteger(searchParams.get("page"), 1),
    limit: parsePositiveInteger(searchParams.get("limit"), 20),
    name: searchParams.get("name") || undefined,
    companyName: searchParams.get("companyName") || undefined,
    phone: searchParams.get("phone") || undefined,
    email: searchParams.get("email") || undefined,
    taxId: searchParams.get("taxId") || undefined,
    status:
      (searchParams.get("status") as CustomerFiltersType["status"]) ||
      undefined,
  };

  const [filters, setFilters] = useState<CustomerFiltersType>(initialFilters);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading, isFetching, isError, error } = useCustomers(filters);

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const changeStatus = useChangeCustomerStatus();

  function updateUrl(nextFilters: CustomerFiltersType) {
    const params = new URLSearchParams();

    if (nextFilters.name) {
      params.set("name", nextFilters.name);
    }

    if (nextFilters.companyName) {
      params.set("companyName", nextFilters.companyName);
    }

    if (nextFilters.phone) {
      params.set("phone", nextFilters.phone);
    }

    if (nextFilters.email) {
      params.set("email", nextFilters.email);
    }

    if (nextFilters.taxId) {
      params.set("taxId", nextFilters.taxId);
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

  function handleFiltersChange(nextFilters: CustomerFiltersType) {
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
    setSelectedCustomer(null);
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditForm(customer: Customer) {
    setSelectedCustomer(customer);
    setFormError(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    if (createCustomer.isPending || updateCustomer.isPending) {
      return;
    }

    setIsFormOpen(false);
    setSelectedCustomer(null);
    setFormError(null);
  }

  async function handleSubmit(formData: CustomerFormData) {
    setFormError(null);

    try {
      if (selectedCustomer) {
        await updateCustomer.mutateAsync({
          id: selectedCustomer.id,
          payload: formData,
        });
        toast.success(
          "Cliente actualizado",
          "El cliente se actualizó correctamente",
        );
      } else {
        await createCustomer.mutateAsync(formData);
        toast.success("Cliente creado", "El cliente se creó correctamente");
      }

      closeForm();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
      toast.error("No se pudo completar la acción", getApiErrorMessage(error));
    }
  }

  async function toggleStatus() {
    if (!customerToHandleStatus) {
      return;
    }
    try {
      await changeStatus.mutateAsync({
        id: customerToHandleStatus.id,
        status:
          customerToHandleStatus.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      });
      toast.success(
        `Cliente ha sido ${customerToHandleStatus.status === "ACTIVE" ? "desactivado" : "activado"} correctamente`,
        `${customerToHandleStatus.name} fue ${customerToHandleStatus.status === "ACTIVE" ? "desactivado" : "activado"} correctamente.`,
      );
    } catch (error) {
      toast.error("No se pudo completar la acción", getApiErrorMessage(error));
    }
    setCustomerToHandleStatus(null);
  }

  const handleChangeStatusClick = (customer: Customer) => {
    setCustomerToHandleStatus(customer);
  };

  const customers = data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>

          <p className="mt-1 text-sm text-slate-500">
            Gestiona los clientes y sus datos de contacto.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700"
        >
          + Nuevo cliente
        </button>
      </div>

      {/* Filtros */}
      <CustomerFilters filters={filters} onChange={handleFiltersChange} />

      {/* Resultados */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {isLoading ? (
          <div className="p-10 text-center text-slate-500">
            Cargando clientes...
          </div>
        ) : isError ? (
          <div className="p-6">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error instanceof Error
                ? error.message
                : "No se pudieron cargar los clientes"}
            </div>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="font-semibold text-slate-900">
              No encontramos clientes
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Prueba cambiando los filtros o registra un nuevo cliente.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Cliente
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Empresa
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Contacto
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      RUT
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Estado
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {customer.name}
                        </div>

                        <div className="text-sm text-slate-500">
                          {customer.email ?? "Sin email"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {customer.companyName ?? "-"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {customer.phone ?? "Sin teléfono"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {customer.taxId ?? "-"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={
                            customer.status === "ACTIVE"
                              ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                              : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                          }
                        >
                          {customer.status === "ACTIVE" ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => openEditForm(customer)}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => handleChangeStatusClick(customer)}
                            disabled={changeStatus.isPending}
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
                          >
                            {customer.status === "ACTIVE"
                              ? "Desactivar"
                              : "Activar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

        {customerToHandleStatus && (
          <ConfirmDialog
            open={customerToHandleStatus !== null}
            onClose={() => {
              if (!isLoading) {
                setCustomerToHandleStatus(null);
              }
            }}
            onConfirm={toggleStatus}
            title={`${
              customerToHandleStatus.status === "ACTIVE"
                ? "Desactivar"
                : "Activar"
            } cliente`}
            description={
              customerToHandleStatus
                ? `¿Estás seguro de que quieres ${
                    customerToHandleStatus.status === "ACTIVE"
                      ? "Desactivar"
                      : "Activar"
                  } a ${customerToHandleStatus.name}?`
                : ""
            }
            confirmLabel={`${
              customerToHandleStatus.status === "ACTIVE"
                ? "Desactivar"
                : "Activar"
            }`}
            cancelLabel="Cancelar"
            danger
            loading={isLoading}
          />
        )}

        {isFetching && !isLoading && (
          <div className="border-t bg-slate-50 px-5 py-2 text-xs text-slate-500">
            Actualizando resultados...
          </div>
        )}
      </div>

      {/* Formulario */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {selectedCustomer ? "Editar cliente" : "Nuevo cliente"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {selectedCustomer
                  ? "Actualiza la información del cliente."
                  : "Registra un nuevo cliente en tu organización."}
              </p>
            </div>

            <CustomerForm
              customer={selectedCustomer}
              loading={createCustomer.isPending || updateCustomer.isPending}
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
