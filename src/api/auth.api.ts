import { apiRequest } from "./client";
import type { LoginResponse, MeResponse } from "../auth/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  login(payload: LoginPayload) {
    return apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  me() {
    return apiRequest<MeResponse>("/auth/me");
  },
};
