import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Dumbbell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PageLayout from '@/components/layout/PageLayout'
import { useTemplates, useCreateTemplate } from '@/hooks/useTemplates'
import { useTranslation } from 'react-i18next'

export function TemplatesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: templates, isLoading } = useTemplates()
  const createTemplate = useCreateTemplate()

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    createTemplate.mutate(
      {
        name,
        description: description || undefined,
        estimated_duration: duration ? Number(duration) : undefined,
        exercises: [],
      },
      {
        onSuccess: ({ data }) => {
          if (data) navigate(`/templates/${data.id}`)
          setOpen(false)
          setName('')
          setDescription('')
          setDuration('')
        },
      }
    )
  }

  const dialogContent = (
    <form onSubmit={handleCreate} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">{t('templates.form.name')}</Label>
        <Input
          id="name"
          placeholder="Push Day"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">{t('templates.form.description')}</Label>
        <Input
          id="description"
          placeholder={t('common.optional')}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="duration">{t('templates.form.duration')}</Label>
        <Input
          id="duration"
          type="number"
          min={1}
          placeholder="60"
          value={duration}
          onChange={e => setDuration(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={createTemplate.isPending || !name}>
        {t('templates.createTemplate')}
      </Button>
    </form>
  )

  return (
    <PageLayout
      title={t('templates.title')}
      data={{ isLoading, items: templates ?? [] }}
      dialog={{
        open,
        onOpenChange: setOpen,
        title: t('templates.newTemplate'),
        content: dialogContent,
      }}
    >
      {templates?.map(template => {
        const exercises = template.template_exercises ?? []
        return (
          <Card
            key={template.id}
            className="cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
            onClick={() => navigate(`/templates/${template.id}`)}
          >
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              {template.description && (
                <CardDescription>{template.description}</CardDescription>
              )}
            </CardHeader>
            {(exercises.length > 0 || template.estimated_duration) && (
              <CardContent>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {exercises.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Dumbbell className="size-3" />
                      {t('common.exerciseCount', { count: exercises.length })}
                    </span>
                  )}
                  {template.estimated_duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {template.estimated_duration} min
                    </span>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </PageLayout>
  )
}
