import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { authApi } from "../api/auth.api";
import type { AuthUser, LoginResponse } from "./types";
import { setAccessToken } from "../api/client";

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
    // Retira el token de acceso legado que se guardaba en localStorage.
    try {
      localStorage.removeItem("accessToken");
    } catch {
      // Algunos modos privados bloquean localStorage; la sesión usa cookie HttpOnly.
    }

    async function restoreSession() {
      try {
        const session = await authApi.refresh();
        if (mounted) {
          setUser(session.user);
        }
      } catch {
        setAccessToken(null);
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

    setAccessToken(response.accessToken);
    setUser(response.user);
  }

  function logout() {
    void authApi.logout();
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
