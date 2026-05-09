import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MuscleGroup, TrackingType } from "../entities/exercise.entity";

export class ExerciseResponseDto {
  @ApiProperty({ format: "uuid" })
  id: string;

  @ApiProperty({ example: "bench_press" })
  slug: string;

  @ApiProperty({ enum: MuscleGroup })
  muscle_group: MuscleGroup;

  @ApiProperty({ enum: TrackingType })
  tracking_type: TrackingType;

  @ApiProperty()
  is_global: boolean;

  @ApiPropertyOptional({ nullable: true })
  notes: string | null;

  @ApiPropertyOptional({ format: "uuid", nullable: true })
  created_by: string | null;

  @ApiProperty({ format: "date-time" })
  created_at: Date;
}
