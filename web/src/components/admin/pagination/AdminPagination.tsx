import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type usePagination from "./usePagination";

export function Pagination({
  pager,
}: {
  pager: ReturnType<typeof usePagination>;
}) {
  if (pager.total <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
      <Button
        variant="ghost"
        size="icon"
        onClick={pager.prev}
        disabled={pager.page === 0}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span>
        {pager.page + 1} / {pager.total}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={pager.next}
        disabled={pager.page === pager.total - 1}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
