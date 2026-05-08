import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExerciseResponseDto } from '../../exercises/dto/exercise-response.dto';

export class SetResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  session_id: string;

  @ApiProperty({ format: 'uuid' })
  exercise_id: string;

  @ApiProperty({ type: () => ExerciseResponseDto })
  exercise: ExerciseResponseDto;

  @ApiProperty()
  set_index: number;

  @ApiPropertyOptional({ nullable: true })
  reps: number | null;

  @ApiPropertyOptional({ nullable: true })
  weight_kg: number | null;

  @ApiPropertyOptional({ nullable: true })
  duration_sec: number | null;

  @ApiProperty()
  is_warmup: boolean;

  @ApiProperty()
  is_pr: boolean;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  performed_at: Date | null;
}
