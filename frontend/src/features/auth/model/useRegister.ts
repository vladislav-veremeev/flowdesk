import { useNavigate } from 'react-router-dom'
import { userStore } from '@/entities/user'
import { register } from '../api/authApi'
import type { RegisterDto } from './types'

export const useRegister = () => {
    const setUser = userStore((state) => state.setUser)
    const navigate = useNavigate()

    const handleRegister = async (data: RegisterDto) => {
        const result = await register(data)

        localStorage.setItem('token', result.token)
        setUser(result.user)

        navigate('/')
    }

    return { handleRegister }
}
