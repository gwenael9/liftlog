import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SessionStatus } from '../entities/workout-session.entity';

export class UpdateSessionDto {
  @ApiPropertyOptional({ enum: SessionStatus })
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

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
