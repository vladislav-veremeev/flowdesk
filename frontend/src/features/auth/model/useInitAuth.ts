import { useEffect } from 'react'
import { getMe } from '@/features/auth'
import { userStore } from '@/entities/user'

export const useInitAuth = () => {
    const setUser = userStore((state) => state.setUser)
    const clearUser = userStore((state) => state.clearUser)
    const setAuthInitialized = userStore((state) => state.setAuthInitialized)

    useEffect(() => {
        const initAuth = async () => {
            try {
                const user = await getMe()
                setUser(user)
            } catch {
                clearUser()
            } finally {
                setAuthInitialized(true)
            }
        }

        void initAuth()
    }, [setUser, clearUser, setAuthInitialized])
}
