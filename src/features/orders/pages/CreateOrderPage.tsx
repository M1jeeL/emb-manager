import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCreateGarment } from "../../../hooks/useGarments";
import { useCreateOrder } from "../../../hooks/useOrders";

import type {
  OrderBuilderItem,
  OrderBuilderState,
  NewCustomerForm,
} from "../types/create-order";

import type {
  Customer,
  Garment,
  Logo,
  CreateOrderPayload,
} from "../../../types";

import { OrderCustomerSelector } from "../components/OrderCustomerSelector";
import { OrderGarmentSelector } from "../components/OrderGarmentSelector";
import { OrderItemCard } from "../components/OrderItemCard";
import { OrderSummary } from "../components/OrderSummary";

import { useToast } from "../../../components/ui";
import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";

const emptyCustomer: NewCustomerForm = {
  name: "",
  email: "",
  phone: "",
  taxId: "",
  companyName: "",
  address: "",
  city: "",
  notes: "",
};

function createEmptyItem(): OrderBuilderItem {
  return {
    id: crypto.randomUUID(),

    garment: null,
    isNewGarment: false,

    garmentName: "",
    garmentDescription: "",

    quantity: 1,

    description: "",
    notes: "",

    logos: [],
  };
}

function createEmptyOrder(): OrderBuilderState {
  return {
    customer: null,
    isNewCustomer: false,

    newCustomer: {
      ...emptyCustomer,
    },

    status: "QUOTE",

    promisedAt: "",
    discount: "0",
    notes: "",

    items: [createEmptyItem()],
  };
}

function parseMoney(value: string | undefined | null): number {
  const parsed = Number(value ?? 0);

  return Number.isFinite(parsed) ? parsed : 0;
}

function buildCreateOrderPayload(order: OrderBuilderState): CreateOrderPayload {
  return {
    ...(order.customer
      ? {
          customerId: order.customer.id,
        }
      : {
          customer: {
            name: order.newCustomer.name.trim(),
            email: order.newCustomer.email.trim() || undefined,
            phone: order.newCustomer.phone.trim() || undefined,
            taxId: order.newCustomer.taxId.trim() || undefined,
            companyName: order.newCustomer.companyName.trim() || undefined,
            address: order.newCustomer.address.trim() || undefined,
            city: order.newCustomer.city.trim() || undefined,
            notes: order.newCustomer.notes.trim() || undefined,
          },
        }),

    status: order.status,

    promisedAt: order.promisedAt || undefined,

    discount: order.discount || "0",

    notes: order.notes.trim() || undefined,

    items: order.items.map((item) => ({
      garmentId: item.garment!.id,

      quantity: item.quantity,

      description: item.description.trim() || undefined,

      notes: item.notes.trim() || undefined,

      logos: item.logos.map((logo) => {
        if (logo.isNew) {
          return {
            logo: {
              name: logo.name.trim(),
              currentPrice: logo.currentPrice,
              description: logo.description?.trim() || undefined,
            },

            quantity: logo.quantity,

            notes: logo.notes.trim() || undefined,
          };
        }

        return {
          logoId: logo.logo!.id,

          quantity: logo.quantity,

          notes: logo.notes.trim() || undefined,
        };
      }),
    })),
  };
}

export function CreateOrderPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const createOrder = useCreateOrder();
  const createGarment = useCreateGarment();

  const [order, setOrder] = useState<OrderBuilderState>(createEmptyOrder);

  const [validationError, setValidationError] = useState<string | null>(null);

  const isSubmitting = createOrder.isPending || createGarment.isPending;

  const subtotal = useMemo(() => {
    return order.items.reduce((orderTotal, item) => {
      const itemSubtotal = item.logos.reduce(
        (total, logo) => total + parseMoney(logo.currentPrice) * logo.quantity,
        0,
      );

      return orderTotal + itemSubtotal;
    }, 0);
  }, [order.items]);

  const discount = Math.max(0, parseMoney(order.discount));

  const total = Math.max(0, subtotal - discount);

  const itemCount = order.items.reduce(
    (totalItems, item) => totalItems + item.quantity,
    0,
  );

  const garmentCount = order.items.length;

  function updateOrder(changes: Partial<OrderBuilderState>) {
    setOrder((current) => ({
      ...current,
      ...changes,
    }));
  }

  function handleCustomerSelect(customer: Customer | null) {
    setValidationError(null);

    setOrder((current) => ({
      ...current,
      customer,
      isNewCustomer: false,
      newCustomer: {
        ...emptyCustomer,
      },
    }));
  }

  function handleCreateNewCustomer(name: string) {
    setValidationError(null);

    setOrder((current) => ({
      ...current,
      customer: null,
      isNewCustomer: true,
      newCustomer: {
        ...current.newCustomer,
        name,
      },
    }));
  }

  function handleCancelNewCustomer() {
    setValidationError(null);

    setOrder((current) => ({
      ...current,
      customer: null,
      isNewCustomer: false,
      newCustomer: {
        ...emptyCustomer,
      },
    }));
  }

  function updateNewCustomer(changes: Partial<NewCustomerForm>) {
    setOrder((current) => ({
      ...current,
      newCustomer: {
        ...current.newCustomer,
        ...changes,
      },
    }));
  }

  function addItem() {
    setValidationError(null);

    setOrder((current) => ({
      ...current,
      items: [...current.items, createEmptyItem()],
    }));
  }

  function removeItem(itemId: string) {
    setValidationError(null);

    setOrder((current) => {
      if (current.items.length <= 1) {
        return current;
      }

      return {
        ...current,
        items: current.items.filter((item) => item.id !== itemId),
      };
    });
  }

  function updateItem(itemId: string, changes: Partial<OrderBuilderItem>) {
    setOrder((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              ...changes,
            }
          : item,
      ),
    }));
  }

  function handleGarmentSelect(itemId: string, garment: Garment | null) {
    setValidationError(null);

    updateItem(itemId, {
      garment,
      isNewGarment: false,
      garmentName: "",
      garmentDescription: "",
    });
  }

  async function handleCreateGarment(itemId: string, name: string) {
    const cleanName = name.trim();

    if (!cleanName) {
      return;
    }

    try {
      const garment = await createGarment.mutateAsync({
        name: cleanName,
      });

      updateItem(itemId, {
        garment,
        isNewGarment: false,
        garmentName: "",
        garmentDescription: "",
      });

      setValidationError(null);

      toast.success("Prenda creada", `${garment.name} fue agregada al pedido.`);
    } catch (error) {
      const message = getApiErrorMessage(error);

      toast.error("No se pudo crear la prenda", message);
    }
  }

  function handleQuantityChange(itemId: string, quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      return;
    }

    updateItem(itemId, {
      quantity,
    });

    setValidationError(null);
  }

  function handleAddLogo(itemId: string, logo: Logo) {
    setValidationError(null);

    setOrder((current) => ({
      ...current,
      items: current.items.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        const alreadyExists = item.logos.some(
          (itemLogo) => itemLogo.logo?.id === logo.id,
        );

        if (alreadyExists) {
          return item;
        }

        return {
          ...item,
          logos: [
            ...item.logos,
            {
              id: crypto.randomUUID(),
              logo,
              isNew: false,
              name: logo.name,
              currentPrice: logo.currentPrice,
              description: logo.description ?? "",
              quantity: 1,
              notes: "",
            },
          ],
        };
      }),
    }));
  }

  function handleCreateNewLogo(itemId: string, name: string) {
    const cleanName = name.trim();

    if (!cleanName) {
      return;
    }

    /*
     * El componente OrderLogoSelector actual
     * solamente entrega el nombre del nuevo logo.
     *
     * Por eso solicitamos aquí el precio inicial.
     * Posteriormente podemos reemplazar esto por
     * un diálogo propio si queremos una UX más
     * sofisticada.
     */
    const priceInput = window.prompt(`Precio del bordado "${cleanName}"`, "0");

    if (priceInput === null) {
      return;
    }

    const price = parseMoney(priceInput);

    if (price < 0) {
      toast.error(
        "Precio inválido",
        "El precio del bordado no puede ser negativo.",
      );
      return;
    }

    setValidationError(null);

    setOrder((current) => ({
      ...current,
      items: current.items.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        return {
          ...item,
          logos: [
            ...item.logos,
            {
              id: crypto.randomUUID(),
              logoId: crypto.randomUUID(),
              logo: null,
              isNew: true,
              name: cleanName,
              currentPrice: String(price),
              description: "",
              quantity: 1,
              notes: "",
            },
          ],
        };
      }),
    }));
  }

  function handleLogoQuantityChange(
    itemId: string,
    logoId: string,
    quantity: number,
  ) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      return;
    }

    setOrder((current) => ({
      ...current,
      items: current.items.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        return {
          ...item,
          logos: item.logos.map((logo) =>
            logo.id === logoId
              ? {
                  ...logo,
                  quantity: Math.min(quantity, item.quantity),
                }
              : logo,
          ),
        };
      }),
    }));
  }

  function handleRemoveLogo(itemId: string, logoId: string) {
    setValidationError(null);

    setOrder((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              logos: item.logos.filter((logo) => logo.id !== logoId),
            }
          : item,
      ),
    }));
  }

  function validateOrder(): string | null {
    if (!order.customer && !order.isNewCustomer) {
      return "Debes seleccionar un cliente.";
    }

    if (order.isNewCustomer) {
      if (!order.newCustomer.name.trim()) {
        return "El nombre del nuevo cliente es obligatorio.";
      }
    }

    if (order.items.length === 0) {
      return "Debes agregar al menos una prenda.";
    }

    for (let itemIndex = 0; itemIndex < order.items.length; itemIndex++) {
      const item = order.items[itemIndex];
      const itemNumber = itemIndex + 1;

      if (!item.garment) {
        return `Debes seleccionar una prenda para el ítem ${itemNumber}.`;
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return `La cantidad de prendas del ítem ${itemNumber} debe ser mayor a 0.`;
      }

      if (item.logos.length === 0) {
        return `El ítem ${itemNumber} debe tener al menos un bordado.`;
      }

      for (let logoIndex = 0; logoIndex < item.logos.length; logoIndex++) {
        const logo = item.logos[logoIndex];
        const logoNumber = logoIndex + 1;

        if (logo.isNew) {
          if (!logo.name.trim()) {
            return `El bordado ${logoNumber} del ítem ${itemNumber} necesita un nombre.`;
          }

          const logoPrice = parseMoney(logo.currentPrice);

          if (logoPrice < 0) {
            return `El precio del bordado ${logoNumber} del ítem ${itemNumber} no puede ser negativo.`;
          }
        } else if (!logo.logo) {
          return `El bordado ${logoNumber} del ítem ${itemNumber} no es válido.`;
        }

        if (!Number.isInteger(logo.quantity) || logo.quantity <= 0) {
          return `La cantidad del bordado ${logoNumber} del ítem ${itemNumber} debe ser mayor a 0.`;
        }

        if (logo.quantity > item.quantity) {
          return `La cantidad del bordado ${logoNumber} del ítem ${itemNumber} no puede superar la cantidad de prendas.`;
        }
      }
    }

    if (discount < 0) {
      return "El descuento no puede ser negativo.";
    }

    if (discount > subtotal) {
      return "El descuento no puede ser mayor al subtotal.";
    }

    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setValidationError(null);

    const error = validateOrder();

    if (error) {
      setValidationError(error);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      const payload = buildCreateOrderPayload(order);

      const createdOrder = await createOrder.mutateAsync(payload);

      toast.success(
        "Pedido creado",
        `El pedido #${createdOrder.orderNumber} fue creado correctamente.`,
      );

      navigate(`/orders/${createdOrder.id}`);
    } catch (error) {
      const message = getApiErrorMessage(error);

      setValidationError(message);

      toast.error("No se pudo crear el pedido", message);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo pedido</h1>

          <p className="mt-1 text-sm text-slate-500">
            Crea una cotización o pedido con sus prendas y bordados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/orders")}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {validationError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-semibold">No se pudo crear el pedido</p>

          <p className="mt-1">{validationError}</p>
        </div>
      )}

      {/* ======================================================
          CLIENTE
      ====================================================== */}

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Cliente</h2>

          <p className="mt-1 text-sm text-slate-500">
            Selecciona un cliente existente o registra uno nuevo.
          </p>
        </div>

        {!order.isNewCustomer ? (
          <OrderCustomerSelector
            value={order.customer}
            onChange={handleCustomerSelect}
            onCreateNew={handleCreateNewCustomer}
            disabled={isSubmitting}
          />
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Nuevo cliente</p>

                <p className="text-sm text-slate-500">
                  Este cliente será creado junto al pedido.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCancelNewCustomer}
                disabled={isSubmitting}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
              >
                Buscar cliente existente
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nombre *
                </label>

                <input
                  value={order.newCustomer.name}
                  onChange={(event) =>
                    updateNewCustomer({
                      name: event.target.value,
                    })
                  }
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500 disabled:bg-slate-100"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  RUT
                </label>

                <input
                  value={order.newCustomer.taxId}
                  onChange={(event) =>
                    updateNewCustomer({
                      taxId: event.target.value,
                    })
                  }
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500 disabled:bg-slate-100"
                  placeholder="12.345.678-9"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  value={order.newCustomer.email}
                  onChange={(event) =>
                    updateNewCustomer({
                      email: event.target.value,
                    })
                  }
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500 disabled:bg-slate-100"
                  placeholder="cliente@empresa.cl"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Teléfono
                </label>

                <input
                  value={order.newCustomer.phone}
                  onChange={(event) =>
                    updateNewCustomer({
                      phone: event.target.value,
                    })
                  }
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500 disabled:bg-slate-100"
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Empresa
                </label>

                <input
                  value={order.newCustomer.companyName}
                  onChange={(event) =>
                    updateNewCustomer({
                      companyName: event.target.value,
                    })
                  }
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500 disabled:bg-slate-100"
                  placeholder="Empresa SpA"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Ciudad
                </label>

                <input
                  value={order.newCustomer.city}
                  onChange={(event) =>
                    updateNewCustomer({
                      city: event.target.value,
                    })
                  }
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500 disabled:bg-slate-100"
                  placeholder="Santiago"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Dirección
                </label>

                <input
                  value={order.newCustomer.address}
                  onChange={(event) =>
                    updateNewCustomer({
                      address: event.target.value,
                    })
                  }
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500 disabled:bg-slate-100"
                  placeholder="Av. Principal 123"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Notas del cliente
                </label>

                <textarea
                  value={order.newCustomer.notes}
                  onChange={(event) =>
                    updateNewCustomer({
                      notes: event.target.value,
                    })
                  }
                  disabled={isSubmitting}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500 disabled:bg-slate-100"
                  placeholder="Información adicional del cliente..."
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ======================================================
          INFORMACIÓN DEL PEDIDO
      ====================================================== */}

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Información del pedido
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Estado inicial
            </label>

            <select
              value={order.status}
              onChange={(event) =>
                updateOrder({
                  status: event.target.value as OrderBuilderState["status"],
                })
              }
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-indigo-500 disabled:bg-slate-100"
            >
              <option value="QUOTE">Cotización</option>

              <option value="PENDING">Pendiente</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Fecha prometida
            </label>

            <input
              type="date"
              value={order.promisedAt}
              onChange={(event) =>
                updateOrder({
                  promisedAt: event.target.value,
                })
              }
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Descuento
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={order.discount}
              onChange={(event) =>
                updateOrder({
                  discount: event.target.value,
                })
              }
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500 disabled:bg-slate-100"
              placeholder="0"
            />
          </div>

          <div className="md:col-span-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Notas del pedido
            </label>

            <textarea
              value={order.notes}
              onChange={(event) =>
                updateOrder({
                  notes: event.target.value,
                })
              }
              disabled={isSubmitting}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500 disabled:bg-slate-100"
              placeholder="Indicaciones especiales del pedido..."
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          PRENDAS
      ====================================================== */}

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Prendas</h2>

            <p className="mt-1 text-sm text-slate-500">
              Agrega las prendas y los bordados que llevará cada una.
            </p>
          </div>

          <span className="text-sm text-slate-500">
            {order.items.length} {order.items.length === 1 ? "ítem" : "ítems"}
          </span>
        </div>

        <div className="space-y-4">
          {order.items.map((item) => {
            /*
             * Mientras el item todavía no tenga
             * una prenda seleccionada mostramos el
             * selector.
             */
            if (!item.garment) {
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        Prenda
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Selecciona la prenda para continuar.
                      </p>
                    </div>

                    {order.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={isSubmitting}
                        className="rounded-md px-2 py-1 text-sm text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>

                  <OrderGarmentSelector
                    value={item.garment}
                    onChange={(garment) =>
                      handleGarmentSelect(item.id, garment)
                    }
                    onCreateNew={(name) => handleCreateGarment(item.id, name)}
                    disabled={isSubmitting}
                  />

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Descripción
                      </label>

                      <input
                        value={item.description}
                        onChange={(event) =>
                          updateItem(item.id, {
                            description: event.target.value,
                          })
                        }
                        disabled={isSubmitting}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500 disabled:bg-slate-100"
                        placeholder="Ej. Polar corporativo"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Notas
                      </label>

                      <input
                        value={item.notes}
                        onChange={(event) =>
                          updateItem(item.id, {
                            notes: event.target.value,
                          })
                        }
                        disabled={isSubmitting}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500 disabled:bg-slate-100"
                        placeholder="Indicaciones..."
                      />
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <OrderItemCard
                key={item.id}
                garment={item.garment}
                quantity={item.quantity}
                logos={item.logos.map((logo) => ({
                  ...logo,
                  logoId: logo.logo?.id ?? logo.id,
                  unitPrice: logo.currentPrice,
                }))}
                customerId={order.customer?.id}
                onQuantityChange={(quantity) =>
                  handleQuantityChange(item.id, quantity)
                }
                onAddLogo={(logo) => handleAddLogo(item.id, logo)}
                onCreateNewLogo={(name) => handleCreateNewLogo(item.id, name)}
                onLogoQuantityChange={(logoId, quantity) =>
                  handleLogoQuantityChange(item.id, logoId, quantity)
                }
                onRemoveLogo={(logoId) => handleRemoveLogo(item.id, logoId)}
                onRemove={() => removeItem(item.id)}
                disabled={isSubmitting}
              />
            );
          })}
        </div>

        <button
          type="button"
          onClick={addItem}
          disabled={isSubmitting}
          className="w-full rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-medium text-slate-600 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Agregar otra prenda
        </button>
      </section>

      {/* ======================================================
          RESUMEN
      ====================================================== */}

      <OrderSummary
        itemCount={itemCount}
        garmentCount={garmentCount}
        subtotal={subtotal}
        discount={discount}
        total={total}
        status={order.status}
        onStatusChange={(status) => {
          if (status === "QUOTE" || status === "PENDING") {
            updateOrder({ status });
          }
        }}
        disabled={isSubmitting}
      />

      {/* ======================================================
          ACCIONES
      ====================================================== */}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => navigate("/orders")}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Creando pedido..."
            : order.status === "QUOTE"
              ? "Crear cotización"
              : "Crear pedido"}
        </button>
      </div>
    </form>
  );
}
