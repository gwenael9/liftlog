import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Dumbbell, Globe, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import PageLayout from '@/components/layout/PageLayout'
import { useTemplates, useCreateTemplate } from '@/hooks/useTemplates'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function TemplatesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: templates, isLoading } = useTemplates()
  const createTemplate = useCreateTemplate()

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    createTemplate.mutate(
      {
        name,
        description: description || undefined,
        estimated_duration: duration ? Number(duration) : undefined,
        is_public: isPublic,
        exercises: [],
      },
      {
        onSuccess: ({ data }) => {
          if (data) {
            toast.success(t('templates.created'))
            navigate(`/templates/${data.id}`)
          }
          setOpen(false)
          setName('')
          setDescription('')
          setDuration('')
          setIsPublic(false)
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
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="is_public">{t('templates.visibility.label')}</Label>
          <p className="text-xs text-muted-foreground">
            {isPublic ? t('templates.visibility.publicHint') : t('templates.visibility.privateHint')}
          </p>
        </div>
        <Switch id="is_public" checked={isPublic} onCheckedChange={setIsPublic} />
      </div>
      <Button type="submit" className="w-full" disabled={createTemplate.isPending || !name}>
        {t('templates.createTemplate')}
      </Button>
    </form>
  )

  const templateSkeleton = (
    <>
      {[0, 1, 2].map(i => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )

  return (
    <PageLayout
      title={t('templates.title')}
      data={{ isLoading, items: templates ?? [] }}
      skeleton={templateSkeleton}
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
              <div className="flex items-start justify-between gap-2">
                <CardTitle>{template.name}</CardTitle>
                <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  {template.is_public
                    ? <><Globe className="size-3" />{t('templates.visibility.public')}</>
                    : <><Lock className="size-3" />{t('templates.visibility.private')}</>
                  }
                </span>
              </div>
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
