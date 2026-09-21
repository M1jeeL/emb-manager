import { apiRequest } from "./client";

import type {
  CreateGarmentPayload,
  Garment,
  GarmentFilters,
  GarmentListResponse,
  UpdateGarmentPayload,
} from "../types";

function buildQuery(filters: GarmentFilters = {}) {
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

  if (filters.active) {
    params.set("active", filters.active);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export const garmentsApi = {
  findAll(filters: GarmentFilters = {}) {
    return apiRequest<GarmentListResponse>(`/garments${buildQuery(filters)}`);
  },

  findOne(id: string) {
    return apiRequest<Garment>(`/garments/${id}`);
  },

  create(payload: CreateGarmentPayload) {
    return apiRequest<Garment>("/garments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: string, payload: UpdateGarmentPayload) {
    return apiRequest<Garment>(`/garments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  changeStatus(id: string, active: boolean) {
    return apiRequest<Garment>(`/garments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
    });
  },
};
