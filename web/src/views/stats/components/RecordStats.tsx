import { formatDateFull } from "@/shared/utils";
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

export default function RecordStats() {
  const { t } = useTranslation();
  const { data: prs, isLoading } = usePersonalRecords();
  const [search, setSearch] = useState("");

  const filtered = (prs ?? []).filter((pr) =>
    normalizeSearch(t(`exercises.${pr.exercise_slug}`)).includes(
      normalizeSearch(search),
    ),
  );

  const pager = usePagination(filtered);

  useEffect(() => {
    pager.setPage(0);
  }, [pager, search]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {t("stats.personalRecords")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t("stats.searchPlaceholder")}
          className="mb-3"
        />
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
                    {t("stats.table.max")}
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
                      {pr.max_weight_kg} kg
                    </TableCell>
                    <TableCell className="pr-0 py-2 text-right text-sm text-muted-foreground">
                      {pr.performed_at ? formatDateFull(pr.performed_at) : "—"}
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
