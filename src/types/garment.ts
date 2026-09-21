export interface Garment {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GarmentListResponse {
  data: Garment[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GarmentFilters {
  page?: number;
  limit?: number;
  name?: string;
  description?: string;
  active?: string;
}

export interface CreateGarmentPayload {
  name: string;
  description?: string;
}

export interface UpdateGarmentPayload {
  name?: string;
  description?: string;
}

export interface UpdateGarmentStatusPayload {
  active: boolean;
}
