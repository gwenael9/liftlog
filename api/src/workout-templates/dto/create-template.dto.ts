import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  ValidateNested,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TemplateExerciseItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  exercise_id: string;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  order_index: number;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  target_sets?: number;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  target_reps?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  rest_seconds?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  target_duration_sec?: number;
}

export class CreateTemplateDto {
  @ApiProperty({ example: 'Push Day', maxLength: 150 })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ minimum: 1, description: 'Estimated duration in minutes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimated_duration?: number;

  @ApiPropertyOptional({ type: [TemplateExerciseItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateExerciseItemDto)
  exercises?: TemplateExerciseItemDto[];
}
