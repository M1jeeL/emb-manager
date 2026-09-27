export type MachineStatus = "ACTIVE" | "MAINTENANCE" | "INACTIVE";

export type MachineType = "EMBROIDERY" | "MULTIHEAD" | "SINGLEHEAD" | "OTHER";

export interface Machine {
  id: string;
  organizationId: string;

  name: string;
  code: string | null;

  type: MachineType;
  status: MachineStatus;

  brand: string | null;
  model: string | null;
  serialNumber: string | null;

  needleCount: number | null;
  headCount: number | null;

  notes: string | null;

  createdAt: string;
  updatedAt: string;

  _count: {
    productionJobs: number;
  };
}

export interface MachineListResponse {
  data: Machine[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MachineFilters {
  page?: number;
  limit?: number;

  name?: string;
  code?: string;
  type?: MachineType;
  status?: MachineStatus;
  brand?: string;
  model?: string;
  serialNumber?: string;
}

export interface CreateMachinePayload {
  name: string;
  code?: string;
  type?: MachineType;
  brand?: string;
  model?: string;
  serialNumber?: string;
  needleCount?: number;
  headCount?: number;
  notes?: string;
}

export interface UpdateMachinePayload {
  name?: string;
  code?: string;
  type?: MachineType;
  brand?: string;
  model?: string;
  serialNumber?: string;
  needleCount?: number;
  headCount?: number;
  notes?: string;
}

export interface ChangeMachineStatusPayload {
  status: MachineStatus;
}
