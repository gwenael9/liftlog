import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
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
import type { ExerciseResponseDto } from '@/api/exercises'
import type { AddRow } from '../../pages/sessions/types'
import { emptyAddRow } from '../../pages/sessions/types'

interface Props {
  exercises: ExerciseResponseDto[] | undefined
  isPending: boolean
  onSubmit: (exerciseId: string, rows: AddRow[]) => Promise<void>
}

export function AddExerciseForm({ exercises, isPending, onSubmit }: Props) {
  const [exerciseId, setExerciseId] = useState('')
  const [rows, setRows] = useState<AddRow[]>([emptyAddRow()])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!exerciseId) return
    await onSubmit(exerciseId, rows)
    setExerciseId('')
    setRows([emptyAddRow()])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ajouter un exercice</CardTitle>
      </CardHeader>
      <CardContent>
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
                  onChange={e => setRows(r => r.map((x, idx) => idx === i ? { ...x, reps: e.target.value } : x))}
                />
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  placeholder="80"
                  value={row.weight_kg}
                  onChange={e => setRows(r => r.map((x, idx) => idx === i ? { ...x, weight_kg: e.target.value } : x))}
                />
                <Checkbox
                  className="mx-auto"
                  checked={row.is_warmup}
                  onCheckedChange={checked => setRows(r => r.map((x, idx) => idx === i ? { ...x, is_warmup: !!checked } : x))}
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
            onClick={() => setRows(r => [...r, emptyAddRow()])}
          >
            <Plus />
            Ajouter une série
          </Button>

          <Button type="submit" className="w-full" disabled={isPending || !exerciseId}>
            Enregistrer
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
