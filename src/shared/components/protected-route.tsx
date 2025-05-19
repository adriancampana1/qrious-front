import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../../features/auth/hooks/use-auth';
import LoadingFallback from './loading-fallback';
import Unauthorized from '../pages/unauthorized';
import { useEffect } from 'react';

interface ProtectedRoutePropsType {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute = ({
  children,
  requiredRole
}: ProtectedRoutePropsType) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) {
      if (location.pathname !== '/') {
        sessionStorage.setItem('lastPath', location.pathname + location.search);
      }
    }
  }, [isLoading, location]);

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate to="/autenticacao/login" state={{ from: location }} replace />
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Unauthorized />;
  }

  return <>{children}</>;
};
