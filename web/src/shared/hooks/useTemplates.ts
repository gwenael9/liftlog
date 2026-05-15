import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  templatesApi,
  type CreateTemplateDto,
  type UpdateTemplateDto,
} from '@/shared/api/templates'

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
    mutationFn: async (body: CreateTemplateDto) => {
      const { data, error } = await templatesApi.create(body)
      if (error) throw error
      return data!
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  })
}

export function useUpdateTemplate(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateTemplateDto) => {
      const { data, error } = await templatesApi.update(id, body)
      if (error) throw error
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      queryClient.invalidateQueries({ queryKey: ['template', id] })
    },
  })
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await templatesApi.remove(id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  })
}
