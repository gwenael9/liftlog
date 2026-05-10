import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { formatMonth, formatSessionDate, toDateString, toMonthString } from '@/utils'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function SessionsPage() {
  const { t } = useTranslation()
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
        template_id: selectedTemplateId || undefined,
      })

      const sessionId = result.data?.id
      if (!sessionId) return

      if (selectedTemplateId && templates) {
        const template = templates.find(t => t.id === selectedTemplateId)
        const exercises = (template?.template_exercises ?? [])
          .slice()
          .sort((a, b) => a.order_index - b.order_index)

        for (let exIdx = 0; exIdx < exercises.length; exIdx++) {
          const ex = exercises[exIdx]
          const setCount = ex.target_sets ?? 1
          for (let i = 1; i <= setCount; i++) {
            await sessionsApi.createSet(sessionId, {
              exercise_id: ex.exercise_id,
              set_index: i,
              is_warmup: false,
              exercise_order: exIdx,
            })
          }
        }
      }

      toast.success(t('sessions.created'))
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
          <Label>{t('sessions.templateOptional')}</Label>
          <Select
            value={selectedTemplateId}
            onValueChange={v => setSelectedTemplateId(v && v !== '__none__' ? v : '')}
          >
            <SelectTrigger className="w-full">
              {selectedTemplateId
                ? <span>{templates.find(t => t.id === selectedTemplateId)?.name}</span>
                : <span className="text-muted-foreground">{t('sessions.noTemplate')}</span>}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">{t('sessions.noTemplate')}</SelectItem>
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
        {isCreating ? t('sessions.creating') : t('sessions.create')}
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
      title={t('sessions.title')}
      female
      data={{ isLoading, items: sorted }}
      dialog={{
        open,
        onOpenChange: setOpen,
        title: t('sessions.newSession'),
        content: dialogContent,
      }}
      subContent={monthNav}
    >
      {sorted?.map(session => {
        const sets = session.session_sets ?? []
        const exerciseCount = new Set(sets.map(s => s.exercise_id)).size
        const templateName = session.template_id
          ? templates?.find(t => t.id === session.template_id)?.name
          : null
        return (
          <Card
            key={session.id}
            className="cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
            onClick={() => navigate(`/sessions/${session.id}`)}
          >
            <CardHeader>
              <CardTitle className="capitalize text-base">
                {formatSessionDate(session.scheduled_date)}
              </CardTitle>
              {templateName && (
                <CardAction>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {templateName}
                  </span>
                </CardAction>
              )}
            </CardHeader>
            {exerciseCount > 0 && (
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {t('common.exerciseCount', { count: exerciseCount })}
                </p>
              </CardContent>
            )}
          </Card>
        )
      })}
    </PageLayout>
  )
}
