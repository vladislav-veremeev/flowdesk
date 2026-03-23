import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { LayoutDashboard, LogOut, UserRound } from 'lucide-react'
import { userStore } from '@/entities/user'
import { ButtonGroup } from '@/components/ui/button-group.tsx'

export const Header = () => {
    const user = userStore((state) => state.user)
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem('token')
        userStore.getState().clearUser()
        navigate('/login')
    }

    return (
        <header className="flex p-6 items-center justify-between border bg-background shadow-sm">
            <Link to="/" className="text-xl font-semibold">
                flowdesk
            </Link>

            <nav className="flex items-center gap-3">
                <Button variant="outline" asChild>
                    <Link to="/">
                        <LayoutDashboard />
                        Доски
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
