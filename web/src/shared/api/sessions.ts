import { apiClient } from "./client";
import type { components } from "./schema";

export type SessionResponseDto = components["schemas"]["SessionResponseDto"];
export type SetResponseDto = components["schemas"]["SetResponseDto"];
export type CreateSessionDto = components["schemas"]["CreateSessionDto"];
export type UpdateSessionDto = components["schemas"]["UpdateSessionDto"];

export type CreateSetDto = components["schemas"]["CreateSetDto"];
export type UpdateSetDto = components["schemas"]["UpdateSetDto"];
export type BulkUpdateSetsDto = components["schemas"]["BulkUpdateSetsDto"];

export const sessionsApi = {
  getAll: (month?: string) =>
    apiClient.GET("/sessions", {
      params: { query: month ? { month } : undefined },
    }),

  getOne: (id: string) =>
    apiClient.GET("/sessions/{id}", { params: { path: { id } } }),

  create: (body: CreateSessionDto) => apiClient.POST("/sessions", { body }),

  update: (id: string, body: UpdateSessionDto) =>
    apiClient.PUT("/sessions/{id}", { params: { path: { id } }, body }),

  remove: (id: string) =>
    apiClient.DELETE("/sessions/{id}", { params: { path: { id } } }),

  createSet: (sessionId: string, body: CreateSetDto) =>
    apiClient.POST("/sessions/{sessionId}/sets", {
      params: { path: { sessionId } },
      body,
    }),

  updateSet: (sessionId: string, id: string, body: UpdateSetDto) =>
    apiClient.PUT("/sessions/{sessionId}/sets/{id}", {
      params: { path: { sessionId, id } },
      body,
    }),

  bulkUpdateSets: (sessionId: string, body: BulkUpdateSetsDto) =>
    apiClient.PUT("/sessions/{sessionId}/sets/bulk", {
      params: { path: { sessionId } },
      body,
    }),

  removeSet: (sessionId: string, id: string) =>
    apiClient.DELETE("/sessions/{sessionId}/sets/{id}", {
      params: { path: { sessionId, id } },
    }),
};
