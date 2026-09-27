import { apiRequest } from "./client";

import type {
  ChangeEmployeeStatusPayload,
  CreateEmployeePayload,
  Employee,
  EmployeeFilters,
  EmployeeListResponse,
  UpdateEmployeePayload,
} from "../types";

function buildQuery(filters: EmployeeFilters = {}) {
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

  if (filters.email) {
    params.set("email", filters.email);
  }

  if (filters.phone) {
    params.set("phone", filters.phone);
  }

  if (filters.position) {
    params.set("position", filters.position);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export const employeesApi = {
  findAll(filters: EmployeeFilters = {}) {
    return apiRequest<EmployeeListResponse>(`/employees${buildQuery(filters)}`);
  },

  findOne(id: string) {
    return apiRequest<Employee>(`/employees/${id}`);
  },

  create(payload: CreateEmployeePayload) {
    return apiRequest<Employee>("/employees", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: string, payload: UpdateEmployeePayload) {
    return apiRequest<Employee>(`/employees/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  changeStatus(id: string, payload: ChangeEmployeeStatusPayload) {
    return apiRequest<Employee>(`/employees/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
