import { useEffect } from 'react'
import { getMe } from '@/features/auth'
import { userStore } from '@/entities/user'

export const useInitAuth = () => {
    const setUser = userStore((state) => state.setUser)
    const clearUser = userStore((state) => state.clearUser)
    const setAuthInitialized = userStore((state) => state.setAuthInitialized)

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token')

            if (!token) {
                setAuthInitialized(true)
                return
            }

            try {
                const user = await getMe()
                setUser(user)
            } catch {
                localStorage.removeItem('token')
                clearUser()
            } finally {
                setAuthInitialized(true)
            }
        }

        initAuth()
    }, [setUser, clearUser, setAuthInitialized])
}
