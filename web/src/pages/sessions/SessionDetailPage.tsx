import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Trash2, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import {
  useSession,
  useUpdateSession,
  useDeleteSession,
  useCreateSet,
  useDeleteSet,
  useExercises,
} from '@/hooks/useSessions'
import type { SetResponseDto, UpdateSessionDto } from '@/api/sessions'

const STATUS_LABELS: Record<string, string> = {
  planned: 'Planifiée',
  in_progress: 'En cours',
  completed: 'Terminée',
  skipped: 'Annulée',
}

const STATUS_COLORS: Record<string, string> = {
  planned: 'text-muted-foreground',
  in_progress: 'text-blue-500',
  completed: 'text-green-500',
  skipped: 'text-orange-400',
}

interface SetRow {
  reps: string
  weight_kg: string
  is_warmup: boolean
}

interface ExerciseGroup {
  exerciseId: string
  exerciseName: string
  sets: SetResponseDto[]
}

const emptyRow = (): SetRow => ({ reps: '', weight_kg: '', is_warmup: false })

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: session, isLoading } = useSession(id!)
  const { data: exercises } = useExercises()
  const updateSession = useUpdateSession(id!)
  const deleteSession = useDeleteSession()
  const createSet = useCreateSet(id!)
  const deleteSet = useDeleteSet(id!)

  const [exerciseId, setExerciseId] = useState('')
  const [rows, setRows] = useState<SetRow[]>([emptyRow()])

  const setsByExercise = useMemo((): ExerciseGroup[] => {
    if (!session) return []
    const map = new Map<string, SetResponseDto[]>()
    for (const s of [...(session.session_sets ?? [])].sort((a, b) => a.set_index - b.set_index)) {
      const list = map.get(s.exercise_id) ?? []
      list.push(s)
      map.set(s.exercise_id, list)
    }
    return Array.from(map.entries()).map(([exId, sets]) => ({
      exerciseId: exId,
      exerciseName: sets[0].exercise.name,
      sets,
    }))
  }, [session])

  function handleStatusUpdate(status: UpdateSessionDto['status']) {
    const body: UpdateSessionDto = { status }
    if (status === 'in_progress' && !session?.started_at) {
      body.started_at = new Date().toISOString()
    }
    if (status === 'completed' && !session?.ended_at) {
      body.ended_at = new Date().toISOString()
    }
    updateSession.mutate(body)
  }

  async function handleAddExercise(e: React.FormEvent) {
    e.preventDefault()
    if (!exerciseId) return

    const existingCount = (session?.session_sets ?? []).filter(
      s => s.exercise_id === exerciseId
    ).length

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      await createSet.mutateAsync({
        exercise_id: exerciseId,
        set_index: existingCount + i + 1,
        reps: row.reps ? Number(row.reps) : undefined,
        weight_kg: row.weight_kg ? Number(row.weight_kg) : undefined,
        is_warmup: row.is_warmup,
        performed_at: new Date().toISOString(),
      })
    }

    setExerciseId('')
    setRows([emptyRow()])
  }

  function updateRow(i: number, patch: Partial<SetRow>) {
    setRows(r => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)))
  }

  function handleDeleteSession() {
    if (!confirm('Supprimer cette séance ?')) return
    deleteSession.mutate(id!, {
      onSuccess: () => navigate('/sessions'),
    })
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Chargement...</div>
  }

  if (!session) {
    return <div className="p-8 text-center text-muted-foreground">Séance introuvable</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/sessions')}>
          <ChevronLeft />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold capitalize">
            {new Date(session.scheduled_date + 'T00:00:00').toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </h1>
          <span className={`text-sm ${STATUS_COLORS[session.status]}`}>
            {STATUS_LABELS[session.status]}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleDeleteSession}>
          <Trash2 className="text-destructive" />
        </Button>
      </div>

      {/* Status actions */}
      <div className="flex gap-2">
        {session.status === 'planned' && (
          <>
            <Button size="sm" onClick={() => handleStatusUpdate('in_progress')} disabled={updateSession.isPending}>
              Démarrer
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate('skipped')} disabled={updateSession.isPending}>
              Annuler
            </Button>
          </>
        )}
        {session.status === 'in_progress' && (
          <Button size="sm" onClick={() => handleStatusUpdate('completed')} disabled={updateSession.isPending}>
            Terminer
          </Button>
        )}
        {(session.status === 'completed' || session.status === 'skipped') && (
          <Button size="sm" variant="outline" onClick={() => handleStatusUpdate('planned')} disabled={updateSession.isPending}>
            Réouvrir
          </Button>
        )}
      </div>

      {/* Sets by exercise */}
      {setsByExercise.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-4">
          Aucun exercice — ajoutez-en ci-dessous
        </p>
      )}

      {setsByExercise.map(group => (
        <Card key={group.exerciseId}>
          <CardHeader>
            <CardTitle className="flex items-baseline gap-2">
              {group.exerciseName}
              <span className="text-sm font-normal text-muted-foreground">
                ×{group.sets.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {group.sets.map(set => (
              <div key={set.id} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-5 shrink-0">
                  S{set.set_index}
                </span>
                <span className="flex-1 text-sm">
                  {set.reps != null && `${set.reps} rép`}
                  {set.reps != null && set.weight_kg != null && ' × '}
                  {set.weight_kg != null && `${set.weight_kg} kg`}
                  {set.duration_sec != null && `${set.duration_sec}s`}
                </span>
                {set.is_warmup && (
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    Échauff.
                  </span>
                )}
                {set.is_pr && (
                  <span className="text-xs text-yellow-500 font-semibold">PR</span>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => deleteSet.mutate(set.id)}
                  disabled={deleteSet.isPending}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Add exercise form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ajouter un exercice</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddExercise} className="space-y-4">
            <div className="space-y-1">
              <Label>Exercice</Label>
              <Select value={exerciseId} onValueChange={v => v && setExerciseId(v)} required>
                <SelectTrigger className="w-full">
                  {exerciseId
                    ? <span>{exercises?.find(ex => ex.id === exerciseId)?.name}</span>
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

            <div className="space-y-2">
              <div className="grid grid-cols-[2rem_1fr_1fr_auto_auto] gap-2 items-center">
                <span />
                <span className="text-xs text-muted-foreground">Répétitions</span>
                <span className="text-xs text-muted-foreground">Poids (kg)</span>
                <span className="text-xs text-muted-foreground">Échauff.</span>
                <span />
              </div>

              {rows.map((row, i) => (
                <div key={i} className="grid grid-cols-[2rem_1fr_1fr_auto_auto] gap-2 items-center">
                  <span className="text-xs text-muted-foreground text-right">S{i + 1}</span>
                  <Input
                    type="number"
                    min={1}
                    placeholder="10"
                    value={row.reps}
                    onChange={e => updateRow(i, { reps: e.target.value })}
                  />
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    placeholder="80"
                    value={row.weight_kg}
                    onChange={e => updateRow(i, { weight_kg: e.target.value })}
                  />
                  <Checkbox
                    className="mx-auto"
                    checked={row.is_warmup}
                    onCheckedChange={checked => updateRow(i, { is_warmup: !!checked })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={rows.length === 1}
                    onClick={() => setRows(r => r.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setRows(r => [...r, emptyRow()])}
            >
              <Plus />
              Ajouter une série
            </Button>

            <Button type="submit" className="w-full" disabled={createSet.isPending}>
              Enregistrer
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
