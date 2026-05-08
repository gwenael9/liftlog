import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TemplateExerciseResponseDto } from './template-exercise-response.dto';

export class TemplateResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  user_id: string;

  @ApiProperty({ example: 'Push Day' })
  name: string;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Estimated duration in minutes' })
  estimated_duration: number | null;

  @ApiProperty({ type: [TemplateExerciseResponseDto] })
  template_exercises: TemplateExerciseResponseDto[];

  @ApiProperty({ format: 'date-time' })
  created_at: Date;
}
