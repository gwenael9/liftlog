import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSessionDto {
  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  started_at?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  ended_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
