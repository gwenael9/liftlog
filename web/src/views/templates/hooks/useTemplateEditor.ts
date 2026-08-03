import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useUpdateTemplate,
  useDeleteTemplate,
} from "@/shared/hooks/useTemplates";
import { useExercises } from "@/shared/hooks/useExercices";
import { useCurrentUser } from "@/shared/hooks/useAuth";
import { type ExerciseRow } from "@/views/templates/components/ExerciseList";
import type { TemplateInfoState } from "@/views/templates/components/InfoDialog";
import type {
  TemplateResponseDto,
  TemplateExerciseItemDto,
} from "@/shared/api/templates";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// Compteur module-level : survit aux re-renders et re-mounts, garantit des clés
// React uniques même si le même exercice est ajouté deux fois.
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

// `template` est optionnel car le hook est appelé inconditionnellement avant les
// guards loading/notFound dans TemplateDetailPage (Rules of Hooks). L'état est
// initialisé avec des valeurs par défaut ; le composant fait un early return
// avant de rendre quoi que ce soit avec ces valeurs.
export function useTemplateEditor(
  id: string,
  template: TemplateResponseDto | undefined,
  exercises: ReturnType<typeof useExercises>["data"],
) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const updateTemplate = useUpdateTemplate(id);
  const deleteTemplate = useDeleteTemplate();
  const { data: currentUser } = useCurrentUser();

  const canEdit =
    currentUser?.id === template?.user_id || currentUser?.role === "admin";

  const [info, setInfo] = useState<TemplateInfoState>({
    name: template?.name ?? "",
    description: template?.description ?? "",
    duration:
      template?.estimated_duration != null
        ? String(template.estimated_duration)
        : "",
    isPublic: template?.is_public ?? false,
  });
  const [rows, setRows] = useState<ExerciseRow[]>(() =>
    template ? toExerciseRows(template) : [],
  );
  // Flag booléen pour les modifs d'exercices uniquement (info est computed via infoChanged).
  const [rowsDirty, setRowsDirty] = useState(false);

  // Sync rows/info quand template arrive après le mount (cache froid → premier fetch async).
  // Ignoré si l'utilisateur a déjà des modifications locales.
  useEffect(() => {
    if (!template || rowsDirty) return;
    const rowsToSet = toExerciseRows(template);
    const infoToSet = {
      name: template.name ?? "",
      description: template.description ?? "",
      duration:
        template.estimated_duration != null
          ? String(template.estimated_duration)
          : "",
      isPublic: template.is_public ?? false,
    };

    queueMicrotask(() => {
      if (rowsDirty || !template) return;
      setRows(rowsToSet);
      setInfo(infoToSet);
    });
  }, [rowsDirty, template, template?.id]);

  const [addOpen, setAddOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleInfoOpenChange(open: boolean) {
    if (!open) {
      setInfo({
        name: template?.name ?? "",
        description: template?.description ?? "",
        duration:
          template?.estimated_duration != null
            ? String(template.estimated_duration)
            : "",
        isPublic: template?.is_public ?? false,
      });
    }
    setInfoOpen(open);
  }

  function handleInfoChange(patch: Partial<TemplateInfoState>) {
    setInfo((prev) => ({ ...prev, ...patch }));
  }

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
    setRowsDirty(true);
  }

  function handleRemoveExercise(key: string) {
    setRows((r) =>
      r
        .filter((row) => row._key !== key)
        .map((row, i) => ({ ...row, order_index: i + 1 })),
    );
    setRowsDirty(true);
  }

  function handleReorderExercise(activeKey: string, overKey: string) {
    setRows((r) => {
      const from = r.findIndex((row) => row._key === activeKey);
      const to = r.findIndex((row) => row._key === overKey);
      if (from === -1 || to === -1) return r;
      const next = [...r];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next.map((row, i) => ({ ...row, order_index: i + 1 }));
    });
    setRowsDirty(true);
  }

  // Valeurs originales du template (serveur) pour détecter les modifs info.
  const originalInfo = {
    name: template?.name ?? "",
    description: template?.description ?? "",
    duration:
      template?.estimated_duration != null
        ? String(template.estimated_duration)
        : "",
    isPublic: template?.is_public ?? false,
  };

  const infoChanged =
    info.name !== originalInfo.name ||
    info.description !== originalInfo.description ||
    info.duration !== originalInfo.duration ||
    info.isPublic !== originalInfo.isPublic;

  const dirty = infoChanged || rowsDirty;

  const mutationPayload = () => ({
    name: info.name,
    description: info.description || undefined,
    estimated_duration: info.duration ? Number(info.duration) : undefined,
    is_public: info.isPublic,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    exercises: rows.map(({ _key: _, ...item }) => item),
  });

  function handleSave() {
    updateTemplate.mutate(mutationPayload(), {
      onSuccess: () => {
        toast.success(t("templates.saved"));
        navigate("/templates");
      },
    });
  }

  function handleSaveInfo() {
    updateTemplate.mutate(mutationPayload(), {
      onSuccess: () => {
        toast.success(t("templates.saved"));
        setInfoOpen(false);
        setRowsDirty(false);
      },
    });
  }

  function handleDelete() {
    deleteTemplate.mutate(id, {
      onSuccess: () => navigate("/templates"),
    });
  }

  // exercises peut encore charger — fallback sur l'ID brut pour éviter des lignes vides.
  function exerciseName(exerciseId: string) {
    const slug = exercises?.find((ex) => ex.id === exerciseId)?.slug;
    return slug ? t(`exercises.${slug}`) : exerciseId;
  }

  function exerciseSlug(exerciseId: string) {
    return exercises?.find((ex) => ex.id === exerciseId)?.slug;
  }

  return {
    canEdit,
    info,
    rows,
    dirty,
    infoChanged,
    addOpen,
    setAddOpen,
    infoOpen,
    setInfoOpen,
    handleInfoOpenChange,
    deleteOpen,
    setDeleteOpen,
    handleInfoChange,
    handleAddExercise,
    handleRemoveExercise,
    handleReorderExercise,
    handleSave,
    handleSaveInfo,
    handleDelete,
    exerciseName,
    exerciseSlug,
    isSaving: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending,
  };
}
