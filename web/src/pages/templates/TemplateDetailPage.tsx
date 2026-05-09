import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Trash2, GripVertical, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTemplate, useUpdateTemplate, useDeleteTemplate } from '@/hooks/useTemplates'
import { useExercises } from '@/hooks/useSessions'
import { AddExerciseDialog } from '@/components/AddExerciseDialog'
import type { TemplateExerciseItemDto } from '@/api/templates'
import { useTranslation } from 'react-i18next'

interface ExerciseRow extends TemplateExerciseItemDto {
  _key: string
}

let keyCounter = 0
const nextKey = () => String(++keyCounter)

function rowFromItem(item: TemplateExerciseItemDto): ExerciseRow {
  return { ...item, _key: nextKey() }
}

export function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: template, isLoading } = useTemplate(id!)
  const { data: exercises } = useExercises()
  const updateTemplate = useUpdateTemplate(id!)
  const deleteTemplate = useDeleteTemplate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [rows, setRows] = useState<ExerciseRow[]>([])
  const [dirty, setDirty] = useState(false)

  const [addOpen, setAddOpen] = useState(false)

  useEffect(() => {
    if (!template) return
    setName(template.name)
    setDescription(template.description ?? '')
    setDuration(template.estimated_duration != null ? String(template.estimated_duration) : '')
    setRows((template.template_exercises ?? []).map(ex => rowFromItem({
      exercise_id: ex.exercise_id,
      order_index: ex.order_index,
      target_sets: ex.target_sets ?? undefined,
      target_reps: ex.target_reps ?? undefined,
      rest_seconds: ex.rest_seconds ?? undefined,
      target_duration_sec: ex.target_duration_sec ?? undefined,
    })))
    setDirty(false)
  }, [template])

  function handleAddExercise(exerciseId: string, data: { targetSets?: number; targetReps?: number; restSeconds?: number; targetDurationSec?: number }) {
    setRows(r => [...r, {
      _key: nextKey(),
      exercise_id: exerciseId,
      order_index: r.length + 1,
      target_sets: data.targetSets,
      target_reps: data.targetReps,
      rest_seconds: data.restSeconds,
      target_duration_sec: data.targetDurationSec,
    }])
    setDirty(true)
  }

  function handleRemoveExercise(key: string) {
    setRows(r => {
      const updated = r.filter(row => row._key !== key)
      return updated.map((row, i) => ({ ...row, order_index: i + 1 }))
    })
    setDirty(true)
  }

  function handleSave() {
    updateTemplate.mutate(
      {
        name,
        description: description || undefined,
        estimated_duration: duration ? Number(duration) : undefined,
        exercises: rows.map(({ _key: _, ...item }) => item),
      },
      { onSuccess: () => setDirty(false) }
    )
  }

  function handleDelete() {
    if (!confirm(t('templates.deleteConfirm'))) return
    deleteTemplate.mutate(id!, {
      onSuccess: () => navigate('/templates'),
    })
  }

  function exerciseName(exerciseId: string) {
    const slug = exercises?.find(ex => ex.id === exerciseId)?.slug
    return slug ? t(`exercises.${slug}`) : exerciseId
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">{t('templates.loading')}</div>
  }

  if (!template) {
    return <div className="p-8 text-center text-muted-foreground">{t('templates.notFound')}</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/templates')}>
          <ChevronLeft />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{template.name}</h1>
          {template.description && (
            <p className="text-sm text-muted-foreground truncate">{template.description}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={handleDelete}>
          <Trash2 className="text-destructive" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('templates.section.info')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>{t('templates.form.name')}</Label>
            <Input
              value={name}
              onChange={e => { setName(e.target.value); setDirty(true) }}
              placeholder="Push Day"
            />
          </div>
          <div className="space-y-1">
            <Label>{t('templates.form.description')}</Label>
            <Input
              value={description}
              onChange={e => { setDescription(e.target.value); setDirty(true) }}
              placeholder={t('common.optional')}
            />
          </div>
          <div className="space-y-1">
            <Label>{t('templates.form.duration')}</Label>
            <Input
              type="number"
              min={1}
              value={duration}
              onChange={e => { setDuration(e.target.value); setDirty(true) }}
              placeholder="60"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t('templates.section.exercises')}
            {rows.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ×{rows.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {rows.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              {t('templates.noExercises')}
            </p>
          )}
          {rows.map(row => (
            <div key={row._key} className="flex items-center gap-2">
              <GripVertical className="size-4 text-muted-foreground shrink-0" />
              <span className="flex-1 text-sm font-medium truncate">
                {exerciseName(row.exercise_id)}
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                {row.target_sets != null && <span>{row.target_sets}×</span>}
                {row.target_duration_sec != null
                  ? <span>{row.target_duration_sec}s</span>
                  : row.target_reps != null && <span>{row.target_reps} rép</span>}
                {row.rest_seconds != null && <span>{row.rest_seconds}s repos</span>}
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleRemoveExercise(row._key)}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full" onClick={() => setAddOpen(true)}>
        <Plus className="size-4" />
        {t('templates.addExercise')}
      </Button>

      <AddExerciseDialog
        mode="template"
        exercises={exercises}
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAddExercise}
      />

      <Button
        className="w-full"
        onClick={handleSave}
        disabled={updateTemplate.isPending || !dirty}
      >
        {updateTemplate.isPending ? t('templates.saving') : t('templates.save')}
      </Button>
    </div>
  )
}
