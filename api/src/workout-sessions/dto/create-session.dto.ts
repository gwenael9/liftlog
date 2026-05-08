import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SessionStatus } from '../entities/workout-session.entity';

export class CreateSessionDto {
  @ApiProperty({ example: '2026-05-08', pattern: '^\\d{4}-\\d{2}-\\d{2}$' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'scheduled_date must be a valid date in YYYY-MM-DD format' })
  scheduled_date: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  template_id?: string;

  @ApiPropertyOptional({ enum: SessionStatus, default: SessionStatus.PLANNED })
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;
}
