import { createBrowserRouter } from 'react-router';
import Home from '../../features/dashboard/pages';
import { authRoutes } from '../../features/auth/routes';
import { ProtectedRoute } from '../components/protected-route';
import { bankQuestionRoutes } from '../../features/bank-question/routes';
import { questionnaireRoutes } from '../../features/questionnaire/routes';
import { sessionRoutes } from '../../features/session/routes';

export const router = createBrowserRouter([
  ...authRoutes,
  ...sessionRoutes,
  ...questionnaireRoutes,
  ...bankQuestionRoutes,
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    )
  }
]);
