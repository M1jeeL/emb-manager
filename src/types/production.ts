export type ProductionJobStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED";

export interface ProductionCustomer {
  id: string;
  name: string;
  companyName: string | null;
}

export interface ProductionGarment {
  id: string;
  name: string;
}

export interface ProductionOrder {
  id: string;
  orderNumber: number;
  status: string;
  customer: ProductionCustomer;
  items: ProductionOrderItem[];
}

export interface ProductionOrderItemLogo {
  id: string;
  orderItemId: string;
  logoId: string;
  logoName: string;
  unitPrice: string;
  quantity: number;
  notes: string | null;
}

export interface ProductionOrderItem {
  id: string;
  orderId: string;
  garmentId: string;
  description: string | null;
  quantity: number;
  subtotal: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;

  garment: ProductionGarment;
  logos: ProductionOrderItemLogo[];
}

export interface ProductionMachine {
  id: string;
  name: string;
  code: string | null;
  type: string;
  status: string;
}

export interface ProductionEmployee {
  id: string;
  firstName: string;
  lastName: string;
  position: string | null;
  status: string;
}

export interface ProductionJob {
  id: string;

  orderId: string;
  orderItemId: string;
  orderItemLogoId: string | null;

  machineId: string | null;
  employeeId: string | null;

  status: ProductionJobStatus;

  quantity: number;

  startedAt: string | null;
  completedAt: string | null;

  notes: string | null;

  createdAt: string;
  updatedAt: string;

  order: ProductionOrder;
  orderItem: ProductionOrderItem;
  orderItemLogo: ProductionOrderItemLogo | null;

  machine: ProductionMachine | null;
  employee: ProductionEmployee | null;
}

export interface ProductionListResponse {
  data: ProductionJob[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductionFilters {
  page?: number;
  limit?: number;
  status?: ProductionJobStatus;
  orderNumber?: number;
  orderId?: string;
  orderItemId?: string;
  machineId?: string;
  employeeId?: string;
}

export interface CreateProductionJobPayload {
  orderId: string;
  orderItemId: string;
  orderItemLogoId?: string;
  machineId?: string;
  employeeId?: string;
  quantity: number;
  notes?: string;
}

export interface UpdateProductionJobPayload {
  orderItemLogoId?: string | null;
  machineId?: string | null;
  employeeId?: string | null;
  quantity?: number;
  notes?: string | null;
}

export interface ChangeProductionStatusPayload {
  status: ProductionJobStatus;
}

export interface CreateOrderProductionPayload {
  machineId?: string;
  employeeId?: string;
  notes?: string;
}

export interface CreateOrderProductionResponse {
  orderId: string;
  createdCount: number;
  jobs: ProductionJob[];
}

export interface ProductionAvailableOrderCustomer {
  id: string;
  name: string;
  companyName: string | null;
}

export interface ProductionAvailableOrder {
  id: string;
  orderNumber: number;
  promisedAt: string | null;
  customer: ProductionAvailableOrderCustomer;
}

export interface CreateOrderProductionPayload {
  machineId?: string;
  employeeId?: string;
  notes?: string;
}

export interface CreateOrderProductionResponse {
  orderId: string;
  createdCount: number;
  productionJobs: ProductionJob[];
}
