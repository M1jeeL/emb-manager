import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  useChangeOrderStatus,
  useOrder,
  useUpdateOrder,
} from "../../../hooks/useOrders";

import { OrderDetailEditForm } from "../components/OrderDetailEditForm";
import { OrderDetailHeader } from "../components/OrderDetailHeader";
import { OrderDetailInfo } from "../components/OrderDetailInfo";
import { OrderDetailItems } from "../components/OrderDetailItems";
import { OrderDetailSummary } from "../components/OrderDetailSummary";
import { OrderStatusDialog } from "../components/OrderStatusDialog";
import { OrderStatusHistory } from "../components/OrderStatusHistory";

import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";
import { useToast } from "../../../components/ui";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const {
    data: order,
    isLoading,
    isFetching,
    isError,
    error,
  } = useOrder(id ?? "");

  const updateOrder = useUpdateOrder(id ?? "");
  const changeStatus = useChangeOrderStatus(id ?? "");

  if (!id) {
    return (
      <PageError
        title="Orden inválida"
        message="No se recibió el identificador de la orden."
        onBack={() => navigate("/orders")}
      />
    );
  }

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (isError || !order) {
    return (
      <PageError
        title="No pudimos cargar la orden"
        message={
          isError
            ? getApiErrorMessage(error)
            : "La orden no existe o ya no está disponible."
        }
        onBack={() => navigate("/orders")}
      />
    );
  }

  async function handleUpdateOrder(data: {
    promisedAt?: string | null;
    discount?: string;
    notes?: string | null;
  }) {
    try {
      await updateOrder.mutateAsync(data);

      setIsEditing(false);

      toast.success(
        "Pedido actualizado",
        "Los cambios fueron guardados correctamente.",
      );
    } catch (error) {
      toast.error("No se pudo actualizar", getApiErrorMessage(error));

      throw error;
    }
  }

  async function handleChangeStatus(
    status: typeof order.status,
    notes?: string,
  ) {
    try {
      await changeStatus.mutateAsync({
        status,
        notes,
      });

      setIsStatusDialogOpen(false);

      toast.success(
        "Estado actualizado",
        "El nuevo estado quedó registrado en el historial.",
      );
    } catch (error) {
      toast.error("No se pudo cambiar el estado", getApiErrorMessage(error));
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <OrderDetailHeader
        order={order}
        onBack={() => navigate("/orders")}
        onEdit={() => setIsEditing((current) => !current)}
        onChangeStatus={() => setIsStatusDialogOpen(true)}
        disabled={isFetching}
      />

      {isFetching && !isLoading && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm text-blue-700">
          Actualizando información del pedido...
        </div>
      )}

      {isEditing ? (
        <OrderDetailEditForm
          order={order}
          loading={updateOrder.isPending}
          error={
            updateOrder.isError ? getApiErrorMessage(updateOrder.error) : null
          }
          onCancel={() => setIsEditing(false)}
          onSubmit={handleUpdateOrder}
        />
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <OrderDetailInfo order={order} />
              <OrderDetailItems order={order} />
            </div>

            <div className="space-y-6">
              <OrderDetailSummary order={order} />

              <OrderStatusHistory order={order} />
            </div>
          </div>
        </>
      )}

      <OrderStatusDialog
        currentStatus={order.status}
        open={isStatusDialogOpen}
        loading={changeStatus.isPending}
        onClose={() => setIsStatusDialogOpen(false)}
        onConfirm={handleChangeStatus}
      />
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-8 w-72 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-100" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard height="h-96" />
        </div>

        <div className="space-y-6">
          <SkeletonCard height="h-72" />
          <SkeletonCard height="h-64" />
        </div>
      </div>
    </div>
  );
}

function SkeletonCard({ height = "h-48" }: { height?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-slate-200 bg-white ${height}`}
    />
  );
}

function PageError({
  title,
  message,
  onBack,
}: {
  title: string;
  message: string;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center justify-center px-4">
      <div className="w-full rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          !
        </div>

        <h1 className="mt-4 text-lg font-semibold text-slate-900">{title}</h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>

        <button
          type="button"
          onClick={onBack}
          className="mt-5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Volver a pedidos
        </button>
      </div>
    </div>
  );
}
