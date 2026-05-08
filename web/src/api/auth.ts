import { apiClient } from './client'
import type { components } from './schema'

export type TokenPairDto = components['schemas']['TokenPairDto']
export type UserResponseDto = components['schemas']['UserResponseDto']
export type RegisterDto = components['schemas']['RegisterDto']
export type LoginDto = components['schemas']['LoginDto']

export const authApi = {
  register: (body: RegisterDto) =>
    apiClient.POST('/auth/register', { body }),

  login: (body: LoginDto) =>
    apiClient.POST('/auth/login', { body }),
}
