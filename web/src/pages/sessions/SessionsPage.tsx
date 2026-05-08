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
import { useSessions, useCreateSession } from '@/hooks/useSessions'
import { useTemplates } from '@/hooks/useTemplates'
import { sessionsApi } from '@/api/sessions'
import { STATUS_COLORS, STATUS_LABELS } from '@/utils/status'
import { formatMonth, toDateString, toMonthString } from '@/utils'
import PageLayout from '@/components/PageLayout'

export function SessionsPage() {
  const navigate = useNavigate()
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const monthStr = toMonthString(currentMonth)
  const { data: sessions, isLoading } = useSessions(monthStr)
  const { data: templates } = useTemplates()
  const createSession = useCreateSession()

  function prevMonth() {
    setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }

  function nextMonth() {
    setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

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
      setShowForm(false)
      setSelectedTemplateId('')
    } finally {
      setIsCreating(false)
    }
  }

  const sorted = sessions?.slice().sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date))

  const form = (
    <Card>
          <CardContent className="pt-2 flex flex-col items-center gap-3">
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

            <div className="flex gap-2 w-full">
              <Button
                className="flex-1"
                onClick={handleCreate}
                disabled={isCreating}
              >
                {isCreating ? 'Création...' : 'Créer'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
  )

  const subForm = (
<div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft />
        </Button>
        <span className="text-sm font-medium capitalize">{formatMonth(currentMonth)}</span>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight />
        </Button>
      </div>
  )

  return (
    <PageLayout 
      title='Séance' 
      onClickCreate={() => setShowForm(v => !v)} 
      female
      data={{ isLoading: isLoading, items: sorted }}
      form={{
        show: showForm,
        content: form,
        subForm: subForm
      }}
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
                  <CardTitle className="capitalize">
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
              {sets.length > 0 && (
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
