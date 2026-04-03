import { useNavigate } from 'react-router-dom'
import { userStore } from '@/entities/user'
import { login } from '../api/authApi'
import type { LoginDto } from './types'

export const useLogin = () => {
    const setUser = userStore((state) => state.setUser)
    const navigate = useNavigate()

    const handleLogin = async (data: LoginDto) => {
        const result = await login(data)

        setUser(result.user)
        navigate('/')
    }

    return { handleLogin }
}
