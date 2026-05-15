import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/shared/api/stats";

export function usePersonalRecords() {
  return useQuery({
    queryKey: ["stats", "prs"],
    queryFn: async () => {
      const { data, error } = await statsApi.getPersonalRecords();
      if (error) throw error;
      return data!;
    },
  });
}

export function useActivityDates() {
  return useQuery({
    queryKey: ["stats", "activity-dates"],
    queryFn: async () => {
      const { data, error } = await statsApi.getActivityDates();
      if (error) throw error;
      return data!;
    },
  });
}

export function useExerciseProgression(exerciseId: string | null) {
  return useQuery({
    queryKey: ["stats", "exercise", exerciseId],
    queryFn: async () => {
      const { data, error } = await statsApi.getExerciseProgression(
        exerciseId!,
      );
      if (error) throw error;
      return data!;
    },
    enabled: !!exerciseId,
  });
}
