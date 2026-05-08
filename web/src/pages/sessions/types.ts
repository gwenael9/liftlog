import type { SetResponseDto } from '@/api/sessions'

export interface SetEditValue {
  reps: string
  weight_kg: string
  is_warmup: boolean
}

export interface AddRow {
  reps: string
  weight_kg: string
  is_warmup: boolean
}

export interface ExerciseGroup {
  exerciseId: string
  exerciseName: string
  sets: SetResponseDto[]
}

export const emptyAddRow = (): AddRow => ({ reps: '', weight_kg: '', is_warmup: false })
