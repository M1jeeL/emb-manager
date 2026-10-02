import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { paymentsApi } from "../api/payments.api";

import type { CreatePaymentPayload, PaymentFilters } from "../types";

import { orderKeys } from "./useOrders";

export const paymentKeys = {
  all: ["payments"] as const,

  lists: () => [...paymentKeys.all, "list"] as const,

  list: (filters: PaymentFilters) => [...paymentKeys.lists(), filters] as const,

  details: () => [...paymentKeys.all, "detail"] as const,

  detail: (id: string) => [...paymentKeys.details(), id] as const,

  availableOrders: () => [...paymentKeys.all, "available-orders"] as const,
};

export function usePayments(filters: PaymentFilters) {
  return useQuery({
    queryKey: paymentKeys.list(filters),

    queryFn: () => paymentsApi.findAll(filters),

    placeholderData: keepPreviousData,
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: paymentKeys.detail(id),

    queryFn: () => paymentsApi.findOne(id),

    enabled: Boolean(id),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePaymentPayload) => paymentsApi.create(payload),

    onSuccess: (payment) => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: paymentKeys.availableOrders(),
      });

      queryClient.invalidateQueries({
        queryKey: orderKeys.all,
      });

      queryClient.setQueryData(paymentKeys.detail(payment.id), payment);
    },
  });
}

export function useAvailablePaymentOrders() {
  return useQuery({
    queryKey: paymentKeys.availableOrders(),
    queryFn: () => paymentsApi.findAvailableOrders(),
  });
}
