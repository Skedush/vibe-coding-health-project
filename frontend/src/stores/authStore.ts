import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { combine } from 'zustand/middleware'
import type { User } from '@/types/api'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    combine(
      {
        token: null as string | null,
        user: null as User | null,
      },
      (set) => ({
        login: (token: string, user: User) =>
          set({ token, user, isAuthenticated: true }),
        logout: () =>
          set({ token: null, user: null, isAuthenticated: false }),
        setUser: (user: User) => set({ user }),
      })
    ),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!state.token
        }
      },
    }
  )
)
