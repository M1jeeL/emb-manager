import { apiRequest } from "./client";

import type {
  ChangeOrderStatusPayload,
  CreateOrderPayload,
  OrderDetail,
  OrderFilters,
  OrderListResponse,
  UpdateOrderPayload,
} from "../types";

function buildQueryString(filters: OrderFilters = {}) {
  const params = new URLSearchParams();

  if (filters.page !== undefined) {
    params.set("page", String(filters.page));
  }

  if (filters.limit !== undefined) {
    params.set("limit", String(filters.limit));
  }

  if (filters.orderNumber !== undefined) {
    params.set("orderNumber", String(filters.orderNumber));
  }

  if (filters.customerId) {
    params.set("customerId", filters.customerId);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.paymentStatus) {
    params.set("paymentStatus", filters.paymentStatus);
  }

  if (filters.orderedFrom) {
    params.set("orderedFrom", filters.orderedFrom);
  }

  if (filters.orderedTo) {
    params.set("orderedTo", filters.orderedTo);
  }

  if (filters.promisedFrom) {
    params.set("promisedFrom", filters.promisedFrom);
  }

  if (filters.promisedTo) {
    params.set("promisedTo", filters.promisedTo);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export const ordersApi = {
  /* ============================================================
   * FIND ALL
   * ============================================================ */

  findAll(filters: OrderFilters = {}) {
    return apiRequest<OrderListResponse>(`/orders${buildQueryString(filters)}`);
  },

  /* ============================================================
   * FIND ONE
   * ============================================================ */

  findOne(id: string) {
    return apiRequest<OrderDetail>(`/orders/${id}`);
  },

  /* ============================================================
   * CREATE
   * ============================================================ */

  create(payload: CreateOrderPayload) {
    return apiRequest<OrderDetail>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /* ============================================================
   * UPDATE
   * ============================================================ */

  update(id: string, payload: UpdateOrderPayload) {
    return apiRequest<OrderDetail>(`/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /* ============================================================
   * CHANGE STATUS
   * ============================================================ */

  changeStatus(id: string, payload: ChangeOrderStatusPayload) {
    return apiRequest<OrderDetail>(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
