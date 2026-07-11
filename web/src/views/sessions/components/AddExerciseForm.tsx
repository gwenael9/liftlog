import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from '@/shared/components/ui/select'
import type { ExerciseResponseDto } from '@/shared/api/exercises'
import type { AddRow } from '@/views/sessions/types/session'
import { emptyAddRow } from '@/views/sessions/types/session'
import { useUnitSystem } from '@/shared/hooks/useAuth'
import { weightKgToDisplayString, displayStringToWeightKg, groupExercisesByMuscleGroup } from '@/shared/utils'

interface Props {
  exercises: ExerciseResponseDto[] | undefined
  isPending: boolean
  onSubmit: (exerciseId: string, rows: AddRow[]) => Promise<void>
}

export function AddExerciseForm({ exercises, isPending, onSubmit }: Props) {
  const { t } = useTranslation()
  const unit = useUnitSystem()
  const [exerciseId, setExerciseId] = useState('')
  const [rows, setRows] = useState<AddRow[]>([emptyAddRow()])

  const exerciseGroups = useMemo(
    () => groupExercisesByMuscleGroup(exercises, t),
    [exercises, t],
  )

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
        <CardTitle className="text-base">{t('exerciseForm.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>{t('exerciseForm.exercise')}</Label>
            <Select value={exerciseId} onValueChange={v => v && setExerciseId(v)}>
              <SelectTrigger className="w-full">
                {exerciseId
                  ? <span>{t(`exercises.${exercises?.find(ex => ex.id === exerciseId)?.slug ?? ''}`)}</span>
                  : <span className="text-muted-foreground">{t('exerciseForm.selectExercise')}</span>}
              </SelectTrigger>
              <SelectContent>
                {exerciseGroups.map(group => (
                  <SelectGroup key={group.muscleGroup}>
                    <SelectLabel>{t(`muscleGroups.${group.muscleGroup}`)}</SelectLabel>
                    {group.exercises.map(ex => (
                      <SelectItem key={ex.id} value={ex.id}>
                        {t(`exercises.${ex.slug}`)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-[2rem_1fr_1fr_auto] gap-2 items-center">
              <span />
              <span className="text-xs text-muted-foreground">{t('exerciseForm.repsLong')}</span>
              <span className="text-xs text-muted-foreground">{t('exerciseForm.weightLong', { unit })}</span>
              <span />
            </div>

            {rows.map((row, i) => (
              <div key={i} className="grid grid-cols-[2rem_1fr_1fr_auto] gap-2 items-center">
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
                  placeholder={unit === 'lbs' ? '176' : '80'}
                  value={weightKgToDisplayString(row.weight_kg, unit)}
                  onChange={e => setRows(r => r.map((x, idx) => idx === i ? { ...x, weight_kg: displayStringToWeightKg(e.target.value, unit) } : x))}
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
            {t('exerciseForm.addSetLong')}
          </Button>

          <Button type="submit" className="w-full" disabled={isPending || !exerciseId}>
            {t('exerciseForm.save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
