export type CustomerStatus = "ACTIVE" | "INACTIVE";

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  taxId: string | null;
  companyName: string | null;
  address: string | null;
  city: string | null;
  status: CustomerStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListResponse {
  data: Customer[];

  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  name?: string;
  companyName?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  status?: CustomerStatus;
}

export interface CreateCustomerPayload {
  name: string;
  email?: string;
  phone?: string;
  taxId?: string;
  companyName?: string;
  address?: string;
  city?: string;
  notes?: string;
}

export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;
