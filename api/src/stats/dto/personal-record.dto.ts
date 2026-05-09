import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PersonalRecordDto {
  @ApiProperty({ format: 'uuid' })
  exercise_id: string;

  @ApiProperty()
  exercise_slug: string;

  @ApiProperty()
  max_weight_kg: number;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  performed_at: Date | null;
}
