import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { machinesApi } from "../api/machines.api";

import type {
  ChangeMachineStatusPayload,
  CreateMachinePayload,
  MachineFilters,
  UpdateMachinePayload,
} from "../types";

export const machineKeys = {
  all: ["machines"] as const,

  lists: () => [...machineKeys.all, "list"] as const,

  list: (filters: MachineFilters) => [...machineKeys.lists(), filters] as const,

  details: () => [...machineKeys.all, "detail"] as const,

  detail: (id: string) => [...machineKeys.details(), id] as const,
};

export function useMachines(filters: MachineFilters = {}) {
  return useQuery({
    queryKey: machineKeys.list(filters),
    queryFn: () => machinesApi.findAll(filters),
    placeholderData: keepPreviousData,
  });
}

export function useMachine(id: string) {
  return useQuery({
    queryKey: machineKeys.detail(id),
    queryFn: () => machinesApi.findOne(id),
    enabled: Boolean(id),
  });
}

export function useCreateMachine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMachinePayload) => machinesApi.create(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: machineKeys.all,
      });
    },
  });
}

export function useUpdateMachine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateMachinePayload;
    }) => machinesApi.update(id, payload),

    onSuccess: (machine) => {
      queryClient.invalidateQueries({
        queryKey: machineKeys.all,
      });

      queryClient.setQueryData(machineKeys.detail(machine.id), machine);
    },
  });
}

export function useChangeMachineStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ChangeMachineStatusPayload;
    }) => machinesApi.changeStatus(id, payload),

    onSuccess: (machine) => {
      queryClient.invalidateQueries({
        queryKey: machineKeys.all,
      });

      queryClient.setQueryData(machineKeys.detail(machine.id), machine);
    },
  });
}
