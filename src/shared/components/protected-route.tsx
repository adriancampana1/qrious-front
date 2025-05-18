import { Navigate } from 'react-router';
import { useAuth } from '../../features/auth/hooks/use-auth';
import LoadingFallback from './loading-fallback';
import Unauthorized from '../pages/unauthorized';

interface ProtectedRoutePropsType {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute = ({
  children,
  requiredRole
}: ProtectedRoutePropsType) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/autenticacao/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Unauthorized />;
  }

  return <>{children}</>;
};
