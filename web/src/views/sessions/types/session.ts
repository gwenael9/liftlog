import type { SetResponseDto } from "@/shared/api/sessions";

export type TrackingType = "strength" | "duration";

// Palier additionnel d'une série dégressive (drop set) : reps + poids d'un
// segment après le premier (le premier segment est porté par reps/weight_kg).
export interface SegmentEditValue {
  reps: string;
  weight_kg: string;
}

export interface SetEditValue {
  reps: string;
  weight_kg: string;
  duration_min: string;
  extraSegments: SegmentEditValue[];
}

export interface AddRow {
  reps: string;
  weight_kg: string;
  duration_min: string;
  extraSegments: SegmentEditValue[];
}

export const emptySegment = (): SegmentEditValue => ({
  reps: "",
  weight_kg: "",
});

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
  duration_min: "",
  extraSegments: [],
});
