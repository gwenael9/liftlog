import { Plus, ChevronUp, ChevronDown, Repeat } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ExerciseImageButton } from "@/shared/components/ExerciseImageButton";
import { SetRow } from "@/views/sessions/components/SetRow";
import type {
  ExerciseGroup,
  SetEditValue,
  AddRow,
} from "@/views/sessions/types/session";
import { useTranslation } from "react-i18next";
import { useUnitSystem } from "@/shared/hooks/useAuth";
import { useExercise } from "@/shared/hooks/useExercices";

interface Props {
  group: ExerciseGroup;
  editValues: Record<string, SetEditValue>;
  pendingRows: AddRow[];
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onPatchEdit: (setId: string, patch: Partial<SetEditValue>) => void;
  onAddPending: () => void;
  onPatchPending: (i: number, patch: Partial<AddRow>) => void;
  onRemovePending: (i: number) => void;
  onDeleteSet: (setId: string) => void;
  onSwitch: () => void;
}

export function ExerciseCard({
  group,
  editValues,
  pendingRows,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onPatchEdit,
  onAddPending,
  onPatchPending,
  onRemovePending,
  onDeleteSet,
  onSwitch,
}: Props) {
  const { t } = useTranslation();
  const unit = useUnitSystem();
  const totalSets = group.sets.length + pendingRows.length;
  const isDuration = group.trackingType === "duration";

  const { data } = useExercise(group.exerciseId);
  const isCore = data?.muscle_group === "core";

  const colClass =
    isDuration || isCore
      ? "grid-cols-[1.5rem_1fr_auto]"
      : "grid-cols-[1.5rem_1fr_1fr_auto]";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex flex-col">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className="h-4 w-4"
            >
              <ChevronUp className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className="h-4 w-4"
            >
              <ChevronDown className="size-3" />
            </Button>
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            #{group.exerciseOrder + 1}
          </span>
          <span className="flex-1">{t(`exercises.${group.exerciseSlug}`)}</span>
          <span className="text-sm font-normal text-muted-foreground">
            ×{totalSets}
          </span>
          <ExerciseImageButton exerciseSlug={group.exerciseSlug} />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onSwitch}
            title={t("exerciseForm.switchLong")}
          >
            <Repeat className="size-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className={`grid ${colClass} gap-2 items-center px-1`}>
          <span />
          {isDuration ? (
            <span className="text-xs text-muted-foreground">
              {t("exerciseForm.duration")}
            </span>
          ) : (
            <>
              <span className="text-xs text-muted-foreground">
                {t("exerciseForm.reps")}
              </span>
              {isCore ? null : (
                <span className="text-xs text-muted-foreground">
                  {t("exerciseForm.weight", { unit })}
                </span>
              )}
            </>
          )}
          <span />
        </div>

        {group.sets.map((set) => (
          <SetRow
            key={set.id}
            label={`S${set.set_index}`}
            colClass={colClass}
            isDuration={isDuration}
            unit={unit}
            values={
              editValues[set.id] ?? {
                reps: "",
                weight_kg: "",
                duration_sec: "",
                extraSegments: [],
              }
            }
            isPr={set.is_pr}
            onPatch={(patch) => onPatchEdit(set.id, patch)}
            onDelete={() => onDeleteSet(set.id)}
            isCore={isCore}
          />
        ))}

        {pendingRows.map((row, i) => (
          <SetRow
            key={`pending-${i}`}
            label={`S${group.sets.length + i + 1}`}
            colClass={colClass}
            isDuration={isDuration}
            unit={unit}
            values={row}
            onPatch={(patch) => onPatchPending(i, patch)}
            onDelete={() => onRemovePending(i)}
            isCore={isCore}
          />
        ))}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={onAddPending}
        >
          <Plus />
          {t("exerciseForm.addSet")}
        </Button>
      </CardContent>
    </Card>
  );
}
