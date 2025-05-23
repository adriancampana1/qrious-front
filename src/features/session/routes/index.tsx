import type { RouteObject } from 'react-router';
import { ProtectedRoute } from '../../../shared/components/protected-route';
import { Suspense } from 'react';
import LoadingFallback from '../../../shared/components/loading-fallback';
import SessionsPage from '../pages/list';
import SessionAccessPage from '../pages/access-page';
import SessionDetailPage from '../pages/session-details';
import QuestionDetailPage from '../pages/question-details';

export const sessionRoutes: RouteObject[] = [
  {
    path: '/sessoes',
    children: [
      {
        path: 'lista',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <SessionsPage />
            </Suspense>
          </ProtectedRoute>
        )
      },
      {
        path: 'entrar',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <SessionAccessPage />
            </Suspense>
          </ProtectedRoute>
        )
      },
      {
        path: 'sessao/:id',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <SessionDetailPage />
            </Suspense>
          </ProtectedRoute>
        )
      },
      {
        path: 'sessao/:sessionId/perguntas/:questionId',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <QuestionDetailPage />
            </Suspense>
          </ProtectedRoute>
        )
      }
    ]
  }
];
