import type { ExerciseResponseDto } from '@/shared/api/exercises'

export interface ExerciseGroup {
  muscleGroup: ExerciseResponseDto['muscle_group']
  exercises: ExerciseResponseDto[]
}

export function groupExercisesByMuscleGroup(
  exercises: ExerciseResponseDto[] | undefined,
  t: (key: string) => string,
): ExerciseGroup[] {
  if (!exercises) return []

  const groups = new Map<ExerciseResponseDto['muscle_group'], ExerciseResponseDto[]>()
  for (const ex of exercises) {
    const list = groups.get(ex.muscle_group)
    if (list) list.push(ex)
    else groups.set(ex.muscle_group, [ex])
  }

  return [...groups.entries()]
    .map(([muscleGroup, list]) => ({
      muscleGroup,
      exercises: list.sort((a, b) => t(`exercises.${a.slug}`).localeCompare(t(`exercises.${b.slug}`))),
    }))
    .sort((a, b) => t(`muscleGroups.${a.muscleGroup}`).localeCompare(t(`muscleGroups.${b.muscleGroup}`)))
}
