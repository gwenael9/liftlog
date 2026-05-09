import { useState } from "react";
import { Loader2 } from "lucide-react";
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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  useFrequency,
  usePersonalRecords,
  useExerciseProgression,
} from "@/hooks/useStats";
import { useExercises } from "@/hooks/useSessions";
import { formatDateShort, formatDateFull } from "@/utils";
import { useTranslation } from "react-i18next";

const WEEK_OPTIONS = [4, 8, 12, 24] as const;
type Weeks = (typeof WEEK_OPTIONS)[number];

function ChartLoader() {
  return (
    <div className="flex h-40 items-center justify-center">
      <Loader2 className="animate-spin text-muted-foreground" />
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-40 items-center justify-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function StatsPage() {
  const { t } = useTranslation();
  const [weeks, setWeeks] = useState<Weeks>(12);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");

  const { data: frequency, isLoading: loadingFrequency } = useFrequency(weeks);
  const { data: prs, isLoading: loadingPrs } = usePersonalRecords();
  const { data: progression, isLoading: loadingProgression } =
    useExerciseProgression(selectedExerciseId || null);
  const { data: exercises } = useExercises();

  const selectedExerciseSlug = exercises?.find(
    (e) => e.id === selectedExerciseId,
  )?.slug;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("stats.title")}</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t("stats.period")}
          </span>
          <div className="flex gap-1">
            {WEEK_OPTIONS.map((w) => (
              <button
                key={w}
                onClick={() => setWeeks(w)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  weeks === w
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {w}s
              </button>
            ))}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {t("stats.personalRecords")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPrs ? (
            <ChartLoader />
          ) : !prs?.length ? (
            <EmptyChart message={t("stats.noRecords")} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2 font-medium text-muted-foreground">
                      {t("stats.table.exercise")}
                    </th>
                    <th className="text-right pb-2 font-medium text-muted-foreground">
                      {t("stats.table.max")}
                    </th>
                    <th className="text-right pb-2 font-medium text-muted-foreground">
                      {t("stats.table.date")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {prs.map((pr) => (
                    <tr key={pr.exercise_id} className="border-b last:border-0">
                      <td className="py-2">
                        {t(`exercises.${pr.exercise_slug}`)}
                      </td>
                      <td className="py-2 text-right font-medium">
                        {pr.max_weight_kg} kg
                      </td>
                      <td className="py-2 text-right text-muted-foreground">
                        {pr.performed_at
                          ? formatDateFull(pr.performed_at)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {t("stats.frequencyChart")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingFrequency ? (
              <ChartLoader />
            ) : !frequency?.length ? (
              <EmptyChart message={t("stats.noData")} />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={frequency}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="week_start"
                    tickFormatter={formatDateShort}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    labelFormatter={(v) => formatDateShort(v as string)}
                    formatter={(v) => [v, t("sessions.title")]}
                    contentStyle={{
                      fontSize: 12,
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar
                    dataKey="session_count"
                    fill="var(--chart-3)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-base">
                {t("stats.progression")}
              </CardTitle>
              <Select
                value={selectedExerciseId}
                onValueChange={(v) => setSelectedExerciseId(v)}
              >
                <SelectTrigger className="w-52 text-sm">
                  {selectedExerciseSlug ? (
                    <span>{t(`exercises.${selectedExerciseSlug}`)}</span>
                  ) : (
                    <span className="text-muted-foreground">
                      {t("stats.selectExercise")}
                    </span>
                  )}
                </SelectTrigger>
                <SelectContent>
                  {(exercises ?? []).map((ex) => (
                    <SelectItem key={ex.id} value={ex.id}>
                      {t(`exercises.${ex.slug}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {!selectedExerciseId ? (
              <EmptyChart message={t("stats.selectPlaceholder")} />
            ) : loadingProgression ? (
              <ChartLoader />
            ) : !progression?.length ? (
              <EmptyChart message={t("stats.noDataForExercise")} />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart
                  data={progression}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateShort}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    labelFormatter={(v) => formatDateFull(v as string)}
                    formatter={(v) => [`${v} kg`, "Max"]}
                    contentStyle={{
                      fontSize: 12,
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="max_weight_kg"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "var(--chart-1)", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
