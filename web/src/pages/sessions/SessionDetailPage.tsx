import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  useSession,
  useUpdateSession,
  useUpdateSet,
  useDeleteSession,
  useCreateSet,
  useDeleteSet,
  useExercises,
} from '@/hooks/useSessions'
import { STATUS_COLORS, STATUS_LABELS } from '@/utils'
import type { UpdateSessionDto, SetResponseDto } from '@/api/sessions'
import type { SetEditValue, AddRow, ExerciseGroup } from './types'
import { emptyAddRow } from './types'
import { ExerciseCard } from '@/components/session'
import { AddExerciseDialog } from '@/components/AddExerciseDialog'
import Loader from '@/components/Loader'

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

  // Overlay of user edits keyed by set ID — server values are the baseline
  const [patches, setPatches] = useState<Record<string, Partial<SetEditValue>>>({})
  const [pendingRows, setPendingRows] = useState<Record<string, AddRow[]>>({})
  const [activeIndex, setActiveIndex] = useState(0)
  const [deletingSetIds, setDeletingSetIds] = useState<Set<string>>(new Set())
  const [addOpen, setAddOpen] = useState(false)

  const setsByExercise = useMemo((): ExerciseGroup[] => {
    if (!session) return []
    const map = new Map<string, SetResponseDto[]>()
    for (const s of [...(session.session_sets ?? [])].sort((a, b) => a.set_index - b.set_index)) {
      if (deletingSetIds.has(s.id)) continue
      const list = map.get(s.exercise_id) ?? []
      list.push(s)
      map.set(s.exercise_id, list)
    }
    return Array.from(map.entries())
      .filter(([, sets]) => sets.length > 0)
      .map(([exId, sets]) => ({
        exerciseId: exId,
        exerciseName: sets[0].exercise.name,
        trackingType: (sets[0].exercise.tracking_type ?? 'strength') as 'strength' | 'duration',
        sets,
      }))
  }, [session, deletingSetIds])

  const total = setsByExercise.length
  const clampedIndex = Math.min(activeIndex, Math.max(0, total - 1))
  const group = setsByExercise[clampedIndex]

  function resolveEditValue(set: SetResponseDto): SetEditValue {
    const patch = patches[set.id] ?? {}
    return {
      reps: patch.reps ?? (set.reps != null ? String(set.reps) : ''),
      weight_kg: patch.weight_kg ?? (set.weight_kg != null ? String(set.weight_kg) : ''),
      duration_sec: patch.duration_sec ?? (set.duration_sec != null ? String(set.duration_sec) : ''),
      is_warmup: patch.is_warmup ?? set.is_warmup,
    }
  }

  // Compute edit values only for the visible group
  const groupEditValues: Record<string, SetEditValue> = group
    ? Object.fromEntries(group.sets.map(set => [set.id, resolveEditValue(set)]))
    : {}

  function isGroupDirty(g: ExerciseGroup): boolean {
    if ((pendingRows[g.exerciseId] ?? []).length > 0) return true
    return g.sets.some(set => {
      const patch = patches[set.id]
      if (!patch) return false
      return (
        (patch.reps !== undefined && patch.reps !== (set.reps != null ? String(set.reps) : '')) ||
        (patch.weight_kg !== undefined && patch.weight_kg !== (set.weight_kg != null ? String(set.weight_kg) : '')) ||
        (patch.duration_sec !== undefined && patch.duration_sec !== (set.duration_sec != null ? String(set.duration_sec) : '')) ||
        (patch.is_warmup !== undefined && patch.is_warmup !== set.is_warmup)
      )
    })
  }

  function patchEdit(setId: string, patch: Partial<SetEditValue>) {
    setPatches(prev => ({ ...prev, [setId]: { ...prev[setId], ...patch } }))
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

  async function handleDeleteSet(setId: string) {
    setDeletingSetIds(prev => new Set([...prev, setId]))
    setPatches(prev => { const n = { ...prev }; delete n[setId]; return n })
    try {
      await deleteSet.mutateAsync(setId)
    } catch {
      setDeletingSetIds(prev => { const n = new Set(prev); n.delete(setId); return n })
    }
  }

  async function saveGroup(g: ExerciseGroup) {
    for (const set of g.sets) {
      const vals = resolveEditValue(set)
      await updateSet.mutateAsync({
        id: set.id,
        body: {
          reps: vals.reps ? Number(vals.reps) : undefined,
          weight_kg: vals.weight_kg ? Number(vals.weight_kg) : undefined,
          duration_sec: vals.duration_sec ? Number(vals.duration_sec) : undefined,
          is_warmup: vals.is_warmup,
        },
      })
    }
    const pending = pendingRows[g.exerciseId] ?? []
    for (let i = 0; i < pending.length; i++) {
      const row = pending[i]
      await createSet.mutateAsync({
        exercise_id: g.exerciseId,
        set_index: g.sets.length + i + 1,
        reps: row.reps ? Number(row.reps) : undefined,
        weight_kg: row.weight_kg ? Number(row.weight_kg) : undefined,
        duration_sec: row.duration_sec ? Number(row.duration_sec) : undefined,
        is_warmup: row.is_warmup,
        performed_at: new Date().toISOString(),
      })
    }
    // Clear patches and pending for this group after successful save
    setPatches(prev => {
      const next = { ...prev }
      for (const set of g.sets) delete next[set.id]
      return next
    })
    setPendingRows(prev => ({ ...prev, [g.exerciseId]: [] }))
  }

  async function handleAddExercise(exerciseId: string, rows: AddRow[]) {
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
        duration_sec: row.duration_sec ? Number(row.duration_sec) : undefined,
        is_warmup: row.is_warmup,
        performed_at: new Date().toISOString(),
      })
    }
    const newIndex = setsByExercise.findIndex(g => g.exerciseId === exerciseId)
    setActiveIndex(newIndex !== -1 ? newIndex : setsByExercise.length)
  }

  function handleStatusUpdate(status: UpdateSessionDto['status']) {
    const body: UpdateSessionDto = { status }
    if (status === 'in_progress' && !session?.started_at) body.started_at = new Date().toISOString()
    if (status === 'completed' && !session?.ended_at) body.ended_at = new Date().toISOString()
    updateSession.mutate(body)
  }

  function handleDeleteSession() {
    if (!confirm('Supprimer cette séance ?')) return
    deleteSession.mutate(id!, { onSuccess: () => navigate('/sessions') })
  }

  if (isLoading) return <Loader />;
  if (!session) return <div className="p-8 text-center text-muted-foreground">Séance introuvable</div>

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/sessions')}>
          <ChevronLeft />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold capitalize">
            {new Date(session.scheduled_date + 'T00:00:00').toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
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
          {group && (
            <ExerciseCard
              group={group}
              editValues={groupEditValues}
              pendingRows={pendingRows[group.exerciseId] ?? []}
              isDirty={isGroupDirty(group)}
              isSaving={updateSet.isPending || createSet.isPending}
              onPatchEdit={patchEdit}
              onAddPending={() => addPendingRow(group.exerciseId)}
              onPatchPending={(i, patch) => patchPendingRow(group.exerciseId, i, patch)}
              onRemovePending={i => removePendingRow(group.exerciseId, i)}
              onDeleteSet={handleDeleteSet}
              onSave={() => saveGroup(group)}
            />
          )}

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

      <Button variant="outline" className="w-full" onClick={() => setAddOpen(true)}>
        <Plus className="size-4" />
        Ajouter un exercice
      </Button>

      <AddExerciseDialog
        mode="session"
        exercises={exercises}
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAddExercise}
        isPending={createSet.isPending}
      />
    </div>
  )
}
