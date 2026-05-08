import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MuscleGroup } from '../entities/exercise.entity';

export class UpdateExerciseDto {
  @ApiPropertyOptional({ example: 'Bench Press', maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ enum: MuscleGroup })
  @IsOptional()
  @IsEnum(MuscleGroup)
  muscle_group?: MuscleGroup;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_global?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
