import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MuscleGroup, TrackingType } from '../entities/exercise.entity';

export class CreateExerciseDto {
  @ApiProperty({ example: 'Bench Press', maxLength: 150 })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiProperty({ enum: MuscleGroup })
  @IsEnum(MuscleGroup)
  muscle_group: MuscleGroup;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_global?: boolean;

  @ApiPropertyOptional({ enum: TrackingType, default: 'strength' })
  @IsOptional()
  @IsEnum(TrackingType)
  tracking_type?: TrackingType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
