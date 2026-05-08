import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  templatesApi,
  type CreateTemplateDto,
  type UpdateTemplateDto,
} from '@/api/templates'

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await templatesApi.getAll()
      if (error) throw error
      return data!
    },
  })
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['template', id],
    queryFn: async () => {
      const { data, error } = await templatesApi.getOne(id)
      if (error) throw error
      return data!
    },
  })
}

export function useCreateTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateTemplateDto) => templatesApi.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  })
}

export function useUpdateTemplate(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateTemplateDto) => templatesApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      queryClient.invalidateQueries({ queryKey: ['template', id] })
    },
  })
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => templatesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  })
}
