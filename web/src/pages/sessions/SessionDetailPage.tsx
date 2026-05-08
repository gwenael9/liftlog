import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Trash2, Plus } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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
  useUpdateSet,
  useDeleteSession,
  useCreateSet,
  useDeleteSet,
  useExercises,
} from '@/hooks/useSessions'
import type { SetResponseDto, UpdateSessionDto } from '@/api/sessions'
import { STATUS_COLORS, STATUS_LABELS } from '@/utils'

interface SetEditValue {
  reps: string
  weight_kg: string
  is_warmup: boolean
}

interface AddRow {
  reps: string
  weight_kg: string
  is_warmup: boolean
}

interface ExerciseGroup {
  exerciseId: string
  exerciseName: string
  sets: SetResponseDto[]
}

const emptyAddRow = (): AddRow => ({ reps: '', weight_kg: '', is_warmup: false })

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: session, isLoading } = useSession(id!)
  const { data: exercises } = useExercises()
  const updateSession = useUpdateSession(id!)
  const updateSet = useUpdateSet(id!)
  const deleteSession = useDeleteSession()
  const createSet = useCreateSet(id!)
  const deleteSet = useDeleteSet(id!)

  const [editValues, setEditValues] = useState<Record<string, SetEditValue>>({})
  const [pendingRows, setPendingRows] = useState<Record<string, AddRow[]>>({})
  const [activeIndex, setActiveIndex] = useState(0)

  // Form state for adding a new exercise
  const [addExerciseId, setAddExerciseId] = useState('')
  const [addRows, setAddRows] = useState<AddRow[]>([emptyAddRow()])

  const setIds = useMemo(
    () => (session?.session_sets ?? []).map(s => s.id).sort().join(','),
    [session]
  )

  useEffect(() => {
    if (!session) return;
    setEditValues(prev => {
      const next: Record<string, SetEditValue> = {}
      for (const s of session.session_sets ?? []) {
        next[s.id] = prev[s.id] ?? {
          reps: s.reps != null ? String(s.reps) : '',
          weight_kg: s.weight_kg != null ? String(s.weight_kg) : '',
          is_warmup: s.is_warmup,
        }
      }
      return next
    })
  }, [session, setIds]);

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

  // Clamp activeIndex if groups shrink
  const clampedIndex = Math.min(activeIndex, Math.max(0, setsByExercise.length - 1))
  useEffect(() => {
    if (clampedIndex !== activeIndex) setActiveIndex(clampedIndex)
  }, [clampedIndex, activeIndex])

  function isGroupDirty(group: ExerciseGroup): boolean {
    const hasPending = (pendingRows[group.exerciseId] ?? []).length > 0
    if (hasPending) return true
    return group.sets.some(set => {
      const vals = editValues[set.id]
      if (!vals) return false
      const orig = {
        reps: set.reps != null ? String(set.reps) : '',
        weight_kg: set.weight_kg != null ? String(set.weight_kg) : '',
        is_warmup: set.is_warmup,
      }
      return vals.reps !== orig.reps || vals.weight_kg !== orig.weight_kg || vals.is_warmup !== orig.is_warmup
    })
  }

  function patchEdit(setId: string, patch: Partial<SetEditValue>) {
    setEditValues(prev => ({ ...prev, [setId]: { ...prev[setId], ...patch } }))
  }

  async function saveGroup(group: ExerciseGroup) {
    for (const set of group.sets) {
      const vals = editValues[set.id]
      if (!vals) continue
      await updateSet.mutateAsync({
        id: set.id,
        body: {
          reps: vals.reps ? Number(vals.reps) : undefined,
          weight_kg: vals.weight_kg ? Number(vals.weight_kg) : undefined,
          is_warmup: vals.is_warmup,
        },
      })
    }
    const pending = pendingRows[group.exerciseId] ?? []
    for (let i = 0; i < pending.length; i++) {
      const row = pending[i]
      await createSet.mutateAsync({
        exercise_id: group.exerciseId,
        set_index: group.sets.length + i + 1,
        reps: row.reps ? Number(row.reps) : undefined,
        weight_kg: row.weight_kg ? Number(row.weight_kg) : undefined,
        is_warmup: row.is_warmup,
        performed_at: new Date().toISOString(),
      })
    }
    setPendingRows(prev => ({ ...prev, [group.exerciseId]: [] }))
  }

  function addPendingRow(exerciseId: string) {
    setPendingRows(prev => ({
      ...prev,
      [exerciseId]: [...(prev[exerciseId] ?? []), emptyAddRow()],
    }))
  }

  function patchPendingRow(exerciseId: string, i: number, patch: Partial<AddRow>) {
    setPendingRows(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((r, idx) => idx === i ? { ...r, ...patch } : r),
    }))
  }

  function removePendingRow(exerciseId: string, i: number) {
    setPendingRows(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].filter((_, idx) => idx !== i),
    }))
  }

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
    if (!addExerciseId) return

    const existingCount = (session?.session_sets ?? []).filter(
      s => s.exercise_id === addExerciseId
    ).length

    for (let i = 0; i < addRows.length; i++) {
      const row = addRows[i]
      await createSet.mutateAsync({
        exercise_id: addExerciseId,
        set_index: existingCount + i + 1,
        reps: row.reps ? Number(row.reps) : undefined,
        weight_kg: row.weight_kg ? Number(row.weight_kg) : undefined,
        is_warmup: row.is_warmup,
        performed_at: new Date().toISOString(),
      })
    }

    // Jump to the newly added/updated exercise card
    const newIndex = setsByExercise.findIndex(g => g.exerciseId === addExerciseId)
    if (newIndex !== -1) {
      setActiveIndex(newIndex)
    } else {
      setActiveIndex(setsByExercise.length) // will be the new last
    }

    setAddExerciseId('')
    setAddRows([emptyAddRow()])
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

  const total = setsByExercise.length

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/sessions')}>
          <ChevronLeft />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold capitalize">
            {new Date(session.scheduled_date + 'T00:00:00').toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </h2>
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

      {total === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-4">
          Aucun exercice — ajoutez-en ci-dessous
        </p>
      ) : (
        <div className="space-y-3">
          {(() => {
            const group = setsByExercise[clampedIndex]
            if (!group) return null
            return (
              <Card key={group.exerciseId}>
                    <CardHeader>
                      <CardTitle className="flex items-baseline gap-2">
                        {group.exerciseName}
                        <span className="text-sm font-normal text-muted-foreground">
                          ×{group.sets.length + (pendingRows[group.exerciseId]?.length ?? 0)}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-[1.5rem_1fr_1fr_auto_auto] gap-2 items-center px-1">
                        <span />
                        <span className="text-xs text-muted-foreground">Rép</span>
                        <span className="text-xs text-muted-foreground">kg</span>
                        <span className="text-xs text-muted-foreground">Éch.</span>
                        <span />
                      </div>

                      {group.sets.map(set => {
                        const vals = editValues[set.id] ?? { reps: '', weight_kg: '', is_warmup: false }
                        return (
                          <div key={set.id} className="grid grid-cols-[1.5rem_1fr_1fr_auto_auto] gap-2 items-center">
                            <span className="text-xs text-muted-foreground text-right">S{set.set_index}</span>
                            <Input
                              type="number"
                              min={0}
                              placeholder="—"
                              value={vals.reps}
                              onChange={e => patchEdit(set.id, { reps: e.target.value })}
                            />
                            <Input
                              type="number"
                              min={0}
                              step={0.5}
                              placeholder="—"
                              value={vals.weight_kg}
                              onChange={e => patchEdit(set.id, { weight_kg: e.target.value })}
                            />
                            <Checkbox
                              className="mx-auto"
                              checked={vals.is_warmup}
                              onCheckedChange={checked => patchEdit(set.id, { is_warmup: !!checked })}
                            />
                            <div className="flex items-center gap-1">
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
                          </div>
                        )
                      })}

                      {(pendingRows[group.exerciseId] ?? []).map((row, i) => (
                        <div key={`pending-${i}`} className="grid grid-cols-[1.5rem_1fr_1fr_auto_auto] gap-2 items-center">
                          <span className="text-xs text-muted-foreground text-right">
                            S{group.sets.length + i + 1}
                          </span>
                          <Input
                            type="number"
                            min={0}
                            placeholder="—"
                            value={row.reps}
                            onChange={e => patchPendingRow(group.exerciseId, i, { reps: e.target.value })}
                          />
                          <Input
                            type="number"
                            min={0}
                            step={0.5}
                            placeholder="—"
                            value={row.weight_kg}
                            onChange={e => patchPendingRow(group.exerciseId, i, { weight_kg: e.target.value })}
                          />
                          <Checkbox
                            className="mx-auto"
                            checked={row.is_warmup}
                            onCheckedChange={checked => patchPendingRow(group.exerciseId, i, { is_warmup: !!checked })}
                          />
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removePendingRow(group.exerciseId, i)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full text-muted-foreground"
                        onClick={() => addPendingRow(group.exerciseId)}
                      >
                        <Plus />
                        Série
                      </Button>
                    </CardContent>

                    {isGroupDirty(group) && (
                      <CardFooter>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => saveGroup(group)}
                          disabled={updateSet.isPending || createSet.isPending}
                        >
                          Enregistrer
                        </Button>
                      </CardFooter>
                    )}
              </Card>
            )
          })()}

          <div className="flex items-center justify-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveIndex(i => Math.max(0, i - 1))}
              disabled={clampedIndex === 0}
            >
              <ChevronLeft className="size-4" />
            </Button>

            <div className="flex gap-1.5">
              {setsByExercise.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`size-2 rounded-full transition-colors ${
                    i === clampedIndex ? 'bg-foreground' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveIndex(i => Math.min(total - 1, i + 1))}
              disabled={clampedIndex === total - 1}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ajouter un exercice</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddExercise} className="space-y-4">
            <div className="space-y-1">
              <Label>Exercice</Label>
              <Select value={addExerciseId} onValueChange={v => v && setAddExerciseId(v)}>
                <SelectTrigger className="w-full">
                  {addExerciseId
                    ? <span>{exercises?.find(ex => ex.id === addExerciseId)?.name}</span>
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

              {addRows.map((row, i) => (
                <div key={i} className="grid grid-cols-[2rem_1fr_1fr_auto_auto] gap-2 items-center">
                  <span className="text-xs text-muted-foreground text-right">S{i + 1}</span>
                  <Input
                    type="number"
                    min={1}
                    placeholder="10"
                    value={row.reps}
                    onChange={e => setAddRows(r => r.map((x, idx) => idx === i ? { ...x, reps: e.target.value } : x))}
                  />
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    placeholder="80"
                    value={row.weight_kg}
                    onChange={e => setAddRows(r => r.map((x, idx) => idx === i ? { ...x, weight_kg: e.target.value } : x))}
                  />
                  <Checkbox
                    className="mx-auto"
                    checked={row.is_warmup}
                    onCheckedChange={checked => setAddRows(r => r.map((x, idx) => idx === i ? { ...x, is_warmup: !!checked } : x))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={addRows.length === 1}
                    onClick={() => setAddRows(r => r.filter((_, idx) => idx !== i))}
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
              onClick={() => setAddRows(r => [...r, emptyAddRow()])}
            >
              <Plus />
              Ajouter une série
            </Button>

            <Button type="submit" className="w-full" disabled={createSet.isPending || !addExerciseId}>
              Enregistrer
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
