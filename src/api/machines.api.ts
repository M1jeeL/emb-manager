import { apiRequest } from "./client";

import type {
  ChangeMachineStatusPayload,
  CreateMachinePayload,
  Machine,
  MachineFilters,
  MachineListResponse,
  UpdateMachinePayload,
} from "../types";

function buildQuery(filters: MachineFilters = {}) {
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

  if (filters.code) {
    params.set("code", filters.code);
  }

  if (filters.type) {
    params.set("type", filters.type);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.brand) {
    params.set("brand", filters.brand);
  }

  if (filters.model) {
    params.set("model", filters.model);
  }

  if (filters.serialNumber) {
    params.set("serialNumber", filters.serialNumber);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export const machinesApi = {
  findAll(filters: MachineFilters = {}) {
    return apiRequest<MachineListResponse>(`/machines${buildQuery(filters)}`);
  },

  findOne(id: string) {
    return apiRequest<Machine>(`/machines/${id}`);
  },

  create(payload: CreateMachinePayload) {
    return apiRequest<Machine>("/machines", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: string, payload: UpdateMachinePayload) {
    return apiRequest<Machine>(`/machines/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  changeStatus(id: string, payload: ChangeMachineStatusPayload) {
    return apiRequest<Machine>(`/machines/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
