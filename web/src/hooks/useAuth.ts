import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi, type LoginDto, type RegisterDto } from '@/api/auth'
import { useAuthStore } from '@/store/auth.store'

export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: LoginDto) => authApi.login(payload),
    onSuccess: ({ data }) => {
      if (!data) return
      setTokens(data.access_token, data.refresh_token)
      navigate('/dashboard')
    },
  })
}

export function useRegister() {
  const setTokens = useAuthStore((s) => s.setTokens)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: RegisterDto) => authApi.register(payload),
    onSuccess: ({ data }) => {
      if (!data) return
      setTokens(data.access_token, data.refresh_token)
      navigate('/dashboard')
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
