import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
} from "@/hooks/useTemplates";
import { useExercises } from "@/hooks/useSessions";
import { useCurrentUser } from "@/hooks/useAuth";
import { AddExerciseDialog } from "@/components/AddExerciseDialog";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { DetailHeader } from "@/components/layout/DetailHeader";
import type {
  TemplateResponseDto,
  TemplateExerciseItemDto,
} from "@/api/templates";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface ExerciseRow extends TemplateExerciseItemDto {
  _key: string;
}

let keyCounter = 0;
const nextKey = () => String(++keyCounter);

function rowFromItem(item: TemplateExerciseItemDto): ExerciseRow {
  return { ...item, _key: nextKey() };
}

function toExerciseRows(template: TemplateResponseDto): ExerciseRow[] {
  return (template.template_exercises ?? []).map((ex) =>
    rowFromItem({
      exercise_id: ex.exercise_id,
      order_index: ex.order_index,
      target_sets: ex.target_sets ?? undefined,
      target_reps: ex.target_reps ?? undefined,
      rest_seconds: ex.rest_seconds ?? undefined,
      target_duration_sec: ex.target_duration_sec ?? undefined,
    }),
  );
}

export function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: template, isLoading } = useTemplate(id!);
  const { data: exercises } = useExercises();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        {t("templates.loading")}
      </div>
    );
  }

  if (!template) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        {t("templates.notFound")}
      </div>
    );
  }

  return (
    <TemplateEditForm id={id!} template={template} exercises={exercises} />
  );
}

interface TemplateEditFormProps {
  id: string;
  template: TemplateResponseDto;
  exercises: ReturnType<typeof useExercises>["data"];
}

function TemplateEditForm({ id, template, exercises }: TemplateEditFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const updateTemplate = useUpdateTemplate(id);
  const deleteTemplate = useDeleteTemplate();
  const { data: currentUser } = useCurrentUser();

  const isOwner = currentUser?.id === template.user_id;
  const isAdmin = currentUser?.role === "admin";
  const canEdit = isOwner || isAdmin;
  const canDelete = isOwner || isAdmin;

  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description ?? "");
  const [duration, setDuration] = useState(
    template.estimated_duration != null
      ? String(template.estimated_duration)
      : "",
  );
  const [isPublic, setIsPublic] = useState(template.is_public);
  const [rows, setRows] = useState<ExerciseRow[]>(() =>
    toExerciseRows(template),
  );
  const [dirty, setDirty] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleAddExercise(
    exerciseId: string,
    data: {
      targetSets?: number;
      targetReps?: number;
      restSeconds?: number;
      targetDurationSec?: number;
    },
  ) {
    setRows((r) => [
      ...r,
      {
        _key: nextKey(),
        exercise_id: exerciseId,
        order_index: r.length + 1,
        target_sets: data.targetSets,
        target_reps: data.targetReps,
        rest_seconds: data.restSeconds,
        target_duration_sec: data.targetDurationSec,
      },
    ]);
    setDirty(true);
  }

  function handleRemoveExercise(key: string) {
    setRows((r) =>
      r
        .filter((row) => row._key !== key)
        .map((row, i) => ({ ...row, order_index: i + 1 })),
    );
    setDirty(true);
  }

  function handleSave() {
    updateTemplate.mutate(
      {
        name,
        description: description || undefined,
        estimated_duration: duration ? Number(duration) : undefined,
        is_public: isPublic,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        exercises: rows.map(({ _key: _, ...item }) => item),
      },
      {
        onSuccess: () => {
          toast.success(t("templates.saved"));
          navigate("/templates");
        },
      },
    );
  }

  function handleDelete() {
    deleteTemplate.mutate(id, {
      onSuccess: () => navigate("/templates"),
    });
  }

  function exerciseName(exerciseId: string) {
    const slug = exercises?.find((ex) => ex.id === exerciseId)?.slug;
    return slug ? t(`exercises.${slug}`) : exerciseId;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <DetailHeader
        onBack={() => navigate("/templates")}
        title={template.name}
        subtitle={
          template.description ? (
            <span className="text-muted-foreground">
              {template.description}
            </span>
          ) : undefined
        }
        onDelete={canDelete ? () => setDeleteOpen(true) : undefined}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("templates.section.info")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>{t("templates.form.name")}</Label>
            <Input
              value={name}
              readOnly={!canEdit}
              onChange={(e) => {
                setName(e.target.value);
                setDirty(true);
              }}
              placeholder="Push Day"
            />
          </div>
          <div className="space-y-1">
            <Label>{t("templates.form.description")}</Label>
            <Input
              value={description}
              readOnly={!canEdit}
              onChange={(e) => {
                setDescription(e.target.value);
                setDirty(true);
              }}
              placeholder={t("common.optional")}
            />
          </div>
          <div className="space-y-1">
            <Label>{t("templates.form.duration")}</Label>
            <Input
              type="number"
              min={1}
              value={duration}
              readOnly={!canEdit}
              onChange={(e) => {
                setDuration(e.target.value);
                setDirty(true);
              }}
              placeholder="60"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("templates.visibility.label")}</Label>
              <p className="text-xs text-muted-foreground">
                {isPublic
                  ? t("templates.visibility.publicHint")
                  : t("templates.visibility.privateHint")}
              </p>
            </div>
            <Switch
              checked={isPublic}
              disabled={!canEdit}
              onCheckedChange={(v: boolean) => {
                setIsPublic(v);
                setDirty(true);
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("templates.section.exercises")}
            {rows.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ×{rows.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {rows.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              {t("templates.noExercises")}
            </p>
          )}
          {rows.map((row) => (
            <div key={row._key} className="flex items-center gap-2">
              <GripVertical className="size-4 text-muted-foreground shrink-0" />
              <span className="flex-1 text-sm font-medium truncate">
                {exerciseName(row.exercise_id)}
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                {row.target_sets != null && <span>{row.target_sets}×</span>}
                {row.target_duration_sec != null ? (
                  <span>{row.target_duration_sec}s</span>
                ) : (
                  row.target_reps != null && <span>{row.target_reps} rép</span>
                )}
                {row.rest_seconds != null && (
                  <span>{row.rest_seconds}s repos</span>
                )}
              </div>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemoveExercise(row._key)}
                >
                  <Trash2 className="size-3" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {canEdit && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="size-4" />
          {t("templates.addExercise")}
        </Button>
      )}

      <AddExerciseDialog
        mode="template"
        exercises={exercises}
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAddExercise}
      />

      {canEdit && (
        <Button
          className="w-full"
          onClick={handleSave}
          disabled={updateTemplate.isPending || !dirty}
        >
          {updateTemplate.isPending
            ? t("templates.saving")
            : t("templates.save")}
        </Button>
      )}

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("templates.deleteConfirm")}
        onConfirm={handleDelete}
        isPending={deleteTemplate.isPending}
      />
    </div>
  );
}
