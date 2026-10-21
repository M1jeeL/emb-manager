import { Navigate, Route, Routes } from "react-router-dom";

import { LoginPage } from "../pages/LoginPage";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { CustomersPage } from "../features/customers/pages/CustomersPage";
import { AppLayout } from "../components/layout";
import { GarmentsPage } from "../features/garments/pages/GarmentPage";
import { LogosPage } from "../features/logos/pages/LogosPage";
import { LogoCreatePage } from "../features/logos/pages/LogoCreatePage";
import { LogoDetailPage } from "../features/logos/pages/LogoDetailPage";
import { LogoEditPage } from "../features/logos/pages/LogoEditPage";
import { CreateOrderPage } from "../features/orders/pages/CreateOrderPage";
import { OrderDetailPage } from "../features/orders/pages/OrderDetailPage";
import { OrdersPage } from "../features/orders/pages/OrdersPage";
import { EmployeesPage } from "../features/employees/pages/EmployeesPage";
import { MachinesPage } from "../features/machines/pages/MachinesPage";
import { ProductionPage } from "../features/production/pages/ProductionPage";
import { PaymentsPage } from "../features/payments/pages/PaymentsPage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { ReportsPage } from "../features/dashboard/pages/ReportsPage";
import { SettingsPage } from "../features/settings/SettingsPage";
import { RoleRoute } from "../auth/RoleRoute";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<RoleRoute allowed={["OWNER", "ADMIN", "MANAGER"]} fallback="/production"><DashboardPage /></RoleRoute>} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/new" element={<CreateOrderPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/production" element={<ProductionPage />} />
          <Route path="/garments" element={<GarmentsPage />} />
          <Route path="/logos" element={<LogosPage />} />
          <Route path="/logos/new" element={<LogoCreatePage />} />
          <Route path="/logos/:id" element={<LogoDetailPage />} />
          <Route path="/logos/:id/edit" element={<LogoEditPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/machines" element={<MachinesPage />} />
          <Route path="/payments" element={<RoleRoute allowed={["OWNER", "ADMIN", "MANAGER"]} fallback="/production"><PaymentsPage /></RoleRoute>} />
          <Route path="/reports" element={<RoleRoute allowed={["OWNER", "ADMIN", "MANAGER"]} fallback="/production"><ReportsPage /></RoleRoute>} />
          <Route path="/settings" element={<RoleRoute allowed={["OWNER", "ADMIN"]} fallback="/production"><SettingsPage /></RoleRoute>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
