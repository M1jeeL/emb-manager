export type UserRole = "OWNER" | "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface AuthUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  active: boolean;
  organizationId: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface MeResponse {
  user: AuthUser;
}
