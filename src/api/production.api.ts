import { apiRequest } from "./client";

import type {
  ChangeProductionStatusPayload,
  CreateOrderProductionPayload,
  CreateOrderProductionResponse,
  CreateProductionJobPayload,
  ProductionFilters,
  ProductionJob,
  ProductionListResponse,
  UpdateProductionJobPayload,
} from "../types";

function buildQuery(filters: ProductionFilters = {}) {
  const params = new URLSearchParams();

  if (filters.page) {
    params.set("page", String(filters.page));
  }

  if (filters.limit) {
    params.set("limit", String(filters.limit));
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.orderNumber) {
    params.set("orderNumber", String(filters.orderNumber));
  }

  if (filters.orderId) {
    params.set("orderId", filters.orderId);
  }

  if (filters.orderItemId) {
    params.set("orderItemId", filters.orderItemId);
  }

  if (filters.machineId) {
    params.set("machineId", filters.machineId);
  }

  if (filters.employeeId) {
    params.set("employeeId", filters.employeeId);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export const productionApi = {
  findAll(filters: ProductionFilters = {}) {
    return apiRequest<ProductionListResponse>(
      `/production${buildQuery(filters)}`,
    );
  },

  findOne(id: string) {
    return apiRequest<ProductionJob>(`/production/${id}`);
  },

  create(payload: CreateProductionJobPayload) {
    return apiRequest<ProductionJob>("/production", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: string, payload: UpdateProductionJobPayload) {
    return apiRequest<ProductionJob>(`/production/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  changeStatus(id: string, payload: ChangeProductionStatusPayload) {
    return apiRequest<ProductionJob>(`/production/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  createOrderProduction(
    orderId: string,
    payload: CreateOrderProductionPayload,
  ) {
    return apiRequest<CreateOrderProductionResponse>(
      `/production/orders/${orderId}`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },
};
