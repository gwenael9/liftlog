import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi, type LoginDto, type RegisterDto } from '@/api/auth'
import { usersApi } from '@/api/users'
import { useAuthStore } from '@/store/auth.store'

async function fetchAndStoreRole(setRole: (role: string) => void) {
  const { data } = await usersApi.getMe()
  if (data?.role) setRole(data.role)
}

export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens)
  const setRole = useAuthStore((s) => s.setRole)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: LoginDto) => authApi.login(payload),
    onSuccess: async ({ data }) => {
      if (!data) return
      setTokens(data.access_token, data.refresh_token)
      await fetchAndStoreRole(setRole)
      navigate('/sessions')
    },
  })
}

export function useRegister() {
  const setTokens = useAuthStore((s) => s.setTokens)
  const setRole = useAuthStore((s) => s.setRole)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: RegisterDto) => authApi.register(payload),
    onSuccess: async ({ data }) => {
      if (!data) return
      setTokens(data.access_token, data.refresh_token)
      await fetchAndStoreRole(setRole)
      navigate('/sessions')
    },
  })
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return () => {
    logout()
    navigate('/login')
  }
}
