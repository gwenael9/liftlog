import { formatDateFull } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { usePersonalRecords } from "@/hooks/useStats";
import { useTranslation } from "react-i18next";
import Empty from "../Empty";
import { Skeleton } from "../ui/skeleton";

export default function RecordStats() {
  const { t } = useTranslation();
  const { data: prs, isLoading } = usePersonalRecords();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {t("stats.personalRecords")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : !prs?.length ? (
          <Empty message={t("stats.noRecords")} />
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
                      {pr.performed_at ? formatDateFull(pr.performed_at) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
