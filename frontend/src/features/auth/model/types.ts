import type { User } from '@/entities/user'

export interface LoginDto {
    email: string
    password: string
}

export interface RegisterDto {
    email: string
    password: string
    name: string
}

export interface AuthResponse {
    accessToken: string
    user: User
}
