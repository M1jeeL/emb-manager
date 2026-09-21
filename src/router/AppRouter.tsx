import { Navigate, Route, Routes } from "react-router-dom";

import { LoginPage } from "../pages/LoginPage";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { CustomersPage } from "../features/customers/pages/CustomersPage";
import { AppLayout } from "../components/layout";
import { Spinner } from "../components/ui";
import { GarmentsPage } from "../features/garments/pages/GarmentPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Spinner />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/orders" element={<Spinner />} />
          <Route path="/production" element={<Spinner />} />
          <Route path="/garments" element={<GarmentsPage />} />
          <Route path="/logos" element={<Spinner />} />
          <Route path="/employees" element={<Spinner />} />
          <Route path="/machines" element={<Spinner />} />
          <Route path="/payments" element={<Spinner />} />
          <Route path="/reports" element={<Spinner />} />
          <Route path="/settings" element={<Spinner />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/customers" replace />} />
    </Routes>
  );
}
