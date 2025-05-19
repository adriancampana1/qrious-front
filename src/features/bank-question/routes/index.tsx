import type { RouteObject } from 'react-router';
import { ProtectedRoute } from '../../../shared/components/protected-route';
import { Suspense } from 'react';
import LoadingFallback from '../../../shared/components/loading-fallback';
import BankQuestionsPage from '../pages/list';

export const bankQuestionRoutes: RouteObject[] = [
  {
    path: '/banco-questoes',
    children: [
      {
        path: 'lista',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <BankQuestionsPage />
            </Suspense>
          </ProtectedRoute>
        )
      }
    ]
  }
];
