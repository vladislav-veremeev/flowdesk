import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { userStore } from '@/entities/user/model/store'

type ProtectedRouteProps = {
    children: ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const user = userStore((state) => state.user)
    const isAuthInitialized = userStore((state) => state.isAuthInitialized)

    if (!isAuthInitialized) {
        return
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}
