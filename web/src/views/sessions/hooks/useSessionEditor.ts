import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useSession,
  useDeleteSession,
  useBulkUpdateSets,
  useDeleteSet,
  useExercises,
  useUpdateSession,
} from "@/shared/hooks/useSessions";
import type { SetResponseDto, BulkUpdateSetsDto } from "@/shared/api/sessions";
import type { SetEditValue, AddRow, ExerciseGroup } from "@/views/sessions/types/session";
import { emptyAddRow } from "@/views/sessions/types/session";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// `session` est optionnel pour la même raison que useTemplateEditor : le hook
// est appelé avant les guards loading/notFound dans SessionDetailPage.
export function useSessionEditor(id: string) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: session, isLoading } = useSession(id);
  const { data: exercises } = useExercises();
  const bulkUpdateSets = useBulkUpdateSets(id);
  const updateSession = useUpdateSession(id);
  const deleteSession = useDeleteSession();
  const deleteSet = useDeleteSet(id);

  // notesOverride = undefined signifie "pas encore modifié" — distinct de ""
  // ce qui permet de détecter si l'utilisateur a réellement changé les notes.
  const [notesOverride, setNotesOverride] = useState<string | undefined>(undefined);
  const notes = notesOverride ?? session?.notes ?? "";
  const notesDirty =
    notesOverride !== undefined && notesOverride !== (session?.notes ?? "");

  // Overlay des éditions utilisateur, keyed par set ID. Les valeurs serveur
  // restent la référence — patches ne contient que les champs modifiés.
  const [patches, setPatches] = useState<Record<string, Partial<SetEditValue>>>({});

  // Nouvelles séries en attente d'envoi, groupées par exercice.
  const [pendingRows, setPendingRows] = useState<Record<string, AddRow[]>>({});

  const [activeIndex, setActiveIndex] = useState(0);

  // IDs retirés optimistement de l'UI avant confirmation serveur.
  const [deletingSetIds, setDeletingSetIds] = useState<Set<string>>(new Set());

  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Regroupe les sets par exercice en respectant l'ordre et en excluant les
  // sets en cours de suppression optimiste.
  const setsByExercise = useMemo((): ExerciseGroup[] => {
    if (!session) return [];
    const map = new Map<string, SetResponseDto[]>();
    for (const s of [...(session.session_sets ?? [])].sort((a, b) =>
      a.exercise_order !== b.exercise_order
        ? a.exercise_order - b.exercise_order
        : a.set_index - b.set_index,
    )) {
      if (deletingSetIds.has(s.id)) continue;
      const list = map.get(s.exercise_id) ?? [];
      list.push(s);
      map.set(s.exercise_id, list);
    }
    return Array.from(map.entries())
      .filter(([, sets]) => sets.length > 0)
      .map(([exId, sets]) => ({
        exerciseId: exId,
        exerciseSlug: sets[0].exercise.slug,
        trackingType: (sets[0].exercise.tracking_type ?? "strength") as
          | "strength"
          | "duration",
        exerciseOrder: sets[0].exercise_order,
        sets,
      }));
  }, [session, deletingSetIds]);

  const total = setsByExercise.length;
  // clampedIndex évite un index hors-limites si un exercice est supprimé
  // pendant que son groupe est actif.
  const clampedIndex = Math.min(activeIndex, Math.max(0, total - 1));
  const group = setsByExercise[clampedIndex];

  // Fusionne patch local par-dessus la valeur serveur pour un set donné.
  function resolveEditValue(set: SetResponseDto): SetEditValue {
    const patch = patches[set.id] ?? {};
    return {
      reps: patch.reps ?? (set.reps != null ? String(set.reps) : ""),
      weight_kg:
        patch.weight_kg ?? (set.weight_kg != null ? String(set.weight_kg) : ""),
      duration_sec:
        patch.duration_sec ??
        (set.duration_sec != null ? String(set.duration_sec) : ""),
    };
  }

  // Calculé uniquement pour le groupe visible — évite de résoudre tous les patches
  // à chaque render.
  const groupEditValues: Record<string, SetEditValue> = group
    ? Object.fromEntries(group.sets.map((set) => [set.id, resolveEditValue(set)]))
    : {};

  function isGroupDirty(g: ExerciseGroup): boolean {
    if ((pendingRows[g.exerciseId] ?? []).length > 0) return true;
    return g.sets.some((set) => {
      const patch = patches[set.id];
      if (!patch) return false;
      return (
        (patch.reps !== undefined &&
          patch.reps !== (set.reps != null ? String(set.reps) : "")) ||
        (patch.weight_kg !== undefined &&
          patch.weight_kg !==
            (set.weight_kg != null ? String(set.weight_kg) : "")) ||
        (patch.duration_sec !== undefined &&
          patch.duration_sec !==
            (set.duration_sec != null ? String(set.duration_sec) : ""))
      );
    });
  }

  const isAnyDirty = notesDirty || setsByExercise.some(isGroupDirty);

  function patchEdit(setId: string, patch: Partial<SetEditValue>) {
    setPatches((prev) => ({ ...prev, [setId]: { ...prev[setId], ...patch } }));
  }

  function addPendingRow(exerciseId: string) {
    setPendingRows((prev) => ({
      ...prev,
      [exerciseId]: [...(prev[exerciseId] ?? []), emptyAddRow()],
    }));
  }

  function patchPendingRow(exerciseId: string, i: number, patch: Partial<AddRow>) {
    setPendingRows((prev) => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((r, idx) =>
        idx === i ? { ...r, ...patch } : r,
      ),
    }));
  }

  function removePendingRow(exerciseId: string, i: number) {
    setPendingRows((prev) => ({
      ...prev,
      [exerciseId]: prev[exerciseId].filter((_, idx) => idx !== i),
    }));
  }

  // Suppression optimiste : retire le set de l'UI immédiatement, restaure
  // si l'appel serveur échoue.
  async function handleDeleteSet(setId: string) {
    setDeletingSetIds((prev) => new Set([...prev, setId]));
    setPatches((prev) => {
      const n = { ...prev };
      delete n[setId];
      return n;
    });
    try {
      await deleteSet.mutateAsync(setId);
    } catch {
      setDeletingSetIds((prev) => {
        const n = new Set(prev);
        n.delete(setId);
        return n;
      });
    }
  }

  // Envoie patches + pendingRows en bulk, notes en parallèle si modifiées.
  async function saveAll() {
    const body: BulkUpdateSetsDto = { updates: [], creates: [] };

    for (const g of setsByExercise) {
      for (const set of g.sets) {
        const vals = resolveEditValue(set);
        body.updates.push({
          id: set.id,
          reps: vals.reps ? Number(vals.reps) : undefined,
          weight_kg: vals.weight_kg ? Number(vals.weight_kg) : undefined,
          duration_sec: vals.duration_sec ? Number(vals.duration_sec) : undefined,
        });
      }
      const pending = pendingRows[g.exerciseId] ?? [];
      for (let i = 0; i < pending.length; i++) {
        const row = pending[i];
        body.creates?.push({
          exercise_id: g.exerciseId,
          exercise_order: g.exerciseOrder,
          set_index: g.sets.length + i + 1,
          reps: row.reps ? Number(row.reps) : undefined,
          weight_kg: row.weight_kg ? Number(row.weight_kg) : undefined,
          duration_sec: row.duration_sec ? Number(row.duration_sec) : undefined,
          performed_at: new Date().toISOString(),
        });
      }
    }

    const promises: Promise<unknown>[] = [bulkUpdateSets.mutateAsync(body)];
    if (notesDirty) promises.push(updateSession.mutateAsync({ notes }));
    await Promise.all(promises);

    setPatches({});
    setPendingRows({});
    setNotesOverride(undefined);
    toast.success(t("sessions.saved"));
    navigate("/sessions");
  }

  function cancelAll() {
    setPatches({});
    setPendingRows({});
    setNotesOverride(undefined);
  }

  async function handleAddExercise(exerciseId: string, rows: AddRow[]) {
    const existingGroup = setsByExercise.find((g) => g.exerciseId === exerciseId);
    const exerciseOrder = existingGroup?.exerciseOrder ?? setsByExercise.length;
    const existingCount = existingGroup?.sets.length ?? 0;
    const body: BulkUpdateSetsDto = {
      updates: [],
      creates: rows.map((row, i) => ({
        exercise_id: exerciseId,
        exercise_order: exerciseOrder,
        set_index: existingCount + i + 1,
        reps: row.reps ? Number(row.reps) : undefined,
        weight_kg: row.weight_kg ? Number(row.weight_kg) : undefined,
        duration_sec: row.duration_sec ? Number(row.duration_sec) : undefined,
        performed_at: new Date().toISOString(),
      })),
    };
    await bulkUpdateSets.mutateAsync(body);
    // Navigue vers le groupe ajouté ; s'il est nouveau, il apparaîtra en dernier.
    const newIndex = setsByExercise.findIndex((g) => g.exerciseId === exerciseId);
    setActiveIndex(newIndex !== -1 ? newIndex : setsByExercise.length);
  }

  function handleDeleteSession() {
    deleteSession.mutate(id, { onSuccess: () => navigate("/sessions") });
  }

  return {
    session,
    exercises,
    isLoading,
    notes,
    notesDirty,
    setNotesOverride,
    setsByExercise,
    total,
    clampedIndex,
    group,
    groupEditValues,
    pendingRows,
    isAnyDirty,
    addOpen,
    setAddOpen,
    deleteOpen,
    setDeleteOpen,
    activeIndex,
    setActiveIndex,
    patchEdit,
    addPendingRow,
    patchPendingRow,
    removePendingRow,
    handleDeleteSet,
    saveAll,
    cancelAll,
    handleAddExercise,
    handleDeleteSession,
    isSaving: bulkUpdateSets.isPending,
    isDeleting: deleteSession.isPending,
  };
}
