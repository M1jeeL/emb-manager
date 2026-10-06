import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { dashboardApi } from "../api/dashboard.api";

import type { DashboardQuery } from "../types";

export function useDashboardOverview(params: DashboardQuery = {}) {
  return useQuery({
    queryKey: ["dashboard", "overview", params],
    queryFn: () => dashboardApi.getOverview(params),
    placeholderData: keepPreviousData,
  });
}

export function useDashboardSales(params: DashboardQuery = {}) {
  return useQuery({
    queryKey: ["dashboard", "sales", params],
    queryFn: () => dashboardApi.getSales(params),
    placeholderData: keepPreviousData,
  });
}

export function useDashboardOperations(params: DashboardQuery = {}) {
  return useQuery({
    queryKey: ["dashboard", "operations", params],
    queryFn: () => dashboardApi.getOperations(params),
    placeholderData: keepPreviousData,
  });
}

export function useDashboardProduction(params: DashboardQuery = {}) {
  return useQuery({
    queryKey: ["dashboard", "production", params],
    queryFn: () => dashboardApi.getProduction(params),
    placeholderData: keepPreviousData,
  });
}

export function useDashboardCustomers(params: DashboardQuery = {}) {
  return useQuery({
    queryKey: ["dashboard", "customers", params],
    queryFn: () => dashboardApi.getCustomers(params),
    placeholderData: keepPreviousData,
  });
}

export function useDashboardAlerts() {
  return useQuery({
    queryKey: ["dashboard", "alerts"],
    queryFn: () => dashboardApi.getAlerts(),
  });
}
