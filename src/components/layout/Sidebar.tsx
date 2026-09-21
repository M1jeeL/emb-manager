import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

interface SidebarProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

interface NavigationItem {
  label: string;
  path: string;
  icon: string;
  roles?: string[];
}

interface NavigationSection {
  title?: string;
  items: NavigationItem[];
}

const navigation: NavigationSection[] = [
  {
    items: [
      {
        label: "Dashboard",
        path: "/",
        icon: "⌂",
      },
    ],
  },
  {
    title: "Operación",
    items: [
      {
        label: "Clientes",
        path: "/customers",
        icon: "◉",
      },
      {
        label: "Pedidos",
        path: "/orders",
        icon: "▣",
      },
      {
        label: "Producción",
        path: "/production",
        icon: "⚙",
      },
    ],
  },
  {
    title: "Catálogo",
    items: [
      {
        label: "Prendas",
        path: "/garments",
        icon: "□",
      },
      {
        label: "Logos",
        path: "/logos",
        icon: "◇",
      },
    ],
  },
  {
    title: "Recursos",
    items: [
      {
        label: "Empleados",
        path: "/employees",
        icon: "♙",
        roles: ["OWNER", "ADMIN", "MANAGER"],
      },
      {
        label: "Máquinas",
        path: "/machines",
        icon: "▤",
        roles: ["OWNER", "ADMIN", "MANAGER"],
      },
    ],
  },
  {
    title: "Administración",
    items: [
      {
        label: "Pagos",
        path: "/payments",
        icon: "$",
        roles: ["OWNER", "ADMIN", "MANAGER"],
      },
      {
        label: "Reportes",
        path: "/reports",
        icon: "▥",
        roles: ["OWNER", "ADMIN", "MANAGER"],
      },
      {
        label: "Configuración",
        path: "/settings",
        icon: "⚙",
        roles: ["OWNER", "ADMIN"],
      },
    ],
  },
];

export function Sidebar({ collapsed = false, onNavigate }: SidebarProps) {
  const { user } = useAuth();

  const visibleSections = navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.roles) {
          return true;
        }

        return user ? item.roles.includes(user.role) : false;
      }),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside
      className={[
        "flex h-full flex-col border-r border-slate-200 bg-white",
        "transition-all duration-200",
        collapsed ? "w-20" : "w-64",
      ].join(" ")}
    >
      {/* Logo */}
      <div
        className={[
          "flex h-16 shrink-0 items-center border-b border-slate-200",
          collapsed ? "justify-center px-2" : "px-5",
        ].join(" ")}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            B
          </div>

          {!collapsed && (
            <div>
              <p className="text-sm font-bold text-slate-900">Bordados</p>

              <p className="text-xs text-slate-500">Gestión</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {visibleSections.map((section, sectionIndex) => (
          <div
            key={section.title ?? `section-${sectionIndex}`}
            className={sectionIndex > 0 ? "mt-6" : ""}
          >
            {!collapsed && section.title && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
            )}

            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    [
                      "group flex items-center rounded-lg text-sm font-medium",
                      "transition-colors",
                      collapsed
                        ? "justify-center px-2 py-2.5"
                        : "gap-3 px-3 py-2.5",
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    ].join(" ")
                  }
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center text-sm"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>

                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 p-3">
        {!collapsed ? (
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-xs font-medium text-slate-700">
              Sistema de gestión
            </p>

            <p className="mt-0.5 text-xs text-slate-400">v1.0.0</p>
          </div>
        ) : (
          <div className="flex justify-center text-xs text-slate-400">v1</div>
        )}
      </div>
    </aside>
  );
}
