import { RouterProvider } from 'react-router-dom'
import { useInitAuth } from '@/features/auth'
import { router } from './router'
import { Toaster } from 'sonner'

export const App = () => {
    useInitAuth()

    return (
        <>
            <RouterProvider router={router} />
            <Toaster position="top-center" />
        </>
    )
}
