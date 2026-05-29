import { create } from 'zustand'
import type { UserResponseDto } from '@/shared/api/users'

interface UserState {
  user: UserResponseDto | null
  setUser: (user: UserResponseDto) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))
