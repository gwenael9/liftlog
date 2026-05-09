import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { useVolume, useFrequency, usePersonalRecords, useExerciseProgression } from '@/hooks/useStats'
import { useExercises } from '@/hooks/useSessions'

const WEEK_OPTIONS = [4, 8, 12, 24] as const
type Weeks = (typeof WEEK_OPTIONS)[number]

function formatWeekLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function formatDateFull(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function ChartLoader() {
  return (
    <div className="flex h-40 items-center justify-center">
      <Loader2 className="animate-spin text-muted-foreground" />
    </div>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-40 items-center justify-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

export function StatsPage() {
  const [weeks, setWeeks] = useState<Weeks>(12)
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('')

  const { data: volume, isLoading: loadingVolume } = useVolume(weeks)
  const { data: frequency, isLoading: loadingFrequency } = useFrequency(weeks)
  const { data: prs, isLoading: loadingPrs } = usePersonalRecords()
  const { data: progression, isLoading: loadingProgression } = useExerciseProgression(
    selectedExerciseId || null,
  )
  const { data: exercises } = useExercises()

  const selectedExerciseName = exercises?.find((e) => e.id === selectedExerciseId)?.name

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Statistiques</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Période :</span>
          <div className="flex gap-1">
            {WEEK_OPTIONS.map((w) => (
              <button
                key={w}
                onClick={() => setWeeks(w)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  weeks === w
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {w}s
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Volume / semaine (kg)</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingVolume ? (
              <ChartLoader />
            ) : !volume?.length ? (
              <EmptyChart message="Pas de données" />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={volume} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="week_start"
                    tickFormatter={formatWeekLabel}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    labelFormatter={(v) => formatWeekLabel(v as string)}
                    formatter={(v) => [`${v} kg`, 'Volume']}
                    contentStyle={{
                      fontSize: 12,
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                    }}
                  />
                  <Bar dataKey="total_volume_kg" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Fréquence / semaine</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingFrequency ? (
              <ChartLoader />
            ) : !frequency?.length ? (
              <EmptyChart message="Pas de données" />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={frequency} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="week_start"
                    tickFormatter={formatWeekLabel}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    labelFormatter={(v) => formatWeekLabel(v as string)}
                    formatter={(v) => [v, 'Séances']}
                    contentStyle={{
                      fontSize: 12,
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                    }}
                  />
                  <Bar dataKey="session_count" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Records personnels</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPrs ? (
            <ChartLoader />
          ) : !prs?.length ? (
            <EmptyChart message="Aucun record enregistré" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2 font-medium text-muted-foreground">Exercice</th>
                    <th className="text-right pb-2 font-medium text-muted-foreground">Max (kg)</th>
                    <th className="text-right pb-2 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {prs.map((pr) => (
                    <tr key={pr.exercise_id} className="border-b last:border-0">
                      <td className="py-2">{pr.exercise_name}</td>
                      <td className="py-2 text-right font-medium">{pr.max_weight_kg} kg</td>
                      <td className="py-2 text-right text-muted-foreground">
                        {pr.performed_at ? formatDateFull(pr.performed_at) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-base">Progression par exercice</CardTitle>
            <Select
              value={selectedExerciseId}
              onValueChange={(v) => setSelectedExerciseId(v)}
            >
              <SelectTrigger className="w-52 text-sm">
                {selectedExerciseName ? (
                  <span>{selectedExerciseName}</span>
                ) : (
                  <span className="text-muted-foreground">Choisir un exercice</span>
                )}
              </SelectTrigger>
              <SelectContent>
                {(exercises ?? []).map((ex) => (
                  <SelectItem key={ex.id} value={ex.id}>
                    {ex.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedExerciseId ? (
            <EmptyChart message="Sélectionner un exercice pour voir sa progression" />
          ) : loadingProgression ? (
            <ChartLoader />
          ) : !progression?.length ? (
            <EmptyChart message="Aucune donnée pour cet exercice" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={progression} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatWeekLabel}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  labelFormatter={(v) => formatDateFull(v as string)}
                  formatter={(v) => [`${v} kg`, 'Max']}
                  contentStyle={{
                    fontSize: 12,
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="max_weight_kg"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'var(--chart-1)', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
