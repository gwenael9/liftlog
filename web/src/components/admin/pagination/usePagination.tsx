import { useState } from "react";

const PAGE_SIZE = 5;

export default function usePagination<T>(items: T[], pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(0);
  const total = Math.max(1, Math.ceil(items.length / pageSize));
  const clamped = Math.min(page, total - 1);
  const slice = items.slice(clamped * pageSize, clamped * pageSize + pageSize);
  return {
    page: clamped,
    total,
    slice,
    setPage,
    prev: () => setPage((p) => Math.max(0, p - 1)),
    next: () => setPage((p) => Math.min(total - 1, p + 1)),
  };
}
