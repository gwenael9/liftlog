import { useParams, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useSessionEditor } from "@/views/sessions/hooks/useSessionEditor";
import { formatSessionDateLong } from "@/shared/utils";
import { DetailHeader } from "@/shared/components/layout/DetailHeader";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { ExerciseCard, CarouselNav } from "@/views/sessions/components";
import { AddExerciseDialog } from "@/shared/components/AddExerciseDialog";
import { ConfirmDeleteDialog } from "@/shared/components/ConfirmDeleteDialog";
import { SessionDetailSkeleton } from "./SessionDetailSkeleton";
import NotFound from "../NotFound";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { useSwipe } from "@/shared/hooks/useSwipe";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/shared/lib/utils";

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const editor = useSessionEditor(id!);

  const {
    session,
    exercises,
    isLoading,
    notes,
    setNotesOverride,
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
    switchOpen,
    setSwitchOpen,
    openSwitchDialog,
    submitSwitch,
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
    isSaving,
    isDeleting,
  } = editor;

  const [slideDir, setSlideDir] = useState<"left" | "right" | null>(null);
  const prevIndexRef = useRef(clampedIndex);

  useEffect(() => {
    if (prevIndexRef.current !== clampedIndex) {
      setSlideDir(clampedIndex > prevIndexRef.current ? "left" : "right");
      prevIndexRef.current = clampedIndex;
    }
  }, [clampedIndex]);

  const { deltaX, isDragging, ...swipeHandlers } = useSwipe({
    onSwipeLeft: () => setActiveIndex(Math.min(total - 1, clampedIndex + 1)),
    onSwipeRight: () => setActiveIndex(Math.max(0, clampedIndex - 1)),
  });

  if (isLoading) return <SessionDetailSkeleton />;
  if (!session) return <NotFound />;

  return (
    <PageContainer>
      <DetailHeader
        onBack={() => navigate("/sessions")}
        title={formatSessionDateLong(session.scheduled_date)}
        onDelete={() => setDeleteOpen(true)}
        subHeader={
          <>
            {isAnyDirty && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={cancelAll}
                disabled={isSaving}
              >
                {t("common.cancel")}
              </Button>
            )}
            <Button
              className="flex-1"
              onClick={saveAll}
              disabled={isSaving || !isAnyDirty}
            >
              {t("common.save")}
            </Button>
          </>
        }
      />

      {total === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-4">
          {t("sessions.noExercises")}
        </p>
      ) : (
        <div className="space-y-3">
          {group && (
            <div className="overflow-hidden px-px -mx-px" {...swipeHandlers}>
              <div
                key={group.exerciseId}
                style={{
                  transform: `translateX(${deltaX}px)`,
                  transition: isDragging ? "none" : "transform 0.25s ease-out",
                }}
                className={cn(
                  slideDir === "left" && "animate-slide-in-from-right",
                  slideDir === "right" && "animate-slide-in-from-left",
                )}
                onAnimationEnd={() => setSlideDir(null)}
              >
                <ExerciseCard
                  group={group}
                  editValues={groupEditValues}
                  pendingRows={pendingRows[group.exerciseId] ?? []}
                  canMoveUp={clampedIndex > 0}
                  canMoveDown={clampedIndex < total - 1}
                  onMoveUp={() => moveExercise("up")}
                  onMoveDown={() => moveExercise("down")}
                  onPatchEdit={patchEdit}
                  onAddPending={() => addPendingRow(group.exerciseId)}
                  onPatchPending={(i, patch) =>
                    patchPendingRow(group.exerciseId, i, patch)
                  }
                  onRemovePending={(i) => removePendingRow(group.exerciseId, i)}
                  onDeleteSet={handleDeleteSet}
                  onSwitch={() => openSwitchDialog(group.exerciseId)}
                />
              </div>
            </div>
          )}
          <CarouselNav
            total={total}
            activeIndex={clampedIndex}
            onChange={setActiveIndex}
          />
        </div>
      )}

      <Button
        variant="outline"
        className="w-full"
        onClick={() => setAddOpen(true)}
      >
        <Plus className="size-4" />
        {t("sessions.addExercise")}
      </Button>

      <div className="flex gap-2 flex-col">
        <Label>{t("sessions.notes")}</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotesOverride(e.target.value)}
          placeholder={t("sessions.notesPlaceholder")}
          className="min-h-20"
        />
      </div>

      <AddExerciseDialog
        mode="session"
        exercises={exercises}
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAddExercise}
        isPending={isSaving}
      />

      <AddExerciseDialog
        mode="switch"
        exercises={exercises}
        open={switchOpen}
        onOpenChange={setSwitchOpen}
        onSubmit={submitSwitch}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("sessions.deleteConfirm")}
        onConfirm={handleDeleteSession}
        isPending={isDeleting}
      />
    </PageContainer>
  );
}
