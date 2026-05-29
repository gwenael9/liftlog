import { Trash2 } from "lucide-react";
import { TableCell } from "@/shared/components/ui/table";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/button";
import { useAdminDeleteUser } from "@/views/admin/hooks/useAdmin";
import type { UserResponseDto } from "@/shared/api/users";
import AdminTable from "./AdminTable";
import SearchInput from "@/shared/components/SearchInput";
import { normalizeSearch } from "@/shared/utils";
import { useState } from "react";

export default function UsersTable({ data }: { data: UserResponseDto[] }) {
  const { t } = useTranslation();
  const deleteUser = useAdminDeleteUser();
  const [search, setSearch] = useState("");

  const filteredData = data.filter((u) => {
    const q = normalizeSearch(search);
    return (
      normalizeSearch(u.display_name ?? "").includes(q) ||
      normalizeSearch(u.email).includes(q)
    );
  });

  return (
    <AdminTable
      data={filteredData}
      columns={[
        { label: t("admin.table.name") },
        { label: t("admin.table.email") },
        { label: t("admin.table.role") },
        { label: t("admin.table.createdAt") },
        { label: t("admin.table.action"), className: "text-center w-12" },
      ]}
      emptyMessage={t("admin.noUsers")}
      deleteTitle={t("admin.deleteUserConfirm")}
      deleteMutation={deleteUser}
      toolbar={<SearchInput value={search} onChange={setSearch} />}
      renderRow={(u, onDelete) => (
        <>
          <TableCell className="font-medium">
            {u.display_name ?? (
              <span className="text-muted-foreground italic">—</span>
            )}
          </TableCell>
          <TableCell className="text-muted-foreground">{u.email}</TableCell>
          <TableCell>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                u.role === "admin"
                  ? "bg-primary/10 text-primary font-medium"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {u.role}
            </span>
          </TableCell>
          <TableCell className="text-muted-foreground text-xs">
            {new Date(u.created_at).toLocaleDateString("fr-FR")}
          </TableCell>
          <TableCell className="text-center">
            <Button variant="ghost" size="icon-sm" onClick={onDelete}>
              <Trash2 className="size-3 text-destructive" />
            </Button>
          </TableCell>
        </>
      )}
    />
  );
}
