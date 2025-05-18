import { type RouteObject } from 'react-router';
import Login from '../pages/login';
import { Suspense } from 'react';
import LoadingFallback from '../../../shared/components/loading-fallback';
import Register from '../pages/register';

export const authRoutes: RouteObject[] = [
  {
    path: '/autenticacao',
    children: [
      {
        path: 'login',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Login />
          </Suspense>
        )
      },
      {
        path: 'cadastro',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Register />
          </Suspense>
        )
      }
    ]
  }
];
