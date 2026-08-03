import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/components/ui/select";
import { TableCell } from "@/shared/components/ui/table";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import type { ExerciseResponseDto, MuscleGroup } from "@/shared/api/exercises";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import {
  useAdminCreateExercise,
  useAdminUpdateExercise,
  useAdminDeleteExercise,
} from "@/views/admin/hooks/useAdmin";
import AdminTable from "./AdminTable";
import SearchInput from "@/shared/components/SearchInput";
import { MUSCLE_GROUPS, normalizeSearch } from "@/shared/utils";
import { ExerciseImageButton } from "@/shared/components/ExerciseImageButton";
import SelectMuscleGroup from "@/shared/components/SelectMuscleGroup";

interface ExerciseFormState {
  slug: string;
  muscle_group: MuscleGroup;
  tracking_type: "strength" | "duration";
  notes: string;
}

const emptyForm = (): ExerciseFormState => ({
  slug: "",
  muscle_group: "chest",
  tracking_type: "strength",
  notes: "",
});

interface DialogState {
  open: boolean;
  editingId: string | null;
  initialForm: ExerciseFormState;
}

const closedDialog = (): DialogState => ({
  open: false,
  editingId: null,
  initialForm: emptyForm(),
});

export default function ExercicesTable({
  data,
}: {
  data: ExerciseResponseDto[];
}) {
  const { t } = useTranslation();
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | "all">("all");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<DialogState>(closedDialog());

  const createExercise = useAdminCreateExercise();
  const updateExercise = useAdminUpdateExercise();
  const deleteExercise = useAdminDeleteExercise();

  const filteredData = data
    .filter((ex) => muscleFilter === "all" || ex.muscle_group === muscleFilter)
    .filter((ex) =>
      normalizeSearch(t(`exercises.${ex.slug}`)).includes(
        normalizeSearch(search),
      ),
    );

  function openCreate() {
    setDialog({ open: true, editingId: null, initialForm: emptyForm() });
  }

  function openEdit(ex: ExerciseResponseDto) {
    setDialog({
      open: true,
      editingId: ex.id,
      initialForm: {
        slug: ex.slug,
        muscle_group: ex.muscle_group,
        tracking_type: ex.tracking_type as "strength" | "duration",
        notes: ex.notes ?? "",
      },
    });
  }

  async function handleDialogSubmit(form: ExerciseFormState) {
    const body = {
      slug: form.slug,
      muscle_group: form.muscle_group as ExerciseResponseDto["muscle_group"],
      is_global: true,
      tracking_type: form.tracking_type,
      notes: form.notes || undefined,
    };
    if (dialog.editingId) {
      await updateExercise.mutateAsync({ id: dialog.editingId, body });
    } else {
      await createExercise.mutateAsync(body);
    }
    setDialog(closedDialog());
  }

  return (
    <>
      <AdminTable
        data={filteredData}
        columns={[
          { label: t("admin.table.name") },
          { label: t("admin.table.muscle") },
          { label: t("admin.table.type") },
          { label: t("admin.table.scope") },
          { label: t("admin.table.actions"), className: "text-center w-24" },
        ]}
        emptyMessage={t("admin.noExercises")}
        deleteTitle={t("admin.deleteExerciseConfirm")}
        deleteMutation={deleteExercise}
        toolbar={
          <>
            <div className="flex items-center gap-2 w-full">
              <SelectMuscleGroup
                value={muscleFilter}
                onChange={setMuscleFilter}
              />
              <SearchInput value={search} onChange={setSearch} />
            </div>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              {t("admin.newExercise")}
            </Button>
          </>
        }
        renderRow={(ex, onDelete) => (
          <>
            <TableCell className="font-medium flex items-center gap-2">
              <ExerciseImageButton exerciseSlug={ex.slug}>
                {t(`exercises.${ex.slug}`)}
              </ExerciseImageButton>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {t(`muscleGroups.${ex.muscle_group}`)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {t(`trackingTypes.${ex.tracking_type}`)}
            </TableCell>
            <TableCell>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  ex.is_global
                    ? "bg-primary/10 text-primary font-medium"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {ex.is_global
                  ? t("admin.scope.global")
                  : t("admin.scope.personal")}
              </span>
            </TableCell>
            <TableCell className="text-center">
              <div className="flex items-center gap-1 justify-end">
                <ExerciseImageButton exerciseSlug={ex.slug} />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => openEdit(ex)}
                >
                  <Pencil className="size-3" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={onDelete}>
                  <Trash2 className="size-3 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </>
        )}
      />

      <ExerciseDialog
        key={dialog.editingId ?? "create"}
        open={dialog.open}
        editingId={dialog.editingId}
        initialForm={dialog.initialForm}
        onOpenChange={(v) => {
          if (!v) setDialog(closedDialog());
        }}
        onSubmit={handleDialogSubmit}
        isPending={createExercise.isPending || updateExercise.isPending}
      />
    </>
  );
}

function ExerciseDialog({
  open,
  editingId,
  initialForm,
  onOpenChange,
  onSubmit,
  isPending,
}: {
  open: boolean;
  editingId: string | null;
  initialForm: ExerciseFormState;
  onOpenChange: (v: boolean) => void;
  onSubmit: (form: ExerciseFormState) => Promise<void>;
  isPending: boolean;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<ExerciseFormState>(initialForm);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={
          editingId
            ? t("admin.dialog.editTitle")
            : t("admin.dialog.createTitle")
        }
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <ExerciseFields form={form} onChange={setForm} />
          <div className="flex gap-2 pt-1">
            <Button type="submit" size="sm" disabled={isPending || !form.slug}>
              <Check className="size-3" />
              {editingId ? t("common.save") : t("common.create")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ExerciseFields({
  form,
  onChange,
}: {
  form: ExerciseFormState;
  onChange: (f: ExerciseFormState) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-1 col-span-2">
        <Label>{t("admin.form.slug")}</Label>
        <Input
          value={form.slug}
          onChange={(e) => onChange({ ...form, slug: e.target.value })}
          placeholder="bench_press"
        />
      </div>
      <div className="space-y-1">
        <Label>{t("admin.form.muscleGroup")}</Label>
        <Select
          value={form.muscle_group}
          onValueChange={(v) =>
            onChange({ ...form, muscle_group: v ?? form.muscle_group })
          }
        >
          <SelectTrigger className="w-full">
            <span>{t(`muscleGroups.${form.muscle_group}`)}</span>
          </SelectTrigger>
          <SelectContent>
            {MUSCLE_GROUPS.map((g) => (
              <SelectItem key={g} value={g}>
                {t(`muscleGroups.${g}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>{t("admin.form.type")}</Label>
        <Select
          value={form.tracking_type}
          onValueChange={(v) =>
            onChange({ ...form, tracking_type: v as "strength" | "duration" })
          }
        >
          <SelectTrigger className="w-full">
            <span>{t(`trackingTypes.${form.tracking_type}`)}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="strength">
              {t(`trackingTypes.strength`)}
            </SelectItem>
            <SelectItem value="duration">
              {t(`trackingTypes.duration`)}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1 col-span-2">
        <Label>{t("admin.form.notes")}</Label>
        <Input
          value={form.notes}
          onChange={(e) => onChange({ ...form, notes: e.target.value })}
          placeholder="..."
        />
      </div>
    </div>
  );
}
