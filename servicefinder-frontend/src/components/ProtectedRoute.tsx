import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { Role } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = user.role === 'CUSTOMER' ? '/dashboard' : '/provider/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
} 