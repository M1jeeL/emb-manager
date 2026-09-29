import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { productionApi } from "../api/production.api";

import type {
  ChangeProductionStatusPayload,
  CreateOrderProductionPayload,
  CreateProductionJobPayload,
  ProductionFilters,
  UpdateProductionJobPayload,
} from "../types";

import { orderKeys } from "./useOrders";

export const productionKeys = {
  all: ["production"] as const,

  lists: () => [...productionKeys.all, "list"] as const,

  list: (filters: ProductionFilters) =>
    [...productionKeys.lists(), filters] as const,

  details: () => [...productionKeys.all, "detail"] as const,

  detail: (id: string) => [...productionKeys.details(), id] as const,
};

export function useProduction(filters: ProductionFilters = {}, enabled = true) {
  return useQuery({
    queryKey: productionKeys.list(filters),
    queryFn: () => productionApi.findAll(filters),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useProductionJob(id: string) {
  return useQuery({
    queryKey: productionKeys.detail(id),
    queryFn: () => productionApi.findOne(id),
    enabled: Boolean(id),
  });
}

export function useCreateProductionJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductionJobPayload) =>
      productionApi.create(payload),

    onSuccess: (job) => {
      queryClient.invalidateQueries({
        queryKey: productionKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: orderKeys.all,
      });

      queryClient.setQueryData(productionKeys.detail(job.id), job);
    },
  });
}

export function useUpdateProductionJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProductionJobPayload;
    }) => productionApi.update(id, payload),

    onSuccess: (job) => {
      queryClient.invalidateQueries({
        queryKey: productionKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: orderKeys.all,
      });

      queryClient.setQueryData(productionKeys.detail(job.id), job);
    },
  });
}

export function useChangeProductionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ChangeProductionStatusPayload;
    }) => productionApi.changeStatus(id, payload),

    onSuccess: (job) => {
      queryClient.invalidateQueries({
        queryKey: productionKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: orderKeys.all,
      });

      queryClient.setQueryData(productionKeys.detail(job.id), job);
    },
  });
}

export function useCreateOrderProduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: string;
      payload: CreateOrderProductionPayload;
    }) => productionApi.createOrderProduction(orderId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productionKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: orderKeys.all,
      });
    },
  });
}
