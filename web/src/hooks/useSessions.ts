import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  sessionsApi,
  type CreateSessionDto,
  type UpdateSessionDto,
  type CreateSetDto,
  type UpdateSetDto,
  type BulkUpdateSetsDto,
} from '@/api/sessions'
import { exercisesApi } from '@/api/exercises'

export function useSessions(month?: string) {
  return useQuery({
    queryKey: ['sessions', month],
    queryFn: async () => {
      const { data, error } = await sessionsApi.getAll(month)
      if (error) throw error
      return data!
    },
  })
}

export function useSession(id: string) {
  return useQuery({
    queryKey: ['session', id],
    queryFn: async () => {
      const { data, error } = await sessionsApi.getOne(id)
      if (error) throw error
      return data!
    },
  })
}

export function useCreateSession(month?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateSessionDto) => sessionsApi.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions', month] }),
  })
}

export function useUpdateSession(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateSessionDto) => sessionsApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['session', id] })
    },
  })
}

export function useDeleteSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => sessionsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  })
}

export function useCreateSet(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateSetDto) => sessionsApi.createSet(sessionId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['session', sessionId] }),
  })
}

export function useUpdateSet(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateSetDto }) =>
      sessionsApi.updateSet(sessionId, id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['session', sessionId] }),
  })
}

export function useBulkUpdateSets(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: BulkUpdateSetsDto) => sessionsApi.bulkUpdateSets(sessionId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['session', sessionId] }),
  })
}

export function useDeleteSet(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => sessionsApi.removeSet(sessionId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['session', sessionId] }),
  })
}

export function useExercises() {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const { data, error } = await exercisesApi.getAll()
      if (error) throw error
      return data!
    },
  })
}
