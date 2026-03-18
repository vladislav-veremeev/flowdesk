import type { User } from '@/entities/user'

export interface LoginDto {
    email: string
    password: string
}

export interface RegisterDto {
    email: string
    password: string
    username: string
}

export interface AuthResponse {
    token: string
    user: User
}
