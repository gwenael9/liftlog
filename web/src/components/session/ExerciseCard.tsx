import { Trash2, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import type { ExerciseGroup, SetEditValue, AddRow } from '@/types/session'
import { useTranslation } from 'react-i18next'

interface Props {
  group: ExerciseGroup
  editValues: Record<string, SetEditValue>
  pendingRows: AddRow[]
  onPatchEdit: (setId: string, patch: Partial<SetEditValue>) => void
  onAddPending: () => void
  onPatchPending: (i: number, patch: Partial<AddRow>) => void
  onRemovePending: (i: number) => void
  onDeleteSet: (setId: string) => void
}

export function ExerciseCard({
  group,
  editValues,
  pendingRows,
  onPatchEdit,
  onAddPending,
  onPatchPending,
  onRemovePending,
  onDeleteSet,
}: Props) {
  const { t } = useTranslation()
  const totalSets = group.sets.length + pendingRows.length
  const isDuration = group.trackingType === 'duration'

  const colClass = isDuration
    ? 'grid-cols-[1.5rem_1fr_auto_auto]'
    : 'grid-cols-[1.5rem_1fr_1fr_auto_auto]'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-baseline gap-2">
          <span className="text-sm font-normal text-muted-foreground">#{group.exerciseOrder + 1}</span>
          {t(`exercises.${group.exerciseSlug}`)}
          <span className="text-sm font-normal text-muted-foreground">×{totalSets}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className={`grid ${colClass} gap-2 items-center px-1`}>
          <span />
          {isDuration
            ? <span className="text-xs text-muted-foreground">{t('exerciseForm.duration')}</span>
            : <><span className="text-xs text-muted-foreground">{t('exerciseForm.reps')}</span><span className="text-xs text-muted-foreground">{t('exerciseForm.weight')}</span></>}
          <span className="text-xs text-muted-foreground">{t('exerciseForm.warmup')}</span>
          <span />
        </div>

        {group.sets.map(set => {
          const vals = editValues[set.id] ?? { reps: '', weight_kg: '', duration_sec: '', is_warmup: false }
          return (
            <div key={set.id} className={`grid ${colClass} gap-2 items-center`}>
              <span className="text-xs text-muted-foreground text-right">S{set.set_index}</span>
              {isDuration ? (
                <Input
                  type="number" min={0} placeholder="—"
                  value={vals.duration_sec}
                  onChange={e => onPatchEdit(set.id, { duration_sec: e.target.value })}
                />
              ) : (
                <>
                  <Input
                    type="number" min={0} placeholder="—"
                    value={vals.reps}
                    onChange={e => onPatchEdit(set.id, { reps: e.target.value })}
                  />
                  <Input
                    type="number" min={0} step={0.5} placeholder="—"
                    value={vals.weight_kg}
                    onChange={e => onPatchEdit(set.id, { weight_kg: e.target.value })}
                  />
                </>
              )}
              <Checkbox
                className="mx-auto"
                checked={vals.is_warmup}
                onCheckedChange={checked => onPatchEdit(set.id, { is_warmup: !!checked })}
              />
              <div className="flex items-center gap-1">
                {set.is_pr && <span className="text-xs text-yellow-500 font-semibold">{t('exerciseForm.pr')}</span>}
                <Button variant="ghost" size="icon-sm" onClick={() => onDeleteSet(set.id)}>
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
          )
        })}

        {pendingRows.map((row, i) => (
          <div key={`pending-${i}`} className={`grid ${colClass} gap-2 items-center`}>
            <span className="text-xs text-muted-foreground text-right">
              S{group.sets.length + i + 1}
            </span>
            {isDuration ? (
              <Input
                type="number" min={0} placeholder="—"
                value={row.duration_sec}
                onChange={e => onPatchPending(i, { duration_sec: e.target.value })}
              />
            ) : (
              <>
                <Input
                  type="number" min={0} placeholder="—"
                  value={row.reps}
                  onChange={e => onPatchPending(i, { reps: e.target.value })}
                />
                <Input
                  type="number" min={0} step={0.5} placeholder="—"
                  value={row.weight_kg}
                  onChange={e => onPatchPending(i, { weight_kg: e.target.value })}
                />
              </>
            )}
            <Checkbox
              className="mx-auto"
              checked={row.is_warmup}
              onCheckedChange={checked => onPatchPending(i, { is_warmup: !!checked })}
            />
            <Button variant="ghost" size="icon-sm" onClick={() => onRemovePending(i)}>
              <Trash2 className="size-3" />
            </Button>
          </div>
        ))}

        <Button
          type="button" variant="ghost" size="sm"
          className="w-full text-muted-foreground"
          onClick={onAddPending}
        >
          <Plus />
          {t('exerciseForm.addSet')}
        </Button>
      </CardContent>

    </Card>
  )
}
