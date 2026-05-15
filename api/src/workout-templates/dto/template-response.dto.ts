import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TemplateExerciseResponseDto } from './template-exercise-response.dto';

export class TemplateCreatorDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiPropertyOptional({ nullable: true })
  display_name: string | null;

  @ApiProperty()
  email: string;
}

export class TemplateResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  user_id: string;

  @ApiPropertyOptional({ type: TemplateCreatorDto })
  user?: TemplateCreatorDto;

  @ApiProperty({ example: 'Push Day' })
  name: string;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Estimated duration in minutes' })
  estimated_duration: number | null;

  @ApiProperty({ default: false })
  is_public: boolean;

  @ApiProperty({ type: [TemplateExerciseResponseDto] })
  template_exercises: TemplateExerciseResponseDto[];

  @ApiProperty({ format: 'date-time' })
  created_at: Date;
}
