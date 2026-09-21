import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex h-screen overflow-hidden">
        <div className="hidden lg:flex">
          <Sidebar collapsed={sidebarCollapsed} />
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Cerrar menú"
              className="absolute inset-0 bg-slate-950/40"
              onClick={() => setMobileMenuOpen(false)}
            />

            <div className="relative h-full w-72">
              <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            onMenuClick={() => setMobileMenuOpen(true)}
            onSidebarToggle={() => setSidebarCollapsed((current) => !current)}
            sidebarCollapsed={sidebarCollapsed}
          />

          <main className="min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1600px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <MobileNav onMoreClick={() => setMobileMenuOpen(true)} />
    </div>
  );
}
