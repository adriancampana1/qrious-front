import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router';
import { router } from './shared/routes/index.tsx';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './features/auth/context/auth.provider.tsx';
import { LayoutProvider } from './shared/hooks/use-layout.tsx';
import { MessageProvider } from './shared/hooks/use-message.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorBgLayout: '#fafafa'
        }
      }}
    >
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <MessageProvider>
            <LayoutProvider>
              <RouterProvider router={router} />
            </LayoutProvider>
          </MessageProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ConfigProvider>
  </StrictMode>
);
