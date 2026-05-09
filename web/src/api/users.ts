import { apiClient } from './client'
import type { components } from './schema'

export type UserResponseDto = components['schemas']['UserResponseDto']

export const usersApi = {
  getMe: () => apiClient.GET('/users/me'),
  getAll: () => apiClient.GET('/users'),
  remove: (id: string) => apiClient.DELETE('/users/{id}', { params: { path: { id } } }),
}
