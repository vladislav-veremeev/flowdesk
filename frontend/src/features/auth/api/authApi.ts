import type { AuthResponse, LoginDto, RegisterDto } from '@/features/auth'
import { baseApi } from '@/shared/api'

export const login = async (data: LoginDto) => {
    const response = await baseApi.post<AuthResponse>('/auth/login', data)
    return response.data
}

export const register = async (data: RegisterDto) => {
    const response = await baseApi.post<AuthResponse>('/auth/register', data)
    return response.data
}
