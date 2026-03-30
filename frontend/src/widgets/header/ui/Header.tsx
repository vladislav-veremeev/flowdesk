import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, Mail, UserRound } from 'lucide-react'

import { Button } from '@/components/ui/button.tsx'
import { ButtonGroup } from '@/components/ui/button-group.tsx'
import { userStore } from '@/entities/user'
import { getMyInvitations } from '@/features/board-invitations'
import { Badge } from '@/components/ui/badge.tsx'

export const Header = () => {
    const user = userStore((state) => state.user)
    const navigate = useNavigate()
    const location = useLocation()

    const [pendingInvitationsCount, setPendingInvitationsCount] = useState(0)

    const loadPendingInvitations = async () => {
        try {
            const invitations = await getMyInvitations()
            const pendingCount = invitations.filter(
                (invitation) => invitation.status === 'pending'
            ).length

            setPendingInvitationsCount(pendingCount)
        } catch {
            setPendingInvitationsCount(0)
        }
    }

    useEffect(() => {
        void loadPendingInvitations()
    }, [location.pathname])

    useEffect(() => {
        const handleFocus = () => {
            void loadPendingInvitations()
        }

        window.addEventListener('focus', handleFocus)

        return () => {
            window.removeEventListener('focus', handleFocus)
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        userStore.getState().clearUser()
        navigate('/login')
    }

    return (
        <header className="flex py-4 px-6 items-center justify-between border-b">
            <Link to="/" className="text-primary text-xl font-semibold">
                flowdesk
            </Link>

            <nav className="flex items-center gap-4">
                <Button variant="outline" asChild>
                    <Link to="/">
                        <LayoutDashboard />
                        Доски
                    </Link>
                </Button>

                <Button variant="outline" asChild>
                    <Link to="/invitations" className="relative">
                        <Mail />
                        Приглашения
                        {pendingInvitationsCount > 0 && (
                            <Badge>{pendingInvitationsCount}</Badge>
                        )}
                    </Link>
                </Button>

                <ButtonGroup>
                    <Button variant="outline" asChild>
                        <Link to="/profile">
                            <UserRound />
                            {user?.username}
                        </Link>
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleLogout}
                    >
                        <LogOut />
                    </Button>
                </ButtonGroup>
            </nav>
        </header>
    )
}
