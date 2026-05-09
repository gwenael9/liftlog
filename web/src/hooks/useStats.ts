import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/api/stats";

export function useFrequency(weeks: number) {
  return useQuery({
    queryKey: ["stats", "frequency", weeks],
    queryFn: async () => {
      const { data, error } = await statsApi.getFrequency(weeks);
      if (error) throw error;
      return data!;
    },
  });
}

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
