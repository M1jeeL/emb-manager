import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  // Todavía estamos restaurando la sesión.
  // NO debemos redirigir al login todavía.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-indigo-600" />

          <p className="text-sm text-slate-500">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Ya terminamos de comprobar la sesión.
  // Si no existe, recién ahora enviamos al login.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
