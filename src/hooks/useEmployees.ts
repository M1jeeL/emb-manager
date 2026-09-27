import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { employeesApi } from "../api/employees.api";

import type {
  ChangeEmployeeStatusPayload,
  CreateEmployeePayload,
  EmployeeFilters,
  UpdateEmployeePayload,
} from "../types";

export const employeeKeys = {
  all: ["employees"] as const,

  lists: () => [...employeeKeys.all, "list"] as const,

  list: (filters: EmployeeFilters) =>
    [...employeeKeys.lists(), filters] as const,

  details: () => [...employeeKeys.all, "detail"] as const,

  detail: (id: string) => [...employeeKeys.details(), id] as const,
};

export function useEmployees(filters: EmployeeFilters = {}) {
  return useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: () => employeesApi.findAll(filters),
    placeholderData: keepPreviousData,
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeesApi.findOne(id),
    enabled: Boolean(id),
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEmployeePayload) =>
      employeesApi.create(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.all,
      });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateEmployeePayload;
    }) => employeesApi.update(id, payload),

    onSuccess: (employee) => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.all,
      });

      queryClient.setQueryData(employeeKeys.detail(employee.id), employee);
    },
  });
}

export function useChangeEmployeeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ChangeEmployeeStatusPayload;
    }) => employeesApi.changeStatus(id, payload),

    onSuccess: (employee) => {
      queryClient.invalidateQueries({
        queryKey: employeeKeys.all,
      });

      queryClient.setQueryData(employeeKeys.detail(employee.id), employee);
    },
  });
}
