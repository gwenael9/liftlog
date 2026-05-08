import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { SessionsPage } from '@/pages/sessions/SessionsPage'
import { SessionDetailPage } from '@/pages/sessions/SessionDetailPage'
import { TemplatesPage } from '@/pages/templates/TemplatesPage'
import { TemplateDetailPage } from '@/pages/templates/TemplateDetailPage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'

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
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/sessions" replace /> },
])
