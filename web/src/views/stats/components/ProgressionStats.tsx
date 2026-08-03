import { formatDateShort, formatDateFull } from "@/shared/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/components/ui/select";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  LineChart,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import { useExercises } from "@/shared/hooks/useExercices";
import { useExerciseProgression } from "@/views/stats/hooks/useStats";
import Empty from "@/shared/components/Empty";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Button } from "@/shared/components/ui/button";
import { useUnitSystem } from "@/shared/hooks/useAuth";
import { kgToDisplay } from "@/shared/utils";

type Period = "1w" | "1m" | "3m" | "6m" | "1y" | "all";

const PERIODS: Period[] = ["1w", "1m", "3m", "6m", "1y", "all"];

function getFromDate(period: Period): string | undefined {
  if (period === "all") return undefined;
  const d = new Date();
  if (period === "1w") d.setDate(d.getDate() - 7);
  else if (period === "1m") d.setMonth(d.getMonth() - 1);
  else if (period === "3m") d.setMonth(d.getMonth() - 3);
  else if (period === "6m") d.setMonth(d.getMonth() - 6);
  else if (period === "1y") d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().slice(0, 10);
}

export default function ProgressionStats() {
  const { t } = useTranslation();
  const unit = useUnitSystem();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [period, setPeriod] = useState<Period>("3m");

  const from = useMemo(() => getFromDate(period), [period]);

  const { data: progression, isLoading: loadingProgression } =
    useExerciseProgression(selectedExerciseId || null, from);
  const { data: exercises } = useExercises();

  const displayProgression = useMemo(
    () =>
      progression?.map((p) => ({
        ...p,
        max_weight_kg: kgToDisplay(p.max_weight_kg, unit),
      })),
    [progression, unit],
  );

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
        ) : !displayProgression?.length ? (
          <Empty message={t("stats.noDataForExercise")} />
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart
              data={displayProgression}
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
                formatter={(v) => [`${v} ${unit}`, "Max"]}
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
      <div className="flex justify-center">
        {selectedExerciseId && (
          <div className="flex gap-1">
            {PERIODS.map((p) => (
              <Button
                size="xs"
                variant={period === p ? "default" : "outline"}
                onClick={() => setPeriod(p)}
              >
                {t(`stats.period.${p}`)}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
