import { API_URL, apiRequest, refreshSession, setAccessToken } from "./client";
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
    }).then((response) => {
      setAccessToken(response.accessToken);
      return response;
    });
  },

  async refresh() {
    const data = await refreshSession();
    if (!data) throw new Error("La sesión venció");
    return data;
  },

  async logout() {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } finally {
      setAccessToken(null);
    }
  },

  me() {
    return apiRequest<MeResponse>("/auth/me");
  },
};
