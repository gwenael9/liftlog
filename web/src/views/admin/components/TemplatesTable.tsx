import { Trash2, Lock, Globe } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { TableCell } from "@/shared/components/ui/table";
import { useTranslation } from "react-i18next";
import { useAdminDeleteTemplate } from "@/views/admin/hooks/useAdmin";
import type { TemplateResponseDto } from "@/shared/api/templates";
import AdminTable from "./AdminTable";
import SearchInput from "@/shared/components/SearchInput";
import { normalizeSearch } from "@/shared/utils";
import { useState } from "react";

export default function TemplatesTable({
  data,
}: {
  data: TemplateResponseDto[];
}) {
  const { t } = useTranslation();
  const deleteTemplate = useAdminDeleteTemplate();
  const [search, setSearch] = useState("");

  const filteredData = data.filter((tpl) => {
    const q = normalizeSearch(search);
    return (
      normalizeSearch(tpl.name).includes(q) ||
      normalizeSearch(tpl.user?.display_name ?? "").includes(q) ||
      normalizeSearch(tpl.user?.email ?? "").includes(q)
    );
  });

  return (
    <AdminTable
      data={filteredData}
      columns={[
        { label: t("admin.table.name") },
        { label: t("admin.table.creator") },
        { label: t("admin.table.visibility") },
        { label: t("admin.table.create") },
        { label: t("admin.table.action"), className: "text-center w-12" },
      ]}
      emptyMessage={t("admin.noTemplates")}
      deleteTitle={t("admin.deleteTemplateConfirm")}
      deleteMutation={deleteTemplate}
      toolbar={<SearchInput value={search} onChange={setSearch} />}
      renderRow={(tpl, onDelete) => (
        <>
          <TableCell className="font-medium">{tpl.name}</TableCell>
          <TableCell className="text-muted-foreground text-sm">
            {tpl.user?.display_name ?? tpl.user?.email ?? "—"}
          </TableCell>
          <TableCell>
            <span
              className={`flex items-center gap-1 text-xs w-fit px-2 py-0.5 rounded-full ${
                tpl.is_public
                  ? "bg-primary/10 text-primary font-medium"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tpl.is_public ? (
                <>
                  <Globe className="size-3" />
                  {t("templates.visibility.public")}
                </>
              ) : (
                <>
                  <Lock className="size-3" />
                  {t("templates.visibility.private")}
                </>
              )}
            </span>
          </TableCell>
          <TableCell className="text-muted-foreground text-xs">
            {new Date(tpl.created_at).toLocaleDateString("fr-FR")}
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
