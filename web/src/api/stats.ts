import { apiClient } from './client'
import type { components } from './schema'

export type ExerciseProgressionPointDto = components['schemas']['ExerciseProgressionPointDto']
export type VolumePerWeekDto = components['schemas']['VolumePerWeekDto']
export type PersonalRecordDto = components['schemas']['PersonalRecordDto']

export const statsApi = {
  getExerciseProgression: (exerciseId: string) =>
    apiClient.GET('/stats/exercise/{exerciseId}', { params: { path: { exerciseId } } }),

  getVolume: (weeks?: number) =>
    apiClient.GET('/stats/volume', { params: { query: weeks ? { weeks } : undefined } }),

  getPersonalRecords: () =>
    apiClient.GET('/stats/prs', {}),

  getActivityDates: () =>
    apiClient.GET('/stats/activity-dates', {}),
}
