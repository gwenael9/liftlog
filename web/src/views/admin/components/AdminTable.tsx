import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Pagination } from "./pagination/AdminPagination";
import { ConfirmDeleteDialog } from "@/shared/components/ConfirmDeleteDialog";
import usePagination from "./pagination/usePagination";

interface Column {
  label: string;
  className?: string;
}

interface AdminTableProps<T extends { id: string }> {
  data: T[];
  columns: Column[];
  emptyMessage: string;
  renderRow: (item: T, onDelete: () => void) => React.ReactNode;
  deleteTitle: string;
  deleteMutation: {
    mutate: (id: string, options?: { onSuccess?: () => void }) => void;
    isPending: boolean;
  };
  toolbar?: React.ReactNode;
}

export default function AdminTable<T extends { id: string }>({
  data,
  columns,
  emptyMessage,
  renderRow,
  deleteTitle,
  deleteMutation,
  toolbar,
}: AdminTableProps<T>) {
  const pager = usePagination(data);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {toolbar && (
        <div className="flex items-center justify-between gap-2">{toolbar}</div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, i) => (
                <TableHead key={i} className={col.className}>
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pager.slice.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground py-6"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
            {pager.slice.map((item) => (
              <TableRow key={item.id}>
                {renderRow(item, () => setPendingDeleteId(item.id))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Pagination pager={pager} />
      <ConfirmDeleteDialog
        open={!!pendingDeleteId}
        onOpenChange={(v) => {
          if (!v) setPendingDeleteId(null);
        }}
        title={deleteTitle}
        onConfirm={() => {
          if (pendingDeleteId)
            deleteMutation.mutate(pendingDeleteId, {
              onSuccess: () => setPendingDeleteId(null),
            });
        }}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
