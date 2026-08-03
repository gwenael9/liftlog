import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  sessionsApi,
  type CreateSessionDto,
  type UpdateSessionDto,
  type CreateSetDto,
  type UpdateSetDto,
  type BulkUpdateSetsDto,
} from "@/shared/api/sessions";

export function useSessions(month?: string) {
  return useQuery({
    queryKey: ["sessions", month],
    queryFn: async () => {
      const { data, error } = await sessionsApi.getAll(month);
      if (error) throw error;
      return data!;
    },
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: ["session", id],
    queryFn: async () => {
      const { data, error } = await sessionsApi.getOne(id);
      if (error) throw error;
      return data!;
    },
  });
}

export function useCreateSession(month?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateSessionDto) => {
      const { data, error } = await sessionsApi.create(body);
      if (error) throw error;
      return data!;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["sessions", month] }),
  });
}

export function useUpdateSession(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateSessionDto) => {
      const { data, error } = await sessionsApi.update(id, body);
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["session", id] });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sessionsApi.remove(id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

export function useCreateSet(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateSetDto) => {
      const { data, error } = await sessionsApi.createSet(sessionId, body);
      if (error) throw error;
      return data!;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] }),
  });
}

export function useUpdateSet(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateSetDto }) => {
      const { data, error } = await sessionsApi.updateSet(sessionId, id, body);
      if (error) throw error;
      return data!;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] }),
  });
}

export function useBulkUpdateSets(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: BulkUpdateSetsDto) => {
      const { data, error } = await sessionsApi.bulkUpdateSets(sessionId, body);
      if (error) throw error;
      return data!;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] }),
  });
}

export function useDeleteSet(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sessionsApi.removeSet(sessionId, id);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] }),
  });
}
