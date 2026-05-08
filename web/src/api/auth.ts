import { apiClient } from './client'

export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export interface User {
  id: string
  email: string
  display_name?: string
}

export interface RegisterPayload {
  email: string
  password: string
  display_name?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<AuthTokens>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    apiClient.post<AuthTokens>('/auth/login', payload),
}
