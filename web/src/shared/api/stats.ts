import { apiClient } from "./client";
import type { components } from "./schema";

export type ExerciseProgressionPointDto =
  components["schemas"]["ExerciseProgressionPointDto"];
export type PersonalRecordDto = components["schemas"]["PersonalRecordDto"];

export const statsApi = {
  getExerciseProgression: (exerciseId: string, from?: string) =>
    apiClient.GET("/stats/exercise/{exerciseId}", {
      params: { path: { exerciseId }, query: from ? { from } : {} },
    }),

  getPersonalRecords: () => apiClient.GET("/stats/prs", {}),

  getActivityDates: () => apiClient.GET("/stats/activity-dates", {}),
};
