import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PublicRoute } from './PublicRoute'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { ProtectedRoute } from './ProtectedRoute'
import { AppLayout } from './layouts'
import { ProfilePage } from '@/pages/profile'
import { HomePage } from '@/pages/home'

export const router = createBrowserRouter([
    {
        path: '/login',
        element: (
            <PublicRoute>
                <LoginPage />
            </PublicRoute>
        ),
    },
    {
        path: '/register',
        element: (
            <PublicRoute>
                <RegisterPage />
            </PublicRoute>
        ),
    },
    {
        element: (
            <ProtectedRoute>
                <AppLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: '/',
                element: <HomePage />,
            },
            {
                path: '/profile',
                element: <ProfilePage />,
            },
        ],
    },
    {
        path: '/*',
        element: <Navigate to="/" />,
    },
])
