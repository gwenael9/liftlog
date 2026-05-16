import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { favoritesApi, type EntityType } from "@/shared/api/favorites";

export function useFavorites(entityType: EntityType) {
  return useQuery({
    queryKey: ["favorites", entityType],
    queryFn: async () => {
      const { data, error } = await favoritesApi.getByType(entityType);
      if (error) throw error;
      return data;
    },
  });
}

export function useToggleFavorite(entityType: EntityType) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      entityId,
      isFavorite,
    }: {
      entityId: string;
      isFavorite: boolean;
    }) => {
      const { error } = isFavorite
        ? await favoritesApi.remove(entityType, entityId)
        : await favoritesApi.add(entityType, entityId);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["favorites", entityType] }),
  });
}
