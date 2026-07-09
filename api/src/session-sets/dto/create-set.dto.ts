import {
  IsUUID,
  IsInt,
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SetSegmentDto } from './set-segment.dto';

export class CreateSetDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  exercise_id: string;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  set_index: number;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  exercise_order?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  reps?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  weight_kg?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration_sec?: number;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  performed_at?: string;

  @ApiPropertyOptional({ type: [SetSegmentDto], description: 'Segments successifs (drop set)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetSegmentDto)
  segments?: SetSegmentDto[];
}
