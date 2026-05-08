import { apiClient } from './client'
import type { components } from './schema'

export type TemplateResponseDto = components['schemas']['TemplateResponseDto']
export type TemplateExerciseResponseDto = components['schemas']['TemplateExerciseResponseDto']
export type CreateTemplateDto = components['schemas']['CreateTemplateDto']
export type UpdateTemplateDto = components['schemas']['UpdateTemplateDto']
export type TemplateExerciseItemDto = components['schemas']['TemplateExerciseItemDto']

export const templatesApi = {
  getAll: () => apiClient.GET('/templates', {}),

  getOne: (id: string) =>
    apiClient.GET('/templates/{id}', { params: { path: { id } } }),

  create: (body: CreateTemplateDto) =>
    apiClient.POST('/templates', { body }),

  update: (id: string, body: UpdateTemplateDto) =>
    apiClient.PUT('/templates/{id}', { params: { path: { id } }, body }),

  remove: (id: string) =>
    apiClient.DELETE('/templates/{id}', { params: { path: { id } } }),
}
