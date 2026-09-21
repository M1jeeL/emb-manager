import { useState } from "react";
import type { CreateOrderItemInput } from "../api/useCreateOrder";
import { useCreateOrder } from "../api/useCreateOrder";
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export function CreateOrderPage() {
  const ORGANIZATION_ID = "92feb484-c0b9-4825-9222-e2f70000bb9a"; // Reemplazar con context/session id
  const createOrderMutation = useCreateOrder();

  const [customerId, setCustomerId] = useState("");
  const [promisedAt, setPromisedAt] = useState("");
  const [notes, setNotes] = useState("");

  // Estado dinámico para los items del pedido
  const [items, setItems] = useState<CreateOrderItemInput[]>([
    {
      garmentId: "",
      quantity: 1,
      unitPrice: 0,
      description: "",
      logos: [],
    },
  ]);

  console.log(items);

  // Manejadores para items
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { garmentId: "", quantity: 1, unitPrice: 0, description: "", logos: [] },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof CreateOrderItemInput,
    value: any,
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Manejadores para logos dentro de un item
  const handleAddLogo = (itemIndex: number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[itemIndex].logos.push({
        logoId: `logo-${Date.now()}`,
        logoName: "",
        unitPrice: 0,
        placement: "Pecho Izquierdo",
      });
      return [...updated];
    });
  };

  const handleRemoveLogo = (itemIndex: number, logoIndex: number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[itemIndex].logos = updated[itemIndex].logos.filter(
        (_, i) => i !== logoIndex,
      );
      return [...updated];
    });
  };

  // Cálculo del total estimado en tiempo real
  const calculateTotal = () => {
    return items.reduce((acc, item) => {
      const garmentTotal = item.quantity * item.unitPrice;
      const logosTotal = item.logos.reduce(
        (lAcc, logo) => lAcc + item.quantity * logo.unitPrice,
        0,
      );
      return acc + garmentTotal + logosTotal;
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      alert("Por favor selecciona un cliente.");
      return;
    }

    createOrderMutation.mutate({
      organizationId: ORGANIZATION_ID,
      customerId,
      promisedAt: promisedAt || undefined,
      notes: notes || undefined,
      items,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/pedidos"
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Pedido</h1>
          <p className="text-sm text-slate-500">
            Ingresa los detalles del trabajo e ítems a confeccionar
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos generales */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-xs">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              ID del Cliente
            </label>
            <input
              type="text"
              placeholder="Ej: client-uuid-123"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Fecha Prometida de Entrega
            </label>
            <input
              type="date"
              value={promisedAt}
              onChange={(e) => setPromisedAt(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Notas u Observaciones
            </label>
            <textarea
              rows={2}
              placeholder="Detalles sobre empaque, hilo especial, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Prendas y Logos */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">
              Prendas / Ítems
            </h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" /> Agregar Prenda
            </button>
          </div>

          {items.map((item, itemIdx) => (
            <div
              key={itemIdx}
              className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 shadow-xs"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      ID Prenda
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: garment-polo-01"
                      value={item.garmentId}
                      onChange={(e) =>
                        handleItemChange(itemIdx, "garmentId", e.target.value)
                      }
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          itemIdx,
                          "quantity",
                          Number(e.target.value),
                        )
                      }
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Precio Unit. Prenda ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(
                          itemIdx,
                          "unitPrice",
                          Number(e.target.value),
                        )
                      }
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                      required
                    />
                  </div>
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(itemIdx)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Sección de Logos por prenda */}
              <div className="bg-slate-50 p-4 rounded-lg space-y-3 border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    Logos a Bordar
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddLogo(itemIdx)}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    + Agregar Logo
                  </button>
                </div>

                {item.logos.map((logo, logoIdx) => (
                  <div key={logoIdx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Nombre del logo / Matriz"
                      value={logo.logoName}
                      onChange={(e) => {
                        const updatedLogos = [...item.logos];
                        updatedLogos[logoIdx].logoName = e.target.value;
                        handleItemChange(itemIdx, "logos", updatedLogos);
                      }}
                      className="flex-1 bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Ubicación (ej: Pecho Izq)"
                      value={logo.placement}
                      onChange={(e) => {
                        const updatedLogos = [...item.logos];
                        updatedLogos[logoIdx].placement = e.target.value;
                        handleItemChange(itemIdx, "logos", updatedLogos);
                      }}
                      className="w-32 bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Precio Bordado"
                      value={logo.unitPrice}
                      onChange={(e) => {
                        const updatedLogos = [...item.logos];
                        updatedLogos[logoIdx].unitPrice = Number(
                          e.target.value,
                        );
                        handleItemChange(itemIdx, "logos", updatedLogos);
                      }}
                      className="w-24 bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveLogo(itemIdx, logoIdx)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Resumen y Botón de envío */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xs">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase block">
              Total Estimado
            </span>
            <span className="text-3xl font-bold text-slate-900">
              ${calculateTotal().toLocaleString("es-CL")}
            </span>
          </div>

          <button
            type="submit"
            disabled={createOrderMutation.isPending}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-xs"
          >
            {createOrderMutation.isPending && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {createOrderMutation.isPending ? "Guardando..." : "Crear Pedido"}
          </button>
        </div>
      </form>
    </div>
  );
}
