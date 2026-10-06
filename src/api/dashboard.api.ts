import { apiRequest } from "./client";

import type {
  DashboardAlertsResponse,
  DashboardCustomersResponse,
  DashboardOperationsResponse,
  DashboardOverviewResponse,
  DashboardProductionResponse,
  DashboardQuery,
  DashboardSalesResponse,
} from "../types";

function buildQuery(params: DashboardQuery = {}) {
  const searchParams = new URLSearchParams();

  if (params.from) {
    searchParams.set("from", params.from);
  }

  if (params.to) {
    searchParams.set("to", params.to);
  }

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

export const dashboardApi = {
  getOverview(params: DashboardQuery = {}) {
    return apiRequest<DashboardOverviewResponse>(
      `/dashboard/overview${buildQuery(params)}`,
    );
  },

  getSales(params: DashboardQuery = {}) {
    return apiRequest<DashboardSalesResponse>(
      `/dashboard/sales${buildQuery(params)}`,
    );
  },

  getOperations(params: DashboardQuery = {}) {
    return apiRequest<DashboardOperationsResponse>(
      `/dashboard/operations${buildQuery(params)}`,
    );
  },

  getProduction(params: DashboardQuery = {}) {
    return apiRequest<DashboardProductionResponse>(
      `/dashboard/production${buildQuery(params)}`,
    );
  },

  getCustomers(params: DashboardQuery = {}) {
    return apiRequest<DashboardCustomersResponse>(
      `/dashboard/customers${buildQuery(params)}`,
    );
  },

  getAlerts() {
    return apiRequest<DashboardAlertsResponse>("/dashboard/alerts");
  },
};
