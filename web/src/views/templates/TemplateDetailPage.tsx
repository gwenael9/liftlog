import { useParams, useNavigate } from "react-router-dom";
import { Info } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useTemplate } from "@/shared/hooks/useTemplates";
import { useExercises } from "@/shared/hooks/useSessions";
import { useTemplateEditor } from "@/views/templates/hooks/useTemplateEditor";
import { AddExerciseDialog } from "@/shared/components/AddExerciseDialog";
import { ConfirmDeleteDialog } from "@/shared/components/ConfirmDeleteDialog";
import { DetailHeader } from "@/shared/components/layout/DetailHeader";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import InfoDialog from "@/views/templates/components/InfoDialog";
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
    infoOpen,
    setInfoOpen,
    deleteOpen,
    setDeleteOpen,
    handleInfoChange,
    handleAddExercise,
    handleRemoveExercise,
    handleReorderExercise,
    handleSave,
    handleDelete,
    exerciseName,
    isSaving,
    isDeleting,
  } = editor;

  return (
    <PageContainer>
      <DetailHeader
        onBack={() => navigate("/templates")}
        title={template.name}
        subtitle={template.description}
        onDelete={canEdit ? () => setDeleteOpen(true) : undefined}
        subHeader={
          <>
            <Button variant="outline" onClick={() => setInfoOpen(true)}>
              <Info className="size-4" />
              {t("templates.section.info")}
            </Button>
            {canEdit && (
              <Button onClick={handleSave} disabled={isSaving || !dirty}>
                {isSaving ? t("templates.saving") : t("common.save")}
              </Button>
            )}
          </>
        }
      />

      <InfoDialog
        open={infoOpen}
        onOpenChange={setInfoOpen}
        canEdit={canEdit}
        info={info}
        onChange={handleInfoChange}
      />

      <TemplateExerciseList
        rows={rows}
        canEdit={canEdit}
        getExerciseName={exerciseName}
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
