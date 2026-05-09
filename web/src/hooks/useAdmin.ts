import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/api/users'
import { apiClient } from '@/api/client'
import type { components } from '@/api/schema'

type CreateExerciseDto = components['schemas']['CreateExerciseDto']
type UpdateExerciseDto = components['schemas']['UpdateExerciseDto']

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data } = await usersApi.getAll()
      return data ?? []
    },
  })
}

export function useAdminCreateExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateExerciseDto) =>
      apiClient.POST('/exercises', { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercises'] }),
  })
}

export function useAdminUpdateExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateExerciseDto }) =>
      apiClient.PUT('/exercises/{id}', { params: { path: { id } }, body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercises'] }),
  })
}

export function useAdminDeleteExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.DELETE('/exercises/{id}', { params: { path: { id } } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercises'] }),
  })
}

export function useAdminDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}
