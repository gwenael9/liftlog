import { ApiProperty } from '@nestjs/swagger';

export class FrequencyPerWeekDto {
  @ApiProperty({ format: 'date-time' })
  week_start: string;

  @ApiProperty()
  session_count: number;
}
