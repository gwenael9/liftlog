import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSessions, useCreateSession } from '@/hooks/useSessions'

const STATUS_LABELS: Record<string, string> = {
  planned: 'Planifiée',
  in_progress: 'En cours',
  completed: 'Terminée',
  skipped: 'Annulée',
}

const STATUS_COLORS: Record<string, string> = {
  planned: 'text-muted-foreground',
  in_progress: 'text-blue-500',
  completed: 'text-green-500',
  skipped: 'text-orange-400',
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

function toMonthString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function SessionsPage() {
  const navigate = useNavigate()
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [showForm, setShowForm] = useState(false)
  const [scheduledDate, setScheduledDate] = useState(todayString)

  const monthStr = toMonthString(currentMonth)
  const { data: sessions, isLoading } = useSessions(monthStr)
  const createSession = useCreateSession()

  function prevMonth() {
    setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }

  function nextMonth() {
    setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    createSession.mutate(
      { scheduled_date: scheduledDate, status: 'planned' },
      {
        onSuccess: ({ data }) => {
          if (data) navigate(`/sessions/${data.id}`)
          setShowForm(false)
        },
      }
    )
  }

  const sorted = sessions?.slice().sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date))

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Séances</h1>
        <Button size="sm" onClick={() => setShowForm(v => !v)}>
          <Plus />
          Nouvelle séance
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleCreate} className="flex items-end gap-3">
              <div className="flex-1 space-y-1">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={createSession.isPending}>
                Créer
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft />
        </Button>
        <span className="text-sm font-medium capitalize">{formatMonth(currentMonth)}</span>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight />
        </Button>
      </div>

      {isLoading && (
        <p className="text-center text-muted-foreground py-8">Chargement...</p>
      )}

      {!isLoading && sorted?.length === 0 && (
        <p className="text-center text-muted-foreground py-8">Aucune séance ce mois-ci</p>
      )}

      <div className="space-y-2">
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
      </div>
    </div>
  )
}
