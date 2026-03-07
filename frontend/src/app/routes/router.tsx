import { createBrowserRouter } from 'react-router'
import { PublicRoute } from './PublicRoute'
import { LoginPage } from '@/pages/login'

export const router = createBrowserRouter([
    {
        path: '/login',
        element: (
            <PublicRoute>
                <LoginPage />
            </PublicRoute>
        ),
    },
    // {
    //     path: "/register",
    //     element: <RegisterPage />,
    // },
    // {
    //     path: "/profile",
    //     element: (
    //         <ProtectedRoute>
    //             <ProfilePage />
    //         </ProtectedRoute>
    //     ),
    // },
])
