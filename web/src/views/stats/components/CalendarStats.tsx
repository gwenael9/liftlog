import { t } from "i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useActivityDates } from "@/views/stats/hooks/useStats";
import { Calendar } from "@/shared/components/ui/calendar";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { DayButtonProps } from "react-day-picker";
import { useMemo, useCallback } from "react";

const toDateStr = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function CalendarStats() {
  const navigate = useNavigate();
  const { data: activityDates, isLoading } = useActivityDates();

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const d of activityDates ?? []) {
      const arr = map.get(d.date) ?? [];
      arr.push(d.session_id);
      map.set(d.date, arr);
    }
    return map;
  }, [activityDates]);

  const isWorkoutDay = (date: Date) => sessionsByDate.has(toDateStr(date));

  const handleDayClick = (date: Date) => {
    const sessions = sessionsByDate.get(toDateStr(date));
    if (sessions?.length) navigate(`/sessions/${sessions[0]}`);
  };

  const CustomDayButton = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ day, modifiers: _m, ...buttonProps }: DayButtonProps) => {
      const count = sessionsByDate.get(toDateStr(day.date))?.length ?? 0;
      return (
        <span className="relative inline-flex">
          <button {...buttonProps} />
          {count >= 2 && (
            <span className="absolute -top-1 -right-1 size-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold pointer-events-none z-10">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </span>
      );
    },
    [sessionsByDate],
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {t("stats.activityCalendar")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        {isLoading ? (
          <Skeleton className="h-70 w-70 rounded-lg" />
        ) : (
          <Calendar
            modifiers={{
              workout: isWorkoutDay,
              rest: (date) => !isWorkoutDay(date),
            }}
            modifiersClassNames={{
              workout:
                "[&>span>button]:bg-primary/20 [&>span>button]:text-primary [&>span>button]:font-semibold [&>span>button]:cursor-pointer",
              rest: "[&>span>button]:cursor-default [&>span>button]:hover:bg-transparent [&>span>button]:hover:text-foreground",
            }}
            onDayClick={handleDayClick}
            components={{ DayButton: CustomDayButton }}
          />
        )}
      </CardContent>
    </Card>
  );
}
