import { Navigate } from 'react-router'
import { useUserStore } from '@/entities/user'
import type { JSX } from 'react'

interface Props {
    children: JSX.Element
}

export const ProtectedRoute = ({ children }: Props) => {
    const user = useUserStore((s) => s.user)

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}
