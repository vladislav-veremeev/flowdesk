import type { User } from '@/entities'
import { create } from 'zustand/react'

interface UserState {
    user: User | null
    setUser: (user: User | null) => void
    logout: () => void
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    logout: () => set({ user: null }),
}))
