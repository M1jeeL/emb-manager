import type { Garment, Logo } from "../../../types";

import { OrderLogoSelector } from "./OrderLogoSelector";
import { OrderItemLogoRow } from "./OrderItemLogoRow";

export interface OrderBuilderLogo {
  id: string;

  logoId: string;

  name: string;

  unitPrice: string;

  quantity: number;
}

interface OrderItemCardProps {
  garment: Garment;

  quantity: number;

  logos: OrderBuilderLogo[];

  customerId?: string;

  onQuantityChange: (quantity: number) => void;

  onAddLogo: (logo: Logo) => void;

  onCreateNewLogo: (name: string) => void;

  onLogoQuantityChange: (logoId: string, quantity: number) => void;

  onRemoveLogo: (logoId: string) => void;

  onRemove: () => void;

  disabled?: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function OrderItemCard({
  garment,
  quantity,
  logos,
  customerId,
  onQuantityChange,
  onAddLogo,
  onCreateNewLogo,
  onLogoQuantityChange,
  onRemoveLogo,
  onRemove,
  disabled = false,
}: OrderItemCardProps) {
  const logosSubtotal = logos.reduce(
    (total, logo) => total + Number(logo.unitPrice) * logo.quantity,
    0,
  );

  const subtotal = logosSubtotal;

  function decreaseQuantity() {
    if (quantity <= 1) return;

    const nextQuantity = quantity - 1;

    onQuantityChange(nextQuantity);

    logos.forEach((logo) => {
      if (logo.quantity > nextQuantity) {
        onLogoQuantityChange(logo.id, nextQuantity);
      }
    });
  }

  function increaseQuantity() {
    onQuantityChange(quantity + 1);
  }

  const selectedLogoIds = logos.map((logo) => logo.logoId);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {garment.name}
            </h3>

            {garment.description && (
              <p className="mt-1 text-sm text-slate-500">
                {garment.description}
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={onRemove}
            className="rounded-md px-2 py-1 text-sm text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Eliminar
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Cantidad</span>

          <div className="flex items-center rounded-lg border border-slate-200">
            <button
              type="button"
              disabled={disabled || quantity <= 1}
              onClick={decreaseQuantity}
              className="px-3 py-1.5 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              −
            </button>

            <span className="min-w-10 text-center text-sm font-semibold text-slate-900">
              {quantity}
            </span>

            <button
              type="button"
              disabled={disabled}
              onClick={increaseQuantity}
              className="px-3 py-1.5 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Bordados</h4>

            <p className="mt-0.5 text-xs text-slate-500">
              Agrega los bordados que llevará esta prenda.
            </p>
          </div>

          <span className="text-xs text-slate-500">
            {logos.length} {logos.length === 1 ? "bordado" : "bordados"}
          </span>
        </div>

        <div className="space-y-2">
          {logos.length === 0 ? (
            <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3 text-sm text-amber-700">
              Esta prenda todavía no tiene ningún bordado.
            </div>
          ) : (
            logos.map((logo) => (
              <OrderItemLogoRow
                key={logo.id}
                logo={{
                  id: logo.id,
                  name: logo.name,
                  unitPrice: logo.unitPrice,
                  quantity: logo.quantity,
                }}
                maxQuantity={quantity}
                onQuantityChange={(nextQuantity) =>
                  onLogoQuantityChange(logo.id, nextQuantity)
                }
                onRemove={() => onRemoveLogo(logo.id)}
                disabled={disabled}
              />
            ))
          )}
        </div>

        <div className="mt-3">
          <OrderLogoSelector
            customerId={customerId}
            itemQuantity={quantity}
            selectedLogoIds={selectedLogoIds}
            onSelect={onAddLogo}
            onCreateNew={onCreateNewLogo}
            disabled={disabled}
          />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="text-sm font-medium text-slate-600">
            Subtotal de la prenda
          </span>

          <span className="text-base font-bold text-slate-900">
            {formatCurrency(subtotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
