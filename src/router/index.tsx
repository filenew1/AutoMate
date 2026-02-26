import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { MainLayout } from '../components/MainLayout'
import { WelcomePage } from '../pages/WelcomePage'
import { AgentChatPage } from '../pages/AgentChatPage'
import { SettingsPage } from '../pages/SettingsPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <MainLayout>
        <WelcomePage />
      </MainLayout>
    ),
  },
  {
    path: '/agent/:agentId',
    element: (
      <MainLayout>
        <AgentChatPage />
      </MainLayout>
    ),
  },
  {
    path: '/settings',
    element: (
      <MainLayout>
        <SettingsPage />
      </MainLayout>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

export default router
