import { UserMenu } from "./UserMenu";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationMenu } from "./NotificationMenu";

interface HeaderProps {
  onMenuClick?: () => void;
  onSidebarToggle?: () => void;
  sidebarCollapsed?: boolean;
}

export function Header({
  onMenuClick,
  onSidebarToggle,
  sidebarCollapsed = false,
}: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          aria-label="Abrir menú"
        >
          ☰
        </button>

        {/* Desktop sidebar toggle */}
        <button
          type="button"
          onClick={onSidebarToggle}
          className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:block"
          aria-label={sidebarCollapsed ? "Expandir menú" : "Contraer menú"}
        >
          {sidebarCollapsed ? "→" : "←"}
        </button>

        <div className="hidden sm:block">
          <p className="text-sm font-medium text-slate-800">Panel de gestión</p>

          <p className="text-xs text-slate-400">Administra tu taller</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <GlobalSearch />
        <NotificationMenu />

        <UserMenu />
      </div>
    </header>
  );
}
