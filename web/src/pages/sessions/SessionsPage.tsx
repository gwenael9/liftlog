import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import PageLayout from '@/components/layout/PageLayout'
import { useSessions, useCreateSession } from '@/hooks/useSessions'
import { useTemplates } from '@/hooks/useTemplates'
import { sessionsApi } from '@/api/sessions'
import { STATUS_COLORS, STATUS_LABELS } from '@/utils/status'
import { formatMonth, toDateString, toMonthString } from '@/utils'

export function SessionsPage() {
  const navigate = useNavigate()
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const monthStr = toMonthString(currentMonth)
  const { data: sessions, isLoading } = useSessions(monthStr)
  const { data: templates } = useTemplates()
  const createSession = useCreateSession()

  async function handleCreate() {
    setIsCreating(true)
    try {
      const result = await createSession.mutateAsync({
        scheduled_date: toDateString(selectedDate),
        status: 'planned',
        template_id: selectedTemplateId || undefined,
      })

      const sessionId = result.data?.id
      if (!sessionId) return

      if (selectedTemplateId && templates) {
        const template = templates.find(t => t.id === selectedTemplateId)
        const exercises = (template?.template_exercises ?? [])
          .slice()
          .sort((a, b) => a.order_index - b.order_index)

        for (const ex of exercises) {
          const setCount = ex.target_sets ?? 1
          for (let i = 1; i <= setCount; i++) {
            await sessionsApi.createSet(sessionId, {
              exercise_id: ex.exercise_id,
              set_index: i,
              is_warmup: false,
            })
          }
        }
      }

      navigate(`/sessions/${sessionId}`)
    } finally {
      setIsCreating(false)
    }
  }

  const sorted = sessions?.slice().sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date))

  const dialogContent = (
    <div className="flex flex-col items-center gap-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={d => d && setSelectedDate(d)}
      />

      {templates && templates.length > 0 && (
        <div className="w-full space-y-1">
          <Label>Template (optionnel)</Label>
          <Select
            value={selectedTemplateId}
            onValueChange={v => setSelectedTemplateId(v && v !== '__none__' ? v : '')}
          >
            <SelectTrigger className="w-full">
              {selectedTemplateId
                ? <span>{templates.find(t => t.id === selectedTemplateId)?.name}</span>
                : <span className="text-muted-foreground">Aucun template</span>}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Aucun template</SelectItem>
              {templates.map(t => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button className="w-full" onClick={handleCreate} disabled={isCreating}>
        {isCreating ? 'Création...' : 'Créer la séance'}
      </Button>
    </div>
  )

  const monthNav = (
    <div className="flex items-center justify-between">
      <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>
        <ChevronLeft />
      </Button>
      <span className="text-sm font-medium capitalize">{formatMonth(currentMonth)}</span>
      <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>
        <ChevronRight />
      </Button>
    </div>
  )

  return (
    <PageLayout
      title="Séance"
      female
      data={{ isLoading, items: sorted }}
      dialog={{
        open,
        onOpenChange: setOpen,
        title: 'Nouvelle séance',
        content: dialogContent,
      }}
      subContent={monthNav}
    >
      {sorted?.map(session => {
        const sets = session.session_sets ?? []
        const exerciseCount = new Set(sets.map(s => s.exercise_id)).size
        return (
          <Card
            key={session.id}
            className="cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
            onClick={() => navigate(`/sessions/${session.id}`)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize text-base">
                  {new Date(session.scheduled_date + 'T00:00:00').toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </CardTitle>
                <span className={`text-xs font-medium ${STATUS_COLORS[session.status]}`}>
                  {STATUS_LABELS[session.status]}
                </span>
              </div>
            </CardHeader>
            {exerciseCount > 0 && (
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {exerciseCount} exercice{exerciseCount > 1 ? 's' : ''}
                </p>
              </CardContent>
            )}
          </Card>
        )
      })}
    </PageLayout>
  )
}
