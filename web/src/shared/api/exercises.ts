import { apiClient } from "./client";
import type { components } from "./schema";

export type ExerciseResponseDto = components["schemas"]["ExerciseResponseDto"];
export type CreateExerciseDto = components["schemas"]["CreateExerciseDto"];
export type UpdateExerciseDto = components["schemas"]["UpdateExerciseDto"];
export type MuscleGroup = ExerciseResponseDto["muscle_group"];
export type TrackingType = ExerciseResponseDto["tracking_type"];

export const exercisesApi = {
  getAll: (muscle_group?: MuscleGroup) =>
    apiClient.GET("/exercises", {
      params: { query: muscle_group ? { muscle_group } : undefined },
    }),

  getOne: (id: string) =>
    apiClient.GET("/exercises/{id}", { params: { path: { id } } }),

  create: (body: CreateExerciseDto) => apiClient.POST("/exercises", { body }),

  update: (id: string, body: UpdateExerciseDto) =>
    apiClient.PUT("/exercises/{id}", { params: { path: { id } }, body }),

  remove: (id: string) =>
    apiClient.DELETE("/exercises/{id}", { params: { path: { id } } }),
};
