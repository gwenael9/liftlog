import { formatDateFull, formatDateShort } from "@/shared/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import Pagination from "@/shared/components/Pagination";
import usePagination from "@/shared/hooks/usePagination";
import { usePersonalRecords } from "@/views/stats/hooks/useStats";
import { useTranslation } from "react-i18next";
import Empty from "@/shared/components/Empty";
import { Skeleton } from "@/shared/components/ui/skeleton";
import SearchInput from "@/shared/components/SearchInput";
import { normalizeSearch } from "@/shared/utils";
import { useState, useEffect } from "react";
import { useUnitSystem } from "@/shared/hooks/useAuth";
import { formatWeight } from "@/shared/utils";
import SelectMuscleGroup from "@/shared/components/SelectMuscleGroup";
import type { MuscleGroup } from "@/shared/api/exercises";

export default function RecordStats() {
  const { t } = useTranslation();
  const unit = useUnitSystem();
  const { data: prs, isLoading } = usePersonalRecords();
  const [search, setSearch] = useState("");

  const [muscleFilter, setMuscleFilter] = useState<"all" | MuscleGroup>("all");

  const filtered = (prs ?? []).filter((pr) => {
    const matchSearch = normalizeSearch(
      t(`exercises.${pr.exercise_slug}`),
    ).includes(normalizeSearch(search));
    const matchMuscle =
      muscleFilter === "all" || pr.muscle_group === muscleFilter;
    return matchSearch && matchMuscle;
  });

  const pager = usePagination(filtered);
  const { setPage } = pager;

  useEffect(() => {
    setPage(0);
  }, [search, setPage]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {t("stats.personalRecords")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t("stats.searchPlaceholder")}
          />
          <SelectMuscleGroup value={muscleFilter} onChange={setMuscleFilter} />
        </div>
        {isLoading ? (
          <div className="space-y-2 mt-3">
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
        ) : !filtered.length ? (
          <Empty message={t("stats.noRecords")} />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-0 text-xs">
                    {t("stats.table.exercise")}
                  </TableHead>
                  <TableHead className="text-right text-xs">
                    {t("stats.table.max", { unit })}
                  </TableHead>
                  <TableHead className="pr-0 text-right text-xs">
                    {t("stats.table.date")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pager.slice.map((pr) => (
                  <TableRow key={pr.exercise_id}>
                    <TableCell className="pl-0 py-2 text-sm">
                      {t(`exercises.${pr.exercise_slug}`)}
                    </TableCell>
                    <TableCell className="py-2 text-right text-sm font-medium">
                      {formatWeight(pr.max_weight_kg, unit)}
                    </TableCell>
                    <TableCell className="pr-0 py-2 text-right text-sm text-muted-foreground">
                      <span className="hidden sm:inline">
                        {pr.performed_at
                          ? formatDateFull(pr.performed_at)
                          : "—"}
                      </span>
                      <span className="sm:hidden">
                        {pr.performed_at
                          ? formatDateShort(pr.performed_at)
                          : "—"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination pager={pager} className="mt-2" />
          </>
        )}
      </CardContent>
    </Card>
  );
}
