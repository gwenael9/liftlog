import { useMemo, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/shared/components/ui/select";
import type { ExerciseResponseDto } from "@/shared/api/exercises";
import type { AddRow } from "@/views/sessions/types/session";
import { emptyAddRow } from "@/views/sessions/types/session";
import { useTranslation } from "react-i18next";
import { useUnitSystem } from "@/shared/hooks/useAuth";
import {
  weightKgToDisplayString,
  displayStringToWeightKg,
  groupExercisesByMuscleGroup,
} from "@/shared/utils";

export interface TemplateExerciseData {
  targetSets?: number;
  targetReps?: number;
  restSeconds?: number;
  targetDurationSec?: number;
}

type Props = {
  exercises: ExerciseResponseDto[] | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending?: boolean;
} & (
  | {
      mode: "session";
      onSubmit: (exerciseId: string, rows: AddRow[]) => void | Promise<void>;
    }
  | {
      mode: "template";
      onSubmit: (exerciseId: string, data: TemplateExerciseData) => void;
    }
  | { mode: "switch"; onSubmit: (exerciseId: string) => void }
);

export function AddExerciseDialog(props: Props) {
  const { exercises, open, onOpenChange, isPending } = props;
  const { t } = useTranslation();
  const unit = useUnitSystem();

  const [exerciseId, setExerciseId] = useState("");
  const [rows, setRows] = useState<AddRow[]>([emptyAddRow()]);

  const [targetSets, setTargetSets] = useState("");
  const [targetReps, setTargetReps] = useState("");
  const [restSeconds, setRestSeconds] = useState("");
  const [targetDurationSec, setTargetDurationSec] = useState("");

  const exerciseGroups = useMemo(
    () => groupExercisesByMuscleGroup(exercises, t),
    [exercises, t],
  );

  function reset() {
    setExerciseId("");
    setRows([emptyAddRow()]);
    setTargetSets("");
    setTargetReps("");
    setRestSeconds("");
    setTargetDurationSec("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!exerciseId) return;
    if (props.mode === "session") {
      await props.onSubmit(exerciseId, rows);
    } else if (props.mode === "switch") {
      props.onSubmit(exerciseId);
    } else {
      props.onSubmit(exerciseId, {
        targetSets: targetSets ? Number(targetSets) : undefined,
        targetReps: targetReps ? Number(targetReps) : undefined,
        restSeconds: restSeconds ? Number(restSeconds) : undefined,
        targetDurationSec: targetDurationSec
          ? Number(targetDurationSec)
          : undefined,
      });
    }
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent
        title={
          props.mode === "switch"
            ? t("exerciseForm.switchTitle")
            : t("exerciseForm.title")
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>{t("exerciseForm.exercise")}</Label>
            <Select
              value={exerciseId}
              onValueChange={(v) => v && setExerciseId(v)}
            >
              <SelectTrigger className="w-full">
                {exerciseId ? (
                  <span>
                    {t(
                      `exercises.${exercises?.find((ex) => ex.id === exerciseId)?.slug ?? ""}`,
                    )}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    {t("exerciseForm.selectExercise")}
                  </span>
                )}
              </SelectTrigger>
              <SelectContent>
                {exerciseGroups.map((group) => (
                  <SelectGroup key={group.muscleGroup}>
                    <SelectLabel>
                      {t(`muscleGroups.${group.muscleGroup}`)}
                    </SelectLabel>
                    {group.exercises.map((ex) => (
                      <SelectItem key={ex.id} value={ex.id}>
                        {t(`exercises.${ex.slug}`)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {props.mode === "session" &&
            (() => {
              const trackingType =
                exercises?.find((ex) => ex.id === exerciseId)?.tracking_type ??
                "strength";
              const isDuration = trackingType === "duration";
              const colClass = isDuration
                ? "grid-cols-[2rem_1fr_auto]"
                : "grid-cols-[2rem_1fr_1fr_auto]";
              return (
                <div className="space-y-2">
                  <div className={`grid ${colClass} gap-2 items-center`}>
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
                        <span className="text-xs text-muted-foreground">
                          {t("exerciseForm.weight", { unit })}
                        </span>
                      </>
                    )}
                    <span />
                  </div>
                  {rows.map((row, i) => (
                    <div
                      key={i}
                      className={`grid ${colClass} gap-2 items-center`}
                    >
                      <span className="text-xs text-muted-foreground text-right">
                        S{i + 1}
                      </span>
                      {isDuration ? (
                        <Input
                          type="number"
                          min={0}
                          placeholder="60"
                          value={row.duration_min}
                          onChange={(e) =>
                            setRows((r) =>
                              r.map((x, idx) =>
                                idx === i
                                  ? { ...x, duration_min: e.target.value }
                                  : x,
                              ),
                            )
                          }
                        />
                      ) : (
                        <>
                          <Input
                            type="number"
                            min={1}
                            placeholder="10"
                            value={row.reps}
                            onChange={(e) =>
                              setRows((r) =>
                                r.map((x, idx) =>
                                  idx === i
                                    ? { ...x, reps: e.target.value }
                                    : x,
                                ),
                              )
                            }
                          />
                          <Input
                            type="number"
                            min={0}
                            step={0.5}
                            placeholder={unit === "lbs" ? "176" : "80"}
                            value={weightKgToDisplayString(row.weight_kg, unit)}
                            onChange={(e) =>
                              setRows((r) =>
                                r.map((x, idx) =>
                                  idx === i
                                    ? {
                                        ...x,
                                        weight_kg: displayStringToWeightKg(
                                          e.target.value,
                                          unit,
                                        ),
                                      }
                                    : x,
                                ),
                              )
                            }
                          />
                        </>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={rows.length === 1}
                        onClick={() =>
                          setRows((r) => r.filter((_, idx) => idx !== i))
                        }
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setRows((r) => [...r, emptyAddRow()])}
                  >
                    <Plus className="size-3" />
                    {t("exerciseForm.addSet")}
                  </Button>
                </div>
              );
            })()}

          {props.mode === "template" &&
            (() => {
              const trackingType =
                exercises?.find((ex) => ex.id === exerciseId)?.tracking_type ??
                "strength";
              const isDuration = trackingType === "duration";
              return (
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label>{t("exerciseForm.sets")}</Label>
                    <Input
                      type="number"
                      min={1}
                      placeholder="3"
                      value={targetSets}
                      onChange={(e) => setTargetSets(e.target.value)}
                    />
                  </div>
                  {isDuration ? (
                    <div className="space-y-1 col-span-1">
                      <Label>{t("exerciseForm.targetDuration")}</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="60"
                        value={targetDurationSec}
                        onChange={(e) => setTargetDurationSec(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Label>{t("exerciseForm.targetReps")}</Label>
                      <Input
                        type="number"
                        min={1}
                        placeholder="10"
                        value={targetReps}
                        onChange={(e) => setTargetReps(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label>{t("exerciseForm.rest")}</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="90"
                      value={restSeconds}
                      onChange={(e) => setRestSeconds(e.target.value)}
                    />
                  </div>
                </div>
              );
            })()}

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !exerciseId}
          >
            {props.mode === "switch"
              ? t("exerciseForm.switch")
              : t("exerciseForm.add")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
