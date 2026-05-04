import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  userInfo: Record<string, unknown> | null
  isAuthenticated: boolean
  setAuth: (token: string, userInfo: Record<string, unknown>) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userInfo: null,
      isAuthenticated: false,
      setAuth: (token, userInfo) =>
        set({ token, userInfo, isAuthenticated: true }),
      logout: () =>
        set({ token: null, userInfo: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
