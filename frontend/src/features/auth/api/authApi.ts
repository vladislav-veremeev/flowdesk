import { api } from '@/shared/api'
import type { User } from '@/entities/user'

type AuthResponse = {
    user: User
}

type LoginPayload = {
    username: string
    password: string
}

type RegisterPayload = {
    username: string
    password: string
}

type UpdateMePayload = {
    username: string
    currentPassword?: string
    newPassword?: string
}

export const login = async (payload: LoginPayload) => {
    const response = await api.post<AuthResponse>('/auth/login', payload)
    return response.data
}

export const register = async (payload: RegisterPayload) => {
    const response = await api.post<AuthResponse>('/auth/register', payload)
    return response.data
}

export const logout = async () => {
    const response = await api.post<{ message: string }>('/auth/logout')
    return response.data
}

export const getMe = async () => {
    const response = await api.get<User>('/auth/me')
    return response.data
}

export const updateMe = async (payload: UpdateMePayload) => {
    const response = await api.put<User>('/auth/me', payload)
    return response.data
}

export const deleteMe = async () => {
    const response = await api.delete<{ message: string }>('/auth/me')
    return response.data
}
