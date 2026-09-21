import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { customersApi } from "../api/customers.api";

import type {
  CreateCustomerPayload,
  CustomerFilters,
  CustomerStatus,
  UpdateCustomerPayload,
} from "../types";

export function useCustomers(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: ["customers", filters],
    queryFn: () => customersApi.findAll(filters),
    placeholderData: keepPreviousData,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) =>
      customersApi.create(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCustomerPayload;
    }) => customersApi.update(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
    },
  });
}

export function useChangeCustomerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CustomerStatus }) =>
      customersApi.changeStatus(id, status),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
    },
  });
}
