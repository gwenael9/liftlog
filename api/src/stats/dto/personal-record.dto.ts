import { MuscleGroup } from "@exercises/entities/exercise.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PersonalRecordDto {
  @ApiProperty({ format: "uuid" })
  exercise_id: string;

  @ApiProperty()
  exercise_slug: string;

  @ApiProperty()
  max_weight_kg: number;

  @ApiProperty()
  muscle_group: MuscleGroup;

  @ApiPropertyOptional({ format: "date-time", nullable: true })
  performed_at: Date | null;
}
