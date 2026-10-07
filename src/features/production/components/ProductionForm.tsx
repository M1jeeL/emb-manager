import { useMemo, useState } from "react";

import { useOrder } from "../../../hooks/useOrders";
import {
  useProduction,
  usePendingProductionOrder,
} from "../../../hooks/useProduction";

import type {
  Employee,
  Machine,
  ProductionAvailableOrder,
  ProductionJob,
} from "../../../types";

interface ProductionFormProps {
  initialData?: ProductionJob | null;
  orders: ProductionAvailableOrder[];
  employees: Employee[];
  machines: Machine[];
  isSubmitting?: boolean;

  onSubmit: (payload: {
    orderId: string;
    orderItemId: string;
    orderItemLogoId?: string;
    machineId?: string;
    employeeId?: string;
    quantity: number;
    notes?: string;
  }) => void | Promise<void>;

  onSubmitFullOrder: (
    orderId: string,
    payload: {
      machineId?: string;
      employeeId?: string;
      notes?: string;
    },
  ) => void | Promise<void>;

  onUpdate?: (payload: {
    orderItemLogoId?: string | null;
    machineId?: string | null;
    employeeId?: string | null;
    quantity?: number;
    notes?: string | null;
  }) => void | Promise<void>;

  onCancel: () => void;
}

type ProductionMode = "INDIVIDUAL" | "FULL_ORDER";

export function ProductionForm({
  initialData,
  orders,
  employees,
  machines,
  isSubmitting = false,
  onSubmit,
  onSubmitFullOrder,
  onUpdate,
  onCancel,
}: ProductionFormProps) {
  const isEditing = Boolean(initialData);

  const [orderId, setOrderId] = useState(initialData?.orderId ?? "");

  const [orderItemId, setOrderItemId] = useState(
    initialData?.orderItemId ?? "",
  );

  const [orderItemLogoId, setOrderItemLogoId] = useState(
    initialData?.orderItemLogoId ?? "",
  );

  const [machineId, setMachineId] = useState(initialData?.machineId ?? "");

  const [employeeId, setEmployeeId] = useState(initialData?.employeeId ?? "");

  const [quantity, setQuantity] = useState(initialData?.quantity ?? 1);

  const [notes, setNotes] = useState(initialData?.notes ?? "");

  const [productionMode, setProductionMode] =
    useState<ProductionMode>("INDIVIDUAL");

  /*
   * Si está editando -> usa useOrder
   * Si está creando -> usa usePendingProductionOrder
   */
  const orderQuery = useOrder(orderId);

  const pendingOrderQuery = usePendingProductionOrder(
    orderId,
    !isEditing && Boolean(orderId),
  );

  // Consolidamos la información de acuerdo al modo activo
  const currentOrder = isEditing ? orderQuery.data : pendingOrderQuery.data;

  const isLoadingOrder = isEditing
    ? orderQuery.isLoading
    : pendingOrderQuery.isLoading;

  const isOrderError = isEditing
    ? orderQuery.isError
    : pendingOrderQuery.isError;

  /*
   * Consultamos los trabajos existentes del pedido
   * solamente cuando tenemos un orderId.
   */
  const productionQuery = useProduction(
    orderId
      ? {
          orderId,
          page: 1,
          limit: 100,
        }
      : {},
    Boolean(orderId),
  );

  const productionJobs = productionQuery.data?.data ?? [];

  const selectedItem = useMemo(() => {
    if (!currentOrder) {
      return null;
    }

    return currentOrder.items.find((item) => item.id === orderItemId) ?? null;
  }, [currentOrder, orderItemId]);

  const selectedLogo = useMemo(() => {
    if (!selectedItem || !orderItemLogoId) {
      return null;
    }

    return (
      selectedItem.logos.find((logo) => logo.id === orderItemLogoId) ?? null
    );
  }, [selectedItem, orderItemLogoId]);

  /*
   * Calcula cuántas unidades ya están asignadas a producción.
   */
  function getProducedQuantity(itemId: string, logoId: string | null) {
    return productionJobs
      .filter((job) => {
        if (job.id === initialData?.id) {
          return false;
        }

        if (job.orderItemId !== itemId) {
          return false;
        }

        if (job.orderItemLogoId !== logoId) {
          return false;
        }

        if (job.status === "CANCELLED") {
          return false;
        }

        return true;
      })
      .reduce((total, job) => total + job.quantity, 0);
  }

  const requestedQuantity = selectedLogo
    ? selectedLogo.quantity
    : (selectedItem?.quantity ?? 0);

  const producedQuantity = selectedItem
    ? getProducedQuantity(selectedItem.id, selectedLogo?.id ?? null)
    : 0;

  const availableQuantity = Math.max(0, requestedQuantity - producedQuantity);

  const maxQuantity = availableQuantity;

  function handleOrderChange(nextOrderId: string) {
    setOrderId(nextOrderId);
    setOrderItemId("");
    setOrderItemLogoId("");
    setQuantity(1);
    setProductionMode("INDIVIDUAL");
  }

  function handleItemChange(nextOrderItemId: string) {
    setOrderItemId(nextOrderItemId);
    setOrderItemLogoId("");

    const item = currentOrder?.items.find(
      (currentItem) => currentItem.id === nextOrderItemId,
    );

    if (!item) {
      setQuantity(1);
      return;
    }

    if (item.logos.length === 0) {
      const produced = getProducedQuantity(item.id, null);
      const available = Math.max(0, item.quantity - produced);

      setQuantity(available > 0 ? available : 1);
      return;
    }

    setQuantity(1);
  }

  function handleLogoChange(nextLogoId: string) {
    setOrderItemLogoId(nextLogoId);

    if (!nextLogoId || !selectedItem) {
      setQuantity(1);
      return;
    }

    const logo = selectedItem.logos.find(
      (currentLogo) => currentLogo.id === nextLogoId,
    );

    if (!logo) {
      setQuantity(1);
      return;
    }

    const produced = getProducedQuantity(selectedItem.id, logo.id);
    const available = Math.max(0, logo.quantity - produced);

    setQuantity(available > 0 ? available : 1);
  }

  function handleQuantityChange(value: number) {
    if (!Number.isFinite(value) || value < 1) {
      setQuantity(1);
      return;
    }

    if (maxQuantity > 0 && value > maxQuantity) {
      setQuantity(maxQuantity);
      return;
    }

    setQuantity(value);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!orderId) {
      return;
    }

    if (!isEditing && productionMode === "FULL_ORDER") {
      if (incompleteItems.length === 0) {
        return;
      }

      await onSubmitFullOrder(orderId, {
        ...(machineId ? { machineId } : {}),
        ...(employeeId ? { employeeId } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });

      return;
    }

    if (!orderItemId || !selectedItem) {
      return;
    }

    if (!isEditing && selectedItem.logos.length > 0 && !orderItemLogoId) {
      return;
    }

    if (quantity < 1) {
      return;
    }

    if (!isEditing && availableQuantity <= 0) {
      return;
    }

    if (!isEditing && quantity > availableQuantity) {
      return;
    }

    if (isEditing) {
      await onUpdate?.({
        orderItemLogoId: orderItemLogoId || null,
        machineId: machineId || null,
        employeeId: employeeId || null,
        quantity,
        notes: notes.trim() || null,
      });

      return;
    }

    await onSubmit({
      orderId,
      orderItemId,
      ...(orderItemLogoId ? { orderItemLogoId } : {}),
      ...(machineId ? { machineId } : {}),
      ...(employeeId ? { employeeId } : {}),
      quantity,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    });
  }

  const hasAvailableQuantity = availableQuantity > 0;

  const canSubmitIndividual =
    Boolean(orderId) &&
    Boolean(orderItemId) &&
    Boolean(selectedItem) &&
    quantity >= 1 &&
    (isEditing || hasAvailableQuantity) &&
    (isEditing ||
      selectedItem?.logos.length === 0 ||
      Boolean(orderItemLogoId)) &&
    (!isEditing || !isLoadingOrder);

  const incompleteItems =
    currentOrder?.items.filter(
      (item) => item.status !== "READY" && item.status !== "CANCELLED",
    ) ?? [];

  const canSubmitFullOrder =
    !isEditing &&
    Boolean(orderId) &&
    Boolean(currentOrder) &&
    !isLoadingOrder &&
    incompleteItems.length > 0;

  const canSubmit =
    !isSubmitting &&
    (productionMode === "FULL_ORDER"
      ? canSubmitFullOrder
      : canSubmitIndividual);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pedido */}
      <div>
        <label
          htmlFor="production-order"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Pedido
        </label>

        {isEditing ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p className="font-medium text-slate-900">
              #{initialData?.order.orderNumber}
            </p>

            <p className="mt-0.5 text-sm text-slate-500">
              {initialData?.order.customer.companyName ||
                initialData?.order.customer.name}
            </p>
          </div>
        ) : (
          <>
            {orders.length === 0 ? (
              <p className="my-1.5 text-xs text-slate-500">
                No hay pedidos disponibles.
              </p>
            ) : (
              <select
                id="production-order"
                value={orderId}
                onChange={(event) => handleOrderChange(event.target.value)}
                disabled={isSubmitting || orders.length === 0}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">Selecciona un pedido</option>

                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    #{order.orderNumber} ·{" "}
                    {order.customer.companyName || order.customer.name}
                  </option>
                ))}
              </select>
            )}
          </>
        )}
      </div>

      {/* Loading pedido */}
      {orderId && isLoadingOrder && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-sm text-blue-700">
            Cargando información del pedido...
          </p>
        </div>
      )}

      {/* Error pedido */}
      {orderId && isOrderError && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            No fue posible cargar el detalle del pedido.
          </p>
        </div>
      )}

      {/* Modo de producción */}
      {!isEditing && currentOrder && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Tipo de producción
          </label>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-1">
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setProductionMode("INDIVIDUAL")}
                disabled={isSubmitting}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  productionMode === "INDIVIDUAL"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Producción individual
              </button>

              <button
                type="button"
                onClick={() => setProductionMode("FULL_ORDER")}
                disabled={isSubmitting}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  productionMode === "FULL_ORDER"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Pedido completo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCCIÓN INDIVIDUAL */}
      {productionMode === "INDIVIDUAL" && (
        <>
          {/* Prenda */}
          <div>
            <label
              htmlFor="production-item"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Prenda
            </label>

            <select
              id="production-item"
              value={orderItemId}
              onChange={(event) => handleItemChange(event.target.value)}
              disabled={
                isSubmitting || !currentOrder || isLoadingOrder || isEditing
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="" disabled>
                {currentOrder
                  ? "Selecciona una prenda"
                  : "Selecciona primero un pedido"}
              </option>

              {currentOrder?.items.map((item) => {
                const produced =
                  item.logos.length === 0
                    ? getProducedQuantity(item.id, null)
                    : 0;

                const available =
                  item.logos.length === 0
                    ? Math.max(0, item.quantity - produced)
                    : item.quantity;

                const isUnavailable =
                  item.logos.length === 0 && available === 0;

                return (
                  <option
                    key={item.id}
                    value={item.id}
                    disabled={isUnavailable}
                  >
                    {item.garment.name} · {available} disponibles
                    {item.description ? ` · ${item.description}` : ""}
                  </option>
                );
              })}
            </select>

            {selectedItem && (
              <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Cantidad solicitada
                  </span>

                  <span className="font-semibold text-slate-900">
                    {selectedItem.quantity}
                  </span>
                </div>

                {selectedItem.logos.length === 0 && (
                  <>
                    <div className="mt-1 flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">
                        Ya producidas
                      </span>

                      <span className="font-medium text-slate-700">
                        {producedQuantity}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">
                        Disponibles
                      </span>

                      <span className="font-semibold text-blue-700">
                        {availableQuantity}
                      </span>
                    </div>
                  </>
                )}

                {selectedItem.description && (
                  <p className="mt-2 text-xs text-slate-500">
                    {selectedItem.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Logo */}
          <div>
            <label
              htmlFor="production-logo"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Logo
              {selectedItem?.logos.length ? (
                <span className="ml-1 font-normal text-red-500">*</span>
              ) : (
                <span className="ml-1 font-normal text-slate-400">
                  (no aplica)
                </span>
              )}
            </label>

            <select
              id="production-logo"
              value={orderItemLogoId}
              onChange={(event) => handleLogoChange(event.target.value)}
              disabled={
                isSubmitting ||
                !selectedItem ||
                selectedItem.logos.length === 0 ||
                isEditing
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="" disabled>
                {!selectedItem
                  ? "Selecciona primero una prenda"
                  : selectedItem.logos.length === 0
                    ? "Esta prenda no tiene logos"
                    : "Selecciona un logo"}
              </option>

              {selectedItem?.logos.map((logo) => {
                const produced = getProducedQuantity(selectedItem.id, logo.id);
                const available = Math.max(0, logo.quantity - produced);

                return (
                  <option
                    key={logo.id}
                    value={logo.id}
                    disabled={available === 0}
                  >
                    {logo.logoName} · {available} disponibles
                  </option>
                );
              })}
            </select>

            {selectedLogo && (
              <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Cantidad solicitada para este logo
                  </span>

                  <span className="font-semibold text-slate-900">
                    {selectedLogo.quantity}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">Ya producidas</span>

                  <span className="font-medium text-slate-700">
                    {producedQuantity}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">Disponibles</span>

                  <span className="font-semibold text-blue-700">
                    {availableQuantity}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Cantidad */}
          <div>
            <label
              htmlFor="production-quantity"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Cantidad a producir
            </label>

            <input
              id="production-quantity"
              type="number"
              min={1}
              max={maxQuantity > 0 ? maxQuantity : undefined}
              value={quantity}
              onChange={(event) =>
                handleQuantityChange(Number(event.target.value))
              }
              disabled={
                isSubmitting ||
                !selectedItem ||
                (!isEditing && !hasAvailableQuantity)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            {selectedItem && (
              <p className="mt-1.5 text-xs text-slate-500">
                {hasAvailableQuantity
                  ? `Puedes producir hasta ${availableQuantity} unidad${
                      availableQuantity !== 1 ? "es" : ""
                    } en este trabajo.`
                  : "No quedan unidades disponibles para producir."}
              </p>
            )}
          </div>
        </>
      )}

      {/* PEDIDO COMPLETO */}
      {!isEditing && productionMode === "FULL_ORDER" && currentOrder && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              ✓
            </div>

            <div>
              <p className="font-semibold text-emerald-900">
                Producción del pedido completo
              </p>

              <p className="mt-1 text-sm text-emerald-700">
                Se crearán automáticamente los trabajos necesarios para todos
                los items que todavía tengan unidades pendientes de producción.
              </p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-emerald-200 rounded-lg border border-emerald-200 bg-white">
            {currentOrder.items.map((item) => {
              const hasLogos = item.logos.length > 0;

              return (
                <div key={item.id} className="px-3 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {item.garment.name}
                      </p>

                      {item.description && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <span className="text-sm font-semibold text-slate-900">
                      {item.quantity}{" "}
                      {item.quantity === 1 ? "unidad" : "unidades"}
                    </span>
                  </div>

                  {hasLogos && (
                    <div className="mt-2 space-y-1 pl-3">
                      {item.logos.map((logo) => (
                        <div
                          key={logo.id}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-slate-500">
                            {logo.logoName}
                          </span>

                          <span className="font-medium text-slate-700">
                            {logo.pendingQuantity} unidades
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {incompleteItems.length === 0 && (
            <p className="mt-3 text-sm font-medium text-emerald-700">
              Este pedido no tiene items pendientes de producción.
            </p>
          )}
        </div>
      )}

      {/* Máquina */}
      <div>
        <label
          htmlFor="production-machine"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Máquina
          <span className="ml-1 font-normal text-slate-400">(opcional)</span>
        </label>

        <select
          id="production-machine"
          value={machineId}
          onChange={(event) => setMachineId(event.target.value)}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          <option value="">Sin máquina asignada</option>

          {machines.map((machine) => (
            <option key={machine.id} value={machine.id}>
              {machine.name}
              {machine.code ? ` · ${machine.code}` : ""}
            </option>
          ))}
        </select>

        {machines.length === 0 && (
          <p className="mt-1.5 text-xs text-slate-500">
            No hay máquinas activas disponibles.
          </p>
        )}
      </div>

      {/* Responsable */}
      <div>
        <label
          htmlFor="production-employee"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Responsable
          <span className="ml-1 font-normal text-slate-400">(opcional)</span>
        </label>

        <select
          id="production-employee"
          value={employeeId}
          onChange={(event) => setEmployeeId(event.target.value)}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          <option value="">Sin responsable asignado</option>

          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.firstName} {employee.lastName}
              {employee.position ? ` · ${employee.position}` : ""}
            </option>
          ))}
        </select>

        {employees.length === 0 && (
          <p className="mt-1.5 text-xs text-slate-500">
            No hay empleados activos disponibles.
          </p>
        )}
      </div>

      {/* Notas */}
      <div>
        <label
          htmlFor="production-notes"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Notas
          <span className="ml-1 font-normal text-slate-400">(opcional)</span>
        </label>

        <textarea
          id="production-notes"
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          disabled={isSubmitting}
          placeholder="Indicaciones especiales para este trabajo..."
          className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
      </div>

      {/* Resumen */}
      {currentOrder && productionMode === "INDIVIDUAL" && selectedItem && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900">
            Resumen del trabajo
          </p>

          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-blue-700">Pedido</span>

              <span className="font-medium text-blue-950">
                #{currentOrder.orderNumber}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-blue-700">Prenda</span>

              <span className="text-right font-medium text-blue-950">
                {selectedItem.garment.name}
              </span>
            </div>

            {selectedLogo && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-blue-700">Logo</span>

                <span className="text-right font-medium text-blue-950">
                  {selectedLogo.logoName}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 border-t border-blue-200 pt-2">
              <span className="font-medium text-blue-800">
                Cantidad a producir
              </span>

              <span className="text-lg font-bold text-blue-950">
                {quantity}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-blue-700">Disponible restante</span>

              <span className="font-medium text-blue-950">
                {availableQuantity}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : productionMode === "FULL_ORDER"
                ? "Crear producción completa"
                : "Crear producción"}
        </button>
      </div>
    </form>
  );
}
