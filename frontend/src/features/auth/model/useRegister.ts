import { register } from '@/features/auth'
import { useUserStore } from '@/entities/user'

export const useRegister = () => {
    const setUser = useUserStore((s) => s.setUser)

    const handleRegister = async (data: {
        email: string
        password: string
        name: string
    }) => {
        try {
            const res = await register(data)
            localStorage.setItem('token', res.accessToken)
            setUser(res.user)
        } catch (e) {
            console.error('Registration failed', e)
        }
    }

    return { handleRegister }
}
