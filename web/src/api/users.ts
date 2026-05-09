import { apiClient } from './client'
import type { components } from './schema'

export type UserResponseDto = components['schemas']['UserResponseDto']

export const usersApi = {
  getMe: () => apiClient.GET('/users/me'),
  getAll: () => apiClient.GET('/users'),
}
