import { apiRequest } from "./client";

import type {
  CreatePaymentPayload,
  Payment,
  PaymentAvailableOrder,
  PaymentFilters,
  PaymentListResponse,
} from "../types";

function buildQuery(filters: PaymentFilters = {}) {
  const params = new URLSearchParams();

  if (filters.page) {
    params.set("page", String(filters.page));
  }

  if (filters.limit) {
    params.set("limit", String(filters.limit));
  }

  if (filters.orderId) {
    params.set("orderId", filters.orderId);
  }

  if (filters.orderNumber) {
    params.set("orderNumber", String(filters.orderNumber));
  }

  if (filters.method) {
    params.set("method", filters.method);
  }

  if (filters.from) {
    params.set("from", filters.from);
  }

  if (filters.to) {
    params.set("to", filters.to);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export const paymentsApi = {
  findAll(filters: PaymentFilters = {}) {
    return apiRequest<PaymentListResponse>(`/payments${buildQuery(filters)}`);
  },

  findOne(id: string) {
    return apiRequest<Payment>(`/payments/${id}`);
  },

  findAvailableOrders() {
    return apiRequest<PaymentAvailableOrder[]>("/payments/available-orders");
  },

  create(payload: CreatePaymentPayload) {
    return apiRequest<Payment>("/payments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
