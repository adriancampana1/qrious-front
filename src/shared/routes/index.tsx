import { createBrowserRouter } from 'react-router';
import Home from '../../features/dashboard/pages';
import { authRoutes } from '../../features/auth/routes';
import { ProtectedRoute } from '../components/protected-route';

export const router = createBrowserRouter([
  ...authRoutes,
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    )
  }
]);
