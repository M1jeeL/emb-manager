import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { garmentsApi } from "../api/garments.api";

import type {
  CreateGarmentPayload,
  GarmentFilters,
  UpdateGarmentPayload,
} from "../types/garment";

export function useGarments(filters: GarmentFilters = {}) {
  return useQuery({
    queryKey: ["garments", filters],
    queryFn: () => garmentsApi.findAll(filters),
    placeholderData: keepPreviousData,
  });
}

export function useGarment(id: string) {
  return useQuery({
    queryKey: ["garment", id],
    queryFn: () => garmentsApi.findOne(id),
    enabled: Boolean(id),
  });
}

export function useCreateGarment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGarmentPayload) => garmentsApi.create(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["garments"],
      });
    },
  });
}

export function useUpdateGarment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateGarmentPayload;
    }) => garmentsApi.update(id, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["garments"],
      });

      queryClient.invalidateQueries({
        queryKey: ["garment", variables.id],
      });
    },
  });
}

export function useUpdateGarmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      garmentsApi.changeStatus(id, active),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["garments"],
      });

      queryClient.invalidateQueries({
        queryKey: ["garment", variables.id],
      });
    },
  });
}
