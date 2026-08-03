import { useQuery } from "@tanstack/react-query";
import { exercisesApi } from "../api/exercises";

export function useExercises() {
  return useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const { data, error } = await exercisesApi.getAll();
      if (error) throw error;
      return data!;
    },
  });
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: ["exercise", id],
    queryFn: async () => {
      const { data, error } = await exercisesApi.getOne(id);
      if (error) throw error;
      return data!;
    },
  });
}
