import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ExerciseResponseDto } from "../../exercises/dto/exercise-response.dto";

export class TemplateExerciseResponseDto {
  @ApiProperty({ format: "uuid" })
  id: string;

  @ApiProperty({ format: "uuid" })
  exercise_id: string;

  @ApiProperty({ type: () => ExerciseResponseDto })
  exercise: ExerciseResponseDto;

  @ApiProperty()
  order_index: number;

  @ApiPropertyOptional({ nullable: true })
  target_sets: number | null;

  @ApiPropertyOptional({ nullable: true })
  target_reps: number | null;

  @ApiPropertyOptional({ nullable: true })
  rest_seconds: number | null;

  @ApiPropertyOptional({ nullable: true })
  target_duration_min: number | null;
}
