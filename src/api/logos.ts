import { apiRequest } from "./client";

import type {
  CreateLogoFilePayload,
  CreateLogoPayload,
  CreateLogoVersionPayload,
  Logo,
  LogoFile,
  LogoFilters,
  LogoListResponse,
  LogoStatus,
  LogoVersion,
  UpdateLogoPayload,
  LogoFileDownloadResponse,
} from "../types";

function buildQuery(filters: LogoFilters = {}) {
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

  if (filters.customerId) {
    params.set("customerId", filters.customerId);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export const logosApi = {
  findAll(filters: LogoFilters = {}) {
    return apiRequest<LogoListResponse>(`/logos${buildQuery(filters)}`);
  },

  findOne(id: string) {
    return apiRequest<Logo>(`/logos/${id}`);
  },

  create(payload: CreateLogoPayload) {
    return apiRequest<Logo>("/logos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: string, payload: UpdateLogoPayload) {
    return apiRequest<Logo>(`/logos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  changeStatus(id: string, status: LogoStatus) {
    return apiRequest<Logo>(`/logos/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  createVersion(logoId: string, payload: CreateLogoVersionPayload) {
    return apiRequest<LogoVersion>(`/logos/${logoId}/versions`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  uploadFile(
    logoId: string,
    versionId: string,
    file: File,
    payload: CreateLogoFilePayload,
  ) {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("type", payload.type);
    formData.append("format", payload.format);

    if (payload.isPrimary !== undefined) {
      formData.append("isPrimary", String(payload.isPrimary));
    }

    return apiRequest<LogoFile>(
      `/logos/${logoId}/versions/${versionId}/files`,
      {
        method: "POST",
        body: formData,
      },
    );
  },

  getFileDownloadUrl(logoId: string, versionId: string, fileId: string) {
    return apiRequest<LogoFileDownloadResponse>(
      `/logos/${logoId}/versions/${versionId}/files/${fileId}/download`,
    );
  },

  deleteFile(logoId: string, versionId: string, fileId: string) {
    return apiRequest<{
      message: string;
    }>(`/logos/${logoId}/versions/${versionId}/files/${fileId}`, {
      method: "DELETE",
    });
  },
};
