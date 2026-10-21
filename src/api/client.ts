import type { AuthUser } from '../auth/types';

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
let accessToken: string | null = null;
let refreshInFlight: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export interface RefreshedSession {
  accessToken: string;
  user: AuthUser;
}

export async function refreshSession(): Promise<RefreshedSession | null> {
  const refresh = async () => {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as RefreshedSession;
    setAccessToken(data.accessToken);
    return data;
  };
  const lockManager = (navigator as Navigator & { locks?: LockManager }).locks;
  return lockManager ? lockManager.request('emb-manager-refresh', refresh) : refresh();
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = refreshSession().then((data) => data?.accessToken ?? null).catch(() => null).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

interface ApiError {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

export class ApiRequestError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();

  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const request = (authorization?: string | null) => {
    const requestHeaders = new Headers(headers);
    if (authorization) requestHeaders.set('Authorization', `Bearer ${authorization}`);
    else requestHeaders.delete('Authorization');
    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: requestHeaders,
    });
  };

  let response = await request(token);
  if (response.status === 401 && !endpoint.startsWith('/auth/')) {
    const refreshed = await refreshAccessToken();
    if (refreshed) response = await request(refreshed);
    else setAccessToken(null);
  }

  if (!response.ok) {
    let errorData: ApiError = {};

    try {
      errorData = await response.json();
    } catch {
      // La respuesta no tenía JSON.
    }

    let message = "Ocurrió un error inesperado";

    if (Array.isArray(errorData.message)) {
      message = errorData.message.join(", ");
    } else if (errorData.message) {
      message = errorData.message;
    } else if (errorData.error) {
      message = errorData.error;
    }

    throw new ApiRequestError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
