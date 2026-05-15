import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  role: string | null
  setTokens: (accessToken: string, refreshToken: string) => void
  setRole: (role: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      role: null,

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),

      setRole: (role) => set({ role }),

      logout: () =>
        set({ accessToken: null, refreshToken: null, isAuthenticated: false, role: null }),
    }),
    {
      name: 'liftlog-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
      }),
    }
  )
)
