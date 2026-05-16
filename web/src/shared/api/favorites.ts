import { apiClient } from './client'

export type EntityType = 'template'

export const favoritesApi = {
  getByType: (entityType: EntityType) =>
    apiClient.GET('/favorites/{entity_type}', {
      params: { path: { entity_type: entityType } },
    }),

  add: (entityType: EntityType, entityId: string) =>
    apiClient.POST('/favorites', {
      body: { entity_type: entityType, entity_id: entityId },
    }),

  remove: (entityType: EntityType, entityId: string) =>
    apiClient.DELETE('/favorites/{entity_type}/{entity_id}', {
      params: { path: { entity_type: entityType, entity_id: entityId } },
    }),
}
