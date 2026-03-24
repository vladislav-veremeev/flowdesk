import { Outlet } from 'react-router-dom'
import { Header } from '@/widgets/header'

export const AppLayout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 bg-secondary">
                <Outlet />
            </main>
        </div>
    )
}
