import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '@/views/auth/LoginPage'
import { RegisterPage } from '@/views/auth/RegisterPage'
import { SessionsPage } from '@/views/sessions/SessionsPage'
import { SessionDetailPage } from '@/views/sessions/SessionDetailPage'
import { TemplatesPage } from '@/views/templates/TemplatesPage'
import { TemplateDetailPage } from '@/views/templates/TemplateDetailPage'
import { AdminPage } from '@/views/admin/AdminPage'
import { StatsPage } from '@/views/stats/StatsPage'
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute'
import { AdminRoute } from '@/shared/components/auth/AdminRoute'
import { AppLayout } from '@/shared/components/layout/AppLayout'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/sessions', element: <SessionsPage /> },
          { path: '/sessions/:id', element: <SessionDetailPage /> },
          { path: '/templates', element: <TemplatesPage /> },
          { path: '/templates/:id', element: <TemplateDetailPage /> },
          { path: '/stats', element: <StatsPage /> },
          {
            element: <AdminRoute />,
            children: [
              { path: '/admin', element: <AdminPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/sessions" replace /> },
])
