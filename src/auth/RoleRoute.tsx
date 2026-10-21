import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { UserRole } from './types';

export function RoleRoute({ allowed, fallback, children }: { allowed: UserRole[]; fallback: string; children: ReactNode }) {
  const { user } = useAuth();
  return user && allowed.includes(user.role) ? <>{children}</> : <Navigate to={fallback} replace />;
}
