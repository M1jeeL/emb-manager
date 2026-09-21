const API_URL = import.meta.env.VITE_API_URL;

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
  const token = localStorage.getItem("accessToken");

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

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
