import { t } from "i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useNavigate } from "react-router-dom";
import { useActivityDates } from "@/hooks/useStats";
import { Calendar } from "../ui/calendar";
import { Skeleton } from "../ui/skeleton";

export default function CalendarStats() {
  const navigate = useNavigate();
  const { data: activityDates, isLoading } = useActivityDates();

  const sessionByDate = new Map(
    activityDates?.map((d) => [d.date, d.session_id]) ?? [],
  );

  const toDateStr = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const isWorkoutDay = (date: Date) => sessionByDate.has(toDateStr(date));

  const handleDayClick = (date: Date) => {
    const sessionId = sessionByDate.get(toDateStr(date));
    if (sessionId) navigate(`/sessions/${sessionId}`);
  };

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
                "[&>button]:bg-primary/20 [&>button]:text-primary [&>button]:font-semibold [&>button]:cursor-pointer",
              rest: "[&>button]:cursor-default [&>button]:hover:bg-transparent [&>button]:hover:text-foreground",
            }}
            onDayClick={handleDayClick}
          />
        )}
      </CardContent>
    </Card>
  );
}
