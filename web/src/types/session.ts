import type { SetResponseDto } from "@/api/sessions";

export type TrackingType = "strength" | "duration";

export interface SetEditValue {
  reps: string;
  weight_kg: string;
  duration_sec: string;
  is_warmup: boolean;
}

export interface AddRow {
  reps: string;
  weight_kg: string;
  duration_sec: string;
  is_warmup: boolean;
}

export interface ExerciseGroup {
  exerciseId: string;
  exerciseSlug: string;
  trackingType: TrackingType;
  exerciseOrder: number;
  sets: SetResponseDto[];
}

export const emptyAddRow = (): AddRow => ({
  reps: "",
  weight_kg: "",
  duration_sec: "",
  is_warmup: false,
});
