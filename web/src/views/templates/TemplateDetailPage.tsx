import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Clock, Globe, Lock, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import { useTemplate } from "@/shared/hooks/useTemplates";
import { useExercises } from "@/shared/hooks/useExercices";
import { useTemplateEditor } from "@/views/templates/hooks/useTemplateEditor";
import { AddExerciseDialog } from "@/shared/components/AddExerciseDialog";
import { ConfirmDeleteDialog } from "@/shared/components/ConfirmDeleteDialog";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { TemplateExerciseList } from "@/views/templates/components/ExerciseList";
import { useTranslation } from "react-i18next";
import { TemplateDetailSkeleton } from "./TemplateDetailSkeleton";
import NotFound from "../NotFound";

export function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: template, isLoading } = useTemplate(id!);
  const { data: exercises } = useExercises();

  const editor = useTemplateEditor(id!, template, exercises);

  if (isLoading) return <TemplateDetailSkeleton />;
  if (!template) return <NotFound />;

  const {
    canEdit,
    info,
    rows,
    dirty,
    addOpen,
    setAddOpen,
    deleteOpen,
    setDeleteOpen,
    handleInfoChange,
    handleAddExercise,
    handleRemoveExercise,
    handleReorderExercise,
    handleSave,
    handleDelete,
    exerciseName,
    exerciseSlug,
    isSaving,
    isDeleting,
  } = editor;

  return (
    <PageContainer>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/templates")}
        >
          <ChevronLeft />
        </Button>
        <div className="flex-1 min-w-0">
          {canEdit ? (
            <input
              className="w-full bg-transparent border-none outline-none text-xl font-bold capitalize truncate"
              value={info.name}
              onChange={(e) => handleInfoChange({ name: e.target.value })}
              placeholder={t("templates.form.name")}
            />
          ) : (
            <h2 className="text-xl font-bold capitalize truncate">
              {info.name}
            </h2>
          )}
        </div>
        {canEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="text-destructive" />
          </Button>
        )}
      </div>

      <div className="-mt-2 pl-11">
        {canEdit ? (
          <input
            className="w-full bg-transparent border-none outline-none text-sm text-muted-foreground"
            value={info.description}
            onChange={(e) => handleInfoChange({ description: e.target.value })}
            placeholder={t("common.optional")}
          />
        ) : (
          info.description && (
            <p className="text-sm text-muted-foreground">{info.description}</p>
          )
        )}
      </div>

      <div className="border-t border-b py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0" />
            {canEdit ? (
              <input
                type="number"
                min={1}
                className="w-12 bg-transparent border-b border-muted outline-none text-sm text-foreground"
                value={info.duration}
                onChange={(e) => handleInfoChange({ duration: e.target.value })}
                placeholder="60"
              />
            ) : (
              <span>{info.duration ? `${info.duration} min` : "—"}</span>
            )}
            {canEdit && info.duration && <span className="text-xs">min</span>}
          </span>
          <span className="flex items-center gap-1.5">
            {info.isPublic ? (
              <Globe className="size-3.5 shrink-0" />
            ) : (
              <Lock className="size-3.5 shrink-0" />
            )}
            <span>
              {info.isPublic
                ? t("templates.visibility.public")
                : t("templates.visibility.private")}
            </span>
            {canEdit && (
              <Switch
                className="scale-75 origin-left"
                checked={info.isPublic}
                onCheckedChange={(v: boolean) =>
                  handleInfoChange({ isPublic: v })
                }
              />
            )}
          </span>
        </div>
        <Button size="sm" onClick={handleSave} disabled={isSaving || !dirty}>
          {isSaving ? t("templates.saving") : t("common.save")}
        </Button>
      </div>

      <TemplateExerciseList
        rows={rows}
        canEdit={canEdit}
        getExerciseName={exerciseName}
        getExerciseSlug={exerciseSlug}
        onAdd={() => setAddOpen(true)}
        onRemove={handleRemoveExercise}
        onReorder={handleReorderExercise}
      />

      <AddExerciseDialog
        mode="template"
        exercises={exercises}
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAddExercise}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("templates.deleteConfirm")}
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
    </PageContainer>
  );
}
