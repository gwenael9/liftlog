import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
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
import type { ExerciseResponseDto } from '@/api/exercises'
import type { AddRow } from '@/pages/sessions/types'
import { emptyAddRow } from '@/pages/sessions/types'

export interface TemplateExerciseData {
  targetSets?: number
  targetReps?: number
  restSeconds?: number
}

type Props = {
  exercises: ExerciseResponseDto[] | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending?: boolean
} & (
  | { mode: 'session'; onSubmit: (exerciseId: string, rows: AddRow[]) => void | Promise<void> }
  | { mode: 'template'; onSubmit: (exerciseId: string, data: TemplateExerciseData) => void }
)

export function AddExerciseDialog(props: Props) {
  const { exercises, open, onOpenChange, isPending } = props

  const [exerciseId, setExerciseId] = useState('')
  // Session state
  const [rows, setRows] = useState<AddRow[]>([emptyAddRow()])
  // Template state
  const [targetSets, setTargetSets] = useState('')
  const [targetReps, setTargetReps] = useState('')
  const [restSeconds, setRestSeconds] = useState('')

  function reset() {
    setExerciseId('')
    setRows([emptyAddRow()])
    setTargetSets('')
    setTargetReps('')
    setRestSeconds('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!exerciseId) return
    if (props.mode === 'session') {
      await props.onSubmit(exerciseId, rows)
    } else {
      props.onSubmit(exerciseId, {
        targetSets: targetSets ? Number(targetSets) : undefined,
        targetReps: targetReps ? Number(targetReps) : undefined,
        restSeconds: restSeconds ? Number(restSeconds) : undefined,
      })
    }
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent title="Ajouter un exercice">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Exercice</Label>
            <Select value={exerciseId} onValueChange={v => v && setExerciseId(v)}>
              <SelectTrigger className="w-full">
                {exerciseId
                  ? <span>{exercises?.find(ex => ex.id === exerciseId)?.name}</span>
                  : <span className="text-muted-foreground">Sélectionner un exercice</span>}
              </SelectTrigger>
              <SelectContent>
                {exercises?.map(ex => (
                  <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {props.mode === 'session' && (
            <div className="space-y-2">
              <div className="grid grid-cols-[2rem_1fr_1fr_auto_auto] gap-2 items-center">
                <span />
                <span className="text-xs text-muted-foreground">Rép</span>
                <span className="text-xs text-muted-foreground">kg</span>
                <span className="text-xs text-muted-foreground">Éch.</span>
                <span />
              </div>
              {rows.map((row, i) => (
                <div key={i} className="grid grid-cols-[2rem_1fr_1fr_auto_auto] gap-2 items-center">
                  <span className="text-xs text-muted-foreground text-right">S{i + 1}</span>
                  <Input
                    type="number" min={1} placeholder="10" value={row.reps}
                    onChange={e => setRows(r => r.map((x, idx) => idx === i ? { ...x, reps: e.target.value } : x))}
                  />
                  <Input
                    type="number" min={0} step={0.5} placeholder="80" value={row.weight_kg}
                    onChange={e => setRows(r => r.map((x, idx) => idx === i ? { ...x, weight_kg: e.target.value } : x))}
                  />
                  <Checkbox
                    className="mx-auto"
                    checked={row.is_warmup}
                    onCheckedChange={checked => setRows(r => r.map((x, idx) => idx === i ? { ...x, is_warmup: !!checked } : x))}
                  />
                  <Button
                    type="button" variant="ghost" size="icon-sm"
                    disabled={rows.length === 1}
                    onClick={() => setRows(r => r.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              ))}
              <Button
                type="button" variant="outline" size="sm" className="w-full"
                onClick={() => setRows(r => [...r, emptyAddRow()])}
              >
                <Plus className="size-3" />
                Série
              </Button>
            </div>
          )}

          {props.mode === 'template' && (
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label>Séries</Label>
                <Input type="number" min={1} placeholder="3" value={targetSets} onChange={e => setTargetSets(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Reps</Label>
                <Input type="number" min={1} placeholder="10" value={targetReps} onChange={e => setTargetReps(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Repos (s)</Label>
                <Input type="number" min={0} placeholder="90" value={restSeconds} onChange={e => setRestSeconds(e.target.value)} />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isPending || !exerciseId}>
            Ajouter
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
