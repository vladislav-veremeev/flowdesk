import { create } from 'zustand'
import type { User } from '@/entities/user'

type UserState = {
    user: User | null
    isAuthInitialized: boolean
    setUser: (user: User | null) => void
    clearUser: () => void
    setAuthInitialized: (value: boolean) => void
}

export const userStore = create<UserState>((set) => ({
    user: null,
    isAuthInitialized: false,
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
    setAuthInitialized: (value) => set({ isAuthInitialized: value }),
}))
