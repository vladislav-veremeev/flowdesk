import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { userStore } from '@/entities/user/model/store'

type PublicRouteProps = {
    children: ReactNode
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
    const user = userStore((state) => state.user)
    const isAuthInitialized = userStore((state) => state.isAuthInitialized)

    if (!isAuthInitialized) {
        return <div>Загрузка...</div>
    }

    if (user) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}
