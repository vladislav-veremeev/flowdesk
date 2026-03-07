import { useUserStore } from '@/entities/user'
import { login } from '@/features/auth'

export const useLogin = () => {
    const setUser = useUserStore((s) => s.setUser)

    const handleLogin = async (data: { email: string; password: string }) => {
        try {
            const res = await login(data)
            localStorage.setItem('token', res.accessToken)
            setUser(res.user)
        } catch (e) {
            console.error('Login failed', e)
        }
    }

    return { handleLogin }
}
