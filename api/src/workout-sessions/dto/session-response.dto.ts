import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SetResponseDto } from '../../session-sets/dto/set-response.dto';

export class SessionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  user_id: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  template_id: string | null;

  @ApiProperty({ example: '2026-05-08' })
  scheduled_date: string;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  started_at: Date | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  ended_at: Date | null;

  @ApiPropertyOptional({ nullable: true })
  notes: string | null;

  @ApiProperty({ type: [SetResponseDto] })
  session_sets: SetResponseDto[];
}
