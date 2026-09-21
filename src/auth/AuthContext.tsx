import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { authApi } from "../api/auth.api";
import type { AuthUser, LoginResponse } from "./types";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      const token = localStorage.getItem("accessToken");
      // No existe sesión almacenada.
      if (!token) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }

        return;
      }

      try {
        // El token existe.
        // Ahora verificamos que siga siendo válido.
        const response = await authApi.me();
        if (mounted) {
          setUser(response.user);
        }
      } catch {
        // El token existe pero ya no es válido.
        localStorage.removeItem("accessToken");

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  async function login(email: string, password: string) {
    const response: LoginResponse = await authApi.login({
      email,
      password,
    });

    localStorage.setItem("accessToken", response.accessToken);

    setUser(response.user);
  }

  function logout() {
    localStorage.removeItem("accessToken");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  }

  return context;
}
