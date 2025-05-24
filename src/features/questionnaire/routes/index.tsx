import type { RouteObject } from 'react-router';
import { ProtectedRoute } from '../../../shared/components/protected-route';
import { Suspense } from 'react';
import LoadingFallback from '../../../shared/components/loading-fallback';
import QuestionnaireTakePage from '../pages/questionnaire-take-page';
import StudentQuestionnairesPage from '../pages/student-questionnaires';
import TeacherQuestionnairesPage from '../pages/teacher-questionnaires';
import QuestionnaireResultsPage from '../pages/questionnaire-results';

export const questionnaireRoutes: RouteObject[] = [
  {
    path: '/questionarios',
    children: [
      // Página para estudantes
      {
        path: 'meus',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <StudentQuestionnairesPage />
            </Suspense>
          </ProtectedRoute>
        )
      },
      // Página para professores
      {
        path: 'gerenciar',
        element: (
          <ProtectedRoute requiredRole={['teacher', 'admin']}>
            <Suspense fallback={<LoadingFallback />}>
              <TeacherQuestionnairesPage />
            </Suspense>
          </ProtectedRoute>
        )
      },
      // Página para responder questionário
      {
        path: ':id/tentativa',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <QuestionnaireTakePage />
            </Suspense>
          </ProtectedRoute>
        )
      },
      // Página de resultados
      {
        path: ':id/tentativa/resultado',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <QuestionnaireResultsPage />
            </Suspense>
          </ProtectedRoute>
        )
      }
    ]
  }
];
