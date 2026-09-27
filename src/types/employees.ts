export type EmployeeStatus = "ACTIVE" | "INACTIVE";

export interface EmployeeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  active: boolean;
}

export interface Employee {
  id: string;
  organizationId: string;
  userId: string | null;

  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  position: string | null;

  status: EmployeeStatus;
  notes: string | null;

  createdAt: string;
  updatedAt: string;

  user: EmployeeUser | null;

  _count: {
    productionJobs: number;
  };
}

export interface EmployeeListResponse {
  data: Employee[];

  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EmployeeFilters {
  page?: number;
  limit?: number;
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  status?: EmployeeStatus;
}

export interface CreateEmployeePayload {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  position?: string;
  notes?: string;
}

export interface UpdateEmployeePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  position?: string;
  notes?: string;
}

export interface ChangeEmployeeStatusPayload {
  status: EmployeeStatus;
}
