import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Trash2, GripVertical, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { useTemplate, useUpdateTemplate, useDeleteTemplate } from '@/hooks/useTemplates'
import { useExercises } from '@/hooks/useSessions'
import type { TemplateExerciseItemDto } from '@/api/templates'

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

  const [addExerciseId, setAddExerciseId] = useState('')
  const [addTargetSets, setAddTargetSets] = useState('')
  const [addTargetReps, setAddTargetReps] = useState('')
  const [addRestSeconds, setAddRestSeconds] = useState('')

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
    })))
    setDirty(false)
  }, [template])

  function handleAddExercise() {
    if (!addExerciseId) return
    const newRow: ExerciseRow = {
      _key: nextKey(),
      exercise_id: addExerciseId,
      order_index: rows.length + 1,
      target_sets: addTargetSets ? Number(addTargetSets) : undefined,
      target_reps: addTargetReps ? Number(addTargetReps) : undefined,
      rest_seconds: addRestSeconds ? Number(addRestSeconds) : undefined,
    }
    setRows(r => [...r, newRow])
    setAddExerciseId('')
    setAddTargetSets('')
    setAddTargetReps('')
    setAddRestSeconds('')
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
    if (!confirm('Supprimer ce template ?')) return
    deleteTemplate.mutate(id!, {
      onSuccess: () => navigate('/templates'),
    })
  }

  function exerciseName(exerciseId: string) {
    return exercises?.find(ex => ex.id === exerciseId)?.name ?? exerciseId
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Chargement...</div>
  }

  if (!template) {
    return <div className="p-8 text-center text-muted-foreground">Template introuvable</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Header */}
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

      {/* Meta fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Nom</Label>
            <Input
              value={name}
              onChange={e => { setName(e.target.value); setDirty(true) }}
              placeholder="Push Day"
            />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={e => { setDescription(e.target.value); setDirty(true) }}
              placeholder="Optionnel"
            />
          </div>
          <div className="space-y-1">
            <Label>Durée estimée (min)</Label>
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

      {/* Exercises list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Exercices
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
              Aucun exercice — ajoutez-en ci-dessous
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
                {row.target_reps != null && <span>{row.target_reps} rép</span>}
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

      {/* Add exercise */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ajouter un exercice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Exercice</Label>
            <Select value={addExerciseId} onValueChange={v => v && setAddExerciseId(v)}>
              <SelectTrigger className="w-full">
                {addExerciseId
                  ? <span>{exerciseName(addExerciseId)}</span>
                  : <span className="text-muted-foreground">Sélectionner un exercice</span>}
              </SelectTrigger>
              <SelectContent>
                {exercises?.map(ex => (
                  <SelectItem key={ex.id} value={ex.id}>
                    {ex.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label>Séries</Label>
              <Input
                type="number"
                min={1}
                placeholder="3"
                value={addTargetSets}
                onChange={e => setAddTargetSets(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Reps</Label>
              <Input
                type="number"
                min={1}
                placeholder="10"
                value={addTargetReps}
                onChange={e => setAddTargetReps(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Repos (s)</Label>
              <Input
                type="number"
                min={0}
                placeholder="90"
                value={addRestSeconds}
                onChange={e => setAddRestSeconds(e.target.value)}
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleAddExercise}
            disabled={!addExerciseId}
          >
            <Plus />
            Ajouter
          </Button>
        </CardContent>
      </Card>

      {/* Save */}
      <Button
        className="w-full"
        onClick={handleSave}
        disabled={updateTemplate.isPending || !dirty}
      >
        {updateTemplate.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
      </Button>
    </div>
  )
}
