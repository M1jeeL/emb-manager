import { UserMenu } from "./UserMenu";

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
        {/* Search placeholder */}
        <button
          type="button"
          className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600 md:flex"
        >
          <span>⌕</span>
          <span>Buscar...</span>
          <kbd className="ml-3 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px]">
            Ctrl K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Notificaciones"
        >
          🔔
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <UserMenu />
      </div>
    </header>
  );
}
