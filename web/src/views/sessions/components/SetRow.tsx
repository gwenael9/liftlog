import { Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { RepsWeightPair } from "@/views/sessions/components/RepsWeightPair";
import { ExtraSegmentsEditor } from "@/views/sessions/components/ExtraSegmentsEditor";
import type { SetEditValue, AddRow } from "@/views/sessions/types/session";
import { useTranslation } from "react-i18next";

interface Props {
  label: string;
  colClass: string;
  isDuration: boolean;
  unit: "kg" | "lbs";
  values: SetEditValue | AddRow;
  isPr?: boolean;
  onPatch: (patch: Partial<SetEditValue>) => void;
  onDelete: () => void;
  isCore?: boolean;
}

export function SetRow({
  label,
  colClass,
  isDuration,
  unit,
  values,
  isPr,
  onPatch,
  onDelete,
  isCore = false,
}: Props) {
  const { t } = useTranslation();

  return (
    <div>
      <div className={`grid ${colClass} gap-2 items-center`}>
        <span className="text-xs text-muted-foreground text-right">
          {label}
        </span>
        {isDuration ? (
          <Input
            type="number"
            min={0}
            placeholder="—"
            value={values.duration_sec}
            onChange={(e) => onPatch({ duration_sec: e.target.value })}
          />
        ) : (
          <RepsWeightPair
            reps={values.reps}
            weight_kg={values.weight_kg}
            unit={unit}
            onChangeReps={(value) => onPatch({ reps: value })}
            onChangeWeight={(value) => onPatch({ weight_kg: value })}
            isCore={isCore}
          />
        )}
        <div className="flex items-center gap-1">
          {isPr && (
            <span className="text-xs text-yellow-500 font-semibold">
              {t("exerciseForm.pr")}
            </span>
          )}
          <Button variant="ghost" size="icon-sm" onClick={onDelete}>
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>
      {!isDuration && !isCore && (
        <ExtraSegmentsEditor
          segments={values.extraSegments}
          colClass={colClass}
          unit={unit}
          onPatch={onPatch}
        />
      )}
    </div>
  );
}
