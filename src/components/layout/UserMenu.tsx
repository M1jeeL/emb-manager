import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) {
    return null;
  }

  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
          {initials}
        </div>

        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium text-slate-800">
            {user.firstName} {user.lastName}
          </p>

          <p className="text-xs text-slate-500">{user.role}</p>
        </div>

        <span className="hidden text-slate-400 sm:block">▾</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">
                {user.firstName} {user.lastName}
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-500">
                {user.email}
              </p>
            </div>

            <div className="p-1">
              <button
                type="button"
                className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Mi perfil
              </button>

              <button
                type="button"
                className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Configuración
              </button>
            </div>

            <div className="border-t border-slate-100 p-1">
              <button
                type="button"
                className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
