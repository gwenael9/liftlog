import { formatDateShort, formatDateFull } from "@/utils";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  LineChart,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useExercises } from "@/hooks/useSessions";
import { useExerciseProgression } from "@/hooks/useStats";
import Empty from "../Empty";
import { Skeleton } from "../ui/skeleton";

export default function ProgressionStats() {
  const { t } = useTranslation();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");

  const { data: progression, isLoading: loadingProgression } =
    useExerciseProgression(selectedExerciseId || null);
  const { data: exercises } = useExercises();

  const selectedExerciseSlug = exercises?.find(
    (e) => e.id === selectedExerciseId,
  )?.slug;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-base">{t("stats.progression")}</CardTitle>
          <Select
            value={selectedExerciseId}
            onValueChange={(v) => setSelectedExerciseId(v ?? "")}
          >
            <SelectTrigger className="w-full sm:w-52 text-sm">
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
          <Empty message={t("stats.selectPlaceholder")} />
        ) : loadingProgression ? (
          <Skeleton className="h-44 w-full rounded-lg" />
        ) : !progression?.length ? (
          <Empty message={t("stats.noDataForExercise")} />
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
  );
}
