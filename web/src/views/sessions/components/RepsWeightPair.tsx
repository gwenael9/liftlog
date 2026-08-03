import { Input } from "@/shared/components/ui/input";
import {
  weightKgToDisplayString,
  displayStringToWeightKg,
} from "@/shared/utils";

interface Props {
  reps: string;
  weight_kg: string;
  unit: "kg" | "lbs";
  onChangeReps: (value: string) => void;
  onChangeWeight: (value: string) => void;
  isCore?: boolean;
}

export function RepsWeightPair({
  reps,
  weight_kg,
  unit,
  onChangeReps,
  onChangeWeight,
  isCore = false,
}: Props) {
  return (
    <>
      <Input
        type="number"
        min={0}
        placeholder="—"
        value={reps}
        onChange={(e) => onChangeReps(e.target.value)}
      />
      {!isCore && (
        <Input
          type="number"
          min={0}
          step={0.5}
          placeholder="—"
          value={weightKgToDisplayString(weight_kg, unit)}
          onChange={(e) =>
            onChangeWeight(displayStringToWeightKg(e.target.value, unit))
          }
        />
      )}
    </>
  );
}
