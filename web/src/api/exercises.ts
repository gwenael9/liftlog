import { apiClient } from './client'
import type { components } from './schema'

export type ExerciseResponseDto = components['schemas']['ExerciseResponseDto']

export const exercisesApi = {
  getAll: () => apiClient.GET('/exercises', {}),
}
