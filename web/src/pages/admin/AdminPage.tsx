import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2, Pencil, Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { useExercises } from '@/hooks/useSessions'
import { useAdminUsers, useAdminCreateExercise, useAdminUpdateExercise, useAdminDeleteExercise } from '@/hooks/useAdmin'
import type { ExerciseResponseDto } from '@/api/exercises'

type Tab = 'exercises' | 'users'

const MUSCLE_GROUPS = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'legs', 'glutes', 'core', 'cardio', 'full_body',
] as const


interface ExerciseFormState {
  slug: string
  muscle_group: string
  tracking_type: 'strength' | 'duration'
  notes: string
}

const emptyForm = (): ExerciseFormState => ({
  slug: '', muscle_group: 'chest', tracking_type: 'strength', notes: '',
})

const PAGE_SIZE = 5

function usePagination<T>(items: T[], pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(0)
  const total = Math.max(1, Math.ceil(items.length / pageSize))
  const clamped = Math.min(page, total - 1)
  const slice = items.slice(clamped * pageSize, clamped * pageSize + pageSize)
  return {
    page: clamped,
    total,
    slice,
    setPage,
    prev: () => setPage(p => Math.max(0, p - 1)),
    next: () => setPage(p => Math.min(total - 1, p + 1)),
  }
}

interface DialogState {
  open: boolean
  editingId: string | null
  initialForm: ExerciseFormState
}

const closedDialog = (): DialogState => ({ open: false, editingId: null, initialForm: emptyForm() })

export function AdminPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('exercises')
  const [dialog, setDialog] = useState<DialogState>(closedDialog())
  const [muscleFilter, setMuscleFilter] = useState('all')

  const { data: exercises = [] } = useExercises()
  const { data: users = [] } = useAdminUsers()
  const createExercise = useAdminCreateExercise()
  const updateExercise = useAdminUpdateExercise()
  const deleteExercise = useAdminDeleteExercise()

  const filteredExercises = muscleFilter === 'all'
    ? exercises
    : exercises.filter(ex => ex.muscle_group === muscleFilter)
  const exPager = usePagination(filteredExercises)
  const userPager = usePagination(users)

  function openCreate() {
    setDialog({ open: true, editingId: null, initialForm: emptyForm() })
  }

  function openEdit(ex: ExerciseResponseDto) {
    setDialog({
      open: true,
      editingId: ex.id,
      initialForm: {
        slug: ex.slug,
        muscle_group: ex.muscle_group,
        tracking_type: ex.tracking_type as 'strength' | 'duration',
        notes: ex.notes ?? '',
      },
    })
  }

  async function handleDialogSubmit(form: ExerciseFormState) {
    const body = {
      slug: form.slug,
      muscle_group: form.muscle_group as ExerciseResponseDto['muscle_group'],
      is_global: true,
      tracking_type: form.tracking_type,
      notes: form.notes || undefined,
    }
    if (dialog.editingId) {
      await updateExercise.mutateAsync({ id: dialog.editingId, body })
    } else {
      await createExercise.mutateAsync(body)
    }
    setDialog(closedDialog())
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">{t('admin.title')}</h1>

      <div className="flex gap-2 border-b">
        {(['exercises', 'users'] as Tab[]).map(tabKey => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === tabKey ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'
            }`}
          >
            {tabKey === 'exercises'
              ? t('admin.tabs.exercises', { count: exercises.length })
              : t('admin.tabs.users', { count: users.length })}
          </button>
        ))}
      </div>

      {tab === 'exercises' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Select value={muscleFilter} onValueChange={v => { setMuscleFilter(v); exPager.setPage(0) }}>
                <SelectTrigger className="w-40">
                  <span className={muscleFilter === 'all' ? 'text-muted-foreground' : ''}>
                    {muscleFilter === 'all' ? t('admin.allMuscles') : t(`muscleGroups.${muscleFilter}`)}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.allMuscles')}</SelectItem>
                  {MUSCLE_GROUPS.map(g => (
                    <SelectItem key={g} value={g}>{t(`muscleGroups.${g}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              {t('admin.newExercise')}
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.table.name')}</TableHead>
                  <TableHead>{t('admin.table.muscle')}</TableHead>
                  <TableHead>{t('admin.table.type')}</TableHead>
                  <TableHead>{t('admin.table.scope')}</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {exPager.slice.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                      {t('admin.noExercises')}
                    </TableCell>
                  </TableRow>
                )}
                {exPager.slice.map(ex => (
                  <TableRow key={ex.id}>
                    <TableCell className="font-medium">{t(`exercises.${ex.slug}`)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {t(`muscleGroups.${ex.muscle_group}`)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {t(`trackingTypes.${ex.tracking_type}`)}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        ex.is_global
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {ex.is_global ? t('admin.scope.global') : t('admin.scope.personal')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(ex)}>
                          <Pencil className="size-3" />
                        </Button>
                        <Button
                          variant="ghost" size="icon-sm"
                          onClick={() => deleteExercise.mutate(ex.id)}
                          disabled={deleteExercise.isPending}
                        >
                          <Trash2 className="size-3 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Pagination pager={exPager} />
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-3">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.table.name')}</TableHead>
                  <TableHead>{t('admin.table.email')}</TableHead>
                  <TableHead>{t('admin.table.role')}</TableHead>
                  <TableHead>{t('admin.table.createdAt')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userPager.slice.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      {t('admin.noUsers')}
                    </TableCell>
                  </TableRow>
                )}
                {userPager.slice.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.display_name ?? <span className="text-muted-foreground italic">—</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        u.role === 'admin'
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(u.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Pagination pager={userPager} />
        </div>
      )}

      <ExerciseDialog
        key={dialog.editingId ?? 'create'}
        open={dialog.open}
        editingId={dialog.editingId}
        initialForm={dialog.initialForm}
        onOpenChange={v => { if (!v) setDialog(closedDialog()) }}
        onSubmit={handleDialogSubmit}
        isPending={createExercise.isPending || updateExercise.isPending}
      />
    </div>
  )
}

function Pagination({ pager }: { pager: ReturnType<typeof usePagination> }) {
  if (pager.total <= 1) return null
  return (
    <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
      <Button variant="ghost" size="icon" onClick={pager.prev} disabled={pager.page === 0}>
        <ChevronLeft className="size-4" />
      </Button>
      <span>{pager.page + 1} / {pager.total}</span>
      <Button variant="ghost" size="icon" onClick={pager.next} disabled={pager.page === pager.total - 1}>
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}

function ExerciseDialog({
  open, editingId, initialForm, onOpenChange, onSubmit, isPending,
}: {
  open: boolean
  editingId: string | null
  initialForm: ExerciseFormState
  onOpenChange: (v: boolean) => void
  onSubmit: (form: ExerciseFormState) => Promise<void>
  isPending: boolean
}) {
  const { t } = useTranslation()
  const [form, setForm] = useState<ExerciseFormState>(initialForm)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit(form)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={editingId ? t('admin.dialog.editTitle') : t('admin.dialog.createTitle')}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <ExerciseFields form={form} onChange={setForm} />
          <div className="flex gap-2 pt-1">
            <Button type="submit" size="sm" disabled={isPending || !form.slug}>
              <Check className="size-3" />
              {editingId ? t('common.save') : t('common.create')}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ExerciseFields({ form, onChange }: { form: ExerciseFormState; onChange: (f: ExerciseFormState) => void }) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-1 col-span-2">
        <Label>{t('admin.form.slug')}</Label>
        <Input
          value={form.slug}
          onChange={e => onChange({ ...form, slug: e.target.value })}
          placeholder="bench_press"
        />
      </div>
      <div className="space-y-1">
        <Label>{t('admin.form.muscleGroup')}</Label>
        <Select value={form.muscle_group} onValueChange={v => onChange({ ...form, muscle_group: v })}>
          <SelectTrigger className="w-full">
            <span>{t(`muscleGroups.${form.muscle_group}`)}</span>
          </SelectTrigger>
          <SelectContent>
            {MUSCLE_GROUPS.map(g => (
              <SelectItem key={g} value={g}>{t(`muscleGroups.${g}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>{t('admin.form.type')}</Label>
        <Select
          value={form.tracking_type}
          onValueChange={v => onChange({ ...form, tracking_type: v as 'strength' | 'duration' })}
        >
          <SelectTrigger className="w-full">
            <span>{t(`trackingTypes.${form.tracking_type}`)}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="strength">{t(`trackingTypes.${form.tracking_type}`)}</SelectItem>
            <SelectItem value="duration">{t(`trackingTypes.${form.tracking_type}`)}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1 col-span-2">
        <Label>{t('admin.form.notes')}</Label>
        <Input
          value={form.notes}
          onChange={e => onChange({ ...form, notes: e.target.value })}
          placeholder="..."
        />
      </div>
    </div>
  )
}
