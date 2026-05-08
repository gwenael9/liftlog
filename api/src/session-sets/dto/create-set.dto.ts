import {
  IsUUID,
  IsInt,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSetDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  exercise_id: string;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  set_index: number;

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

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_warmup?: boolean;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  performed_at?: string;
}
