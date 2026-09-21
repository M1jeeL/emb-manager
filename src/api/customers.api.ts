import { apiRequest } from "./client";

import type {
  CreateCustomerPayload,
  Customer,
  CustomerFilters,
  CustomerListResponse,
  UpdateCustomerPayload,
  CustomerStatus,
} from "../types";

function buildQuery(filters: CustomerFilters = {}) {
  const params = new URLSearchParams();

  if (filters.page) {
    params.set("page", String(filters.page));
  }

  if (filters.limit) {
    params.set("limit", String(filters.limit));
  }

  if (filters.name) {
    params.set("name", filters.name);
  }

  if (filters.companyName) {
    params.set("companyName", filters.companyName);
  }

  if (filters.phone) {
    params.set("phone", filters.phone);
  }

  if (filters.email) {
    params.set("email", filters.email);
  }

  if (filters.taxId) {
    params.set("taxId", filters.taxId);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export const customersApi = {
  findAll(filters: CustomerFilters = {}) {
    return apiRequest<CustomerListResponse>(`/customers${buildQuery(filters)}`);
  },

  findOne(id: string) {
    return apiRequest<Customer>(`/customers/${id}`);
  },

  create(payload: CreateCustomerPayload) {
    return apiRequest<Customer>("/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: string, payload: UpdateCustomerPayload) {
    return apiRequest<Customer>(`/customers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  changeStatus(id: string, status: CustomerStatus) {
    return apiRequest<Customer>(`/customers/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};
