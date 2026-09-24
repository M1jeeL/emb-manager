import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { ordersApi } from "../api/orders.api";

import type {
  ChangeOrderStatusPayload,
  CreateOrderPayload,
  OrderFilters,
  UpdateOrderPayload,
} from "../types";

/* ============================================================
 * QUERY KEYS
 * ============================================================ */

export const orderKeys = {
  all: ["orders"] as const,

  lists: () => [...orderKeys.all, "list"] as const,

  list: (filters: OrderFilters) => [...orderKeys.lists(), filters] as const,

  details: () => [...orderKeys.all, "detail"] as const,

  detail: (id: string) => [...orderKeys.details(), id] as const,
};

/* ============================================================
 * FIND ALL
 * ============================================================ */

export function useOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: orderKeys.list(filters),

    queryFn: () => ordersApi.findAll(filters),

    placeholderData: keepPreviousData,
  });
}

/* ============================================================
 * FIND ONE
 * ============================================================ */

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),

    queryFn: () => ordersApi.findOne(id),

    enabled: Boolean(id),
  });
}

/* ============================================================
 * CREATE
 * ============================================================ */

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersApi.create(payload),

    onSuccess: (order) => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.lists(),
      });

      queryClient.setQueryData(orderKeys.detail(order.id), order);
    },
  });
}

/* ============================================================
 * UPDATE
 * ============================================================ */

export function useUpdateOrder(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateOrderPayload) => ordersApi.update(id, payload),

    onSuccess: (order) => {
      queryClient.setQueryData(orderKeys.detail(order.id), order);

      queryClient.invalidateQueries({
        queryKey: orderKeys.lists(),
      });
    },
  });
}

/* ============================================================
 * CHANGE STATUS
 * ============================================================ */

export function useChangeOrderStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChangeOrderStatusPayload) =>
      ordersApi.changeStatus(id, payload),

    onSuccess: (order) => {
      queryClient.setQueryData(orderKeys.detail(order.id), order);

      queryClient.invalidateQueries({
        queryKey: orderKeys.lists(),
      });
    },
  });
}
