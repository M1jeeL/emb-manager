import { NavLink } from "react-router-dom";

interface MobileNavProps {
  onMoreClick?: () => void;
}

const items = [
  {
    label: "Inicio",
    path: "/",
    icon: "⌂",
  },
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
];

export function MobileNav({ onMoreClick }: MobileNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="grid grid-cols-5">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              [
                "flex min-h-16 flex-col items-center justify-center gap-1",
                "text-[11px] font-medium transition-colors",
                isActive ? "text-indigo-600" : "text-slate-500",
              ].join(" ")
            }
          >
            <span className="text-base" aria-hidden="true">
              {item.icon}
            </span>

            <span>{item.label}</span>
          </NavLink>
        ))}

        <button
          type="button"
          onClick={onMoreClick}
          className="flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium text-slate-500"
        >
          <span className="text-base">•••</span>
          <span>Más</span>
        </button>
      </div>
    </nav>
  );
}
