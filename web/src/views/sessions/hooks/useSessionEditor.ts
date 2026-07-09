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
import type { SetEditValue, AddRow, ExerciseGroup, SegmentEditValue } from "@/views/sessions/types/session";
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

  // IDs retirés de l'UI immédiatement, suppression réelle différée à saveAll.
  const [deletingSetIds, setDeletingSetIds] = useState<Set<string>>(new Set());
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set());

  // Ordre local des exercices, keyed par exerciseId. Permet de réordonner
  // sans toucher au serveur avant la sauvegarde.
  const [orderOverride, setOrderOverride] = useState<Record<string, number>>({});

  // Exercices ajoutés localement, pas encore persistés — affichés dans le
  // carousel avec leurs pendingRows, envoyés au serveur à la sauvegarde.
  const [pendingExerciseIds, setPendingExerciseIds] = useState<string[]>([]);

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
    const serverGroups = Array.from(map.entries())
      .filter(([, sets]) => sets.length > 0)
      .map(([exId, sets]) => ({
        exerciseId: exId,
        exerciseSlug: sets[0].exercise.slug,
        trackingType: (sets[0].exercise.tracking_type ?? "strength") as
          | "strength"
          | "duration",
        exerciseOrder: orderOverride[exId] ?? sets[0].exercise_order,
        sets,
      }))
      .sort((a, b) => a.exerciseOrder - b.exerciseOrder);

    // Ajoute les exercices locaux (pas encore sur le serveur)
    const pendingGroups: ExerciseGroup[] = [];
    for (const exId of pendingExerciseIds) {
      if (map.has(exId)) continue; // déjà en session serveur
      const exInfo = (exercises ?? []).find((e) => e.id === exId);
      if (!exInfo) continue;
      pendingGroups.push({
        exerciseId: exId,
        exerciseSlug: exInfo.slug,
        trackingType: (exInfo.tracking_type ?? "strength") as "strength" | "duration",
        exerciseOrder: serverGroups.length + pendingGroups.length,
        sets: [],
      });
    }

    return [...serverGroups, ...pendingGroups];
  }, [session, deletingSetIds, orderOverride, pendingExerciseIds, exercises]);

  const total = setsByExercise.length;
  // clampedIndex évite un index hors-limites si un exercice est supprimé
  // pendant que son groupe est actif.
  const clampedIndex = Math.min(activeIndex, Math.max(0, total - 1));
  const group = setsByExercise[clampedIndex];

  // Fusionne patch local par-dessus la valeur serveur pour un set donné.
  // Le premier segment (s'il existe) est porté par reps/weight_kg au niveau
  // racine ; les segments suivants sont les paliers additionnels du drop set.
  function serverExtraSegmentsOf(set: SetResponseDto): SegmentEditValue[] {
    return (set.segments ?? []).slice(1).map((seg) => ({
      reps: String(seg.reps),
      weight_kg: seg.weight_kg != null ? String(seg.weight_kg) : "",
    }));
  }

  function resolveEditValue(set: SetResponseDto): SetEditValue {
    const patch = patches[set.id] ?? {};
    const serverExtraSegments = serverExtraSegmentsOf(set);
    return {
      reps: patch.reps ?? (set.reps != null ? String(set.reps) : ""),
      weight_kg:
        patch.weight_kg ?? (set.weight_kg != null ? String(set.weight_kg) : ""),
      duration_sec:
        patch.duration_sec ??
        (set.duration_sec != null ? String(set.duration_sec) : ""),
      extraSegments: patch.extraSegments ?? serverExtraSegments,
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
            (set.duration_sec != null ? String(set.duration_sec) : "")) ||
        (patch.extraSegments !== undefined &&
          JSON.stringify(patch.extraSegments) !==
            JSON.stringify(serverExtraSegmentsOf(set)))
      );
    });
  }

  // Construit le tableau `segments` à envoyer à l'API à partir des reps/poids
  // du premier palier + des paliers additionnels ; null si pas de drop set.
  function buildSegments(
    reps: string,
    weight_kg: string,
    extraSegments: SegmentEditValue[],
  ): { reps: number; weight_kg: number | null }[] | null {
    if (extraSegments.length === 0) return null;
    const toSegment = (r: string, w: string) => ({
      reps: r ? Number(r) : 0,
      weight_kg: w ? Number(w) : null,
    });
    return [toSegment(reps, weight_kg), ...extraSegments.map((s) => toSegment(s.reps, s.weight_kg))];
  }

  const orderDirty = Object.keys(orderOverride).length > 0;
  const isAnyDirty =
    notesDirty ||
    orderDirty ||
    pendingDeleteIds.size > 0 ||
    pendingExerciseIds.length > 0 ||
    setsByExercise.some(isGroupDirty);

  function moveExercise(dir: "up" | "down") {
    const targetIndex = dir === "up" ? clampedIndex - 1 : clampedIndex + 1;
    if (targetIndex < 0 || targetIndex >= total) return;

    const current = setsByExercise[clampedIndex];
    const target = setsByExercise[targetIndex];
    const currentOrder = current.exerciseOrder;
    const targetOrder = target.exerciseOrder;

    setOrderOverride((prev) => ({
      ...prev,
      [current.exerciseId]: targetOrder,
      [target.exerciseId]: currentOrder,
    }));
    setActiveIndex(targetIndex);
  }

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

  // Retire le set de l'UI immédiatement — suppression réelle différée à saveAll.
  function handleDeleteSet(setId: string) {
    setDeletingSetIds((prev) => new Set([...prev, setId]));
    setPendingDeleteIds((prev) => new Set([...prev, setId]));
    setPatches((prev) => {
      const n = { ...prev };
      delete n[setId];
      return n;
    });
  }

  // Envoie patches + pendingRows en bulk, notes en parallèle si modifiées.
  async function saveAll() {
    const body: BulkUpdateSetsDto = { updates: [], creates: [] };

    for (const g of setsByExercise) {
      for (const set of g.sets) {
        const vals = resolveEditValue(set);
        const segments = buildSegments(vals.reps, vals.weight_kg, vals.extraSegments);
        body.updates.push({
          id: set.id,
          exercise_order: orderOverride[g.exerciseId] !== undefined ? g.exerciseOrder : undefined,
          reps: vals.reps ? Number(vals.reps) : undefined,
          weight_kg: vals.weight_kg ? Number(vals.weight_kg) : undefined,
          duration_sec: vals.duration_sec ? Number(vals.duration_sec) : undefined,
          segments,
        });
      }
      const pending = (pendingRows[g.exerciseId] ?? []).filter(
        (r) => r.reps || r.weight_kg || r.duration_sec,
      );
      for (let i = 0; i < pending.length; i++) {
        const row = pending[i];
        const segments = buildSegments(row.reps, row.weight_kg, row.extraSegments);
        body.creates?.push({
          exercise_id: g.exerciseId,
          exercise_order: g.exerciseOrder,
          set_index: g.sets.length + i + 1,
          reps: row.reps ? Number(row.reps) : undefined,
          weight_kg: row.weight_kg ? Number(row.weight_kg) : undefined,
          duration_sec: row.duration_sec ? Number(row.duration_sec) : undefined,
          segments: segments ?? undefined,
          performed_at: new Date().toISOString(),
        });
      }
    }

    const promises: Promise<unknown>[] = [
      bulkUpdateSets.mutateAsync(body),
      ...[...pendingDeleteIds].map((id) => deleteSet.mutateAsync(id)),
    ];
    if (notesDirty) promises.push(updateSession.mutateAsync({ notes }));
    await Promise.all(promises);

    setPatches({});
    setPendingRows({});
    setOrderOverride({});
    setPendingExerciseIds([]);
    setDeletingSetIds(new Set());
    setPendingDeleteIds(new Set());
    setNotesOverride(undefined);
    toast.success(t("sessions.saved"));
  }

  function cancelAll() {
    setPatches({});
    setPendingRows({});
    setOrderOverride({});
    setPendingExerciseIds([]);
    setDeletingSetIds(new Set());
    setPendingDeleteIds(new Set());
    setNotesOverride(undefined);
  }

  // Ajoute un exercice localement — aucun appel API, tout est envoyé à saveAll.
  function handleAddExercise(exerciseId: string, rows: AddRow[]) {
    const existingGroup = setsByExercise.find((g) => g.exerciseId === exerciseId);

    if (!existingGroup) {
      setPendingExerciseIds((prev) =>
        prev.includes(exerciseId) ? prev : [...prev, exerciseId],
      );
    }

    const filledRows = rows.filter((r) => r.reps || r.weight_kg || r.duration_sec);
    if (filledRows.length > 0) {
      setPendingRows((prev) => ({
        ...prev,
        [exerciseId]: [...(prev[exerciseId] ?? []), ...filledRows],
      }));
    }

    // Navigue vers le groupe ; s'il est nouveau, il apparaîtra en dernier après re-render.
    const existingIndex = setsByExercise.findIndex((g) => g.exerciseId === exerciseId);
    setActiveIndex(existingIndex !== -1 ? existingIndex : setsByExercise.length);
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
    moveExercise,
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
