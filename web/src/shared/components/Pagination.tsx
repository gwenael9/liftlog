import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination";
import type usePagination from "@/shared/hooks/usePagination";
import { useTranslation } from "react-i18next";

type Pager = ReturnType<typeof usePagination>;

export default function Pagination({
  pager,
  className,
}: {
  pager: Pager;
  className?: string;
}) {
  const { t } = useTranslation();

  if (pager.total <= 1) return null;

  return (
    <PaginationRoot className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            text={t("common.previous")}
            onClick={(e) => {
              e.preventDefault();
              pager.prev();
            }}
            aria-disabled={pager.page === 0}
            className={pager.page === 0 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        {Array.from({ length: pager.total }).map((_, i) => (
          <PaginationItem key={i}>
            <PaginationLink
              isActive={i === pager.page}
              onClick={(e) => {
                e.preventDefault();
                pager.setPage(i);
              }}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            text={t("common.next")}
            onClick={(e) => {
              e.preventDefault();
              pager.next();
            }}
            aria-disabled={pager.page >= pager.total - 1}
            className={
              pager.page >= pager.total - 1
                ? "pointer-events-none opacity-50"
                : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  );
}
