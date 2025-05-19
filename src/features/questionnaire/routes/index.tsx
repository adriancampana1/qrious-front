import type { RouteObject } from 'react-router';
import { ProtectedRoute } from '../../../shared/components/protected-route';
import { Suspense } from 'react';
import LoadingFallback from '../../../shared/components/loading-fallback';
import QuestionnairesPage from '../pages/list';

export const questionnaireRoutes: RouteObject[] = [
  {
    path: '/questionarios',
    children: [
      {
        path: 'lista',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <QuestionnairesPage />
            </Suspense>
          </ProtectedRoute>
        )
      }
    ]
  }
];
