import { Link, NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { UserRound } from 'lucide-react'
import { userStore } from '@/entities/user'

export const Header = () => {
    const user = userStore((state) => state.user)

    return (
        <header className="flex p-4 items-center justify-between border-b bg-background">
            <Link to="/" className="text-xl font-semibold">
                flowdesk
            </Link>

            <nav className="flex items-center gap-2">
                <Button variant="outline" asChild>
                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            isActive ? 'font-semibold' : ''
                        }
                    >
                        <UserRound />
                        {user?.username}
                    </NavLink>
                </Button>
            </nav>
        </header>
    )
}
