import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { RepsWeightPair } from "@/views/sessions/components/RepsWeightPair";
import type { SegmentEditValue } from "@/views/sessions/types/session";
import { emptySegment } from "@/views/sessions/types/session";
import { useTranslation } from "react-i18next";

interface Props {
  segments: SegmentEditValue[];
  colClass: string;
  unit: "kg" | "lbs";
  onPatch: (patch: { extraSegments: SegmentEditValue[] }) => void;
}

// Paliers d'une série dégressive : chaque palier additionnel a ses propres
// reps/poids, affichés en retrait sous la ligne principale de la série.
export function ExtraSegmentsEditor({ segments, colClass, unit, onPatch }: Props) {
  const { t } = useTranslation();

  return (
    <div className="mt-2 space-y-2">
      {segments.map((seg, i) => (
        <div key={i} className={`grid ${colClass} gap-2 items-center pl-4`}>
          <span className="text-xs text-muted-foreground text-right">↳</span>
          <RepsWeightPair
            reps={seg.reps}
            weight_kg={seg.weight_kg}
            unit={unit}
            onChangeReps={(value) =>
              onPatch({
                extraSegments: segments.map((s, idx) => (idx === i ? { ...s, reps: value } : s)),
              })
            }
            onChangeWeight={(value) =>
              onPatch({
                extraSegments: segments.map((s, idx) =>
                  idx === i ? { ...s, weight_kg: value } : s,
                ),
              })
            }
          />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("exerciseForm.removeSegment")}
            onClick={() => onPatch({ extraSegments: segments.filter((_, idx) => idx !== i) })}
          >
            <X className="size-3" />
          </Button>
        </div>
      ))}
      <div className={`grid ${colClass} gap-2 items-center pl-4`}>
        <span />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-fit justify-start px-2 text-xs text-muted-foreground"
          aria-label={t("exerciseForm.addSegmentLong")}
          onClick={() => onPatch({ extraSegments: [...segments, emptySegment()] })}
        >
          {t("exerciseForm.addSegment")}
        </Button>
      </div>
    </div>
  );
}
