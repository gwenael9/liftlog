import { ApiProperty } from '@nestjs/swagger';

export class VolumePerWeekDto {
  @ApiProperty({ format: 'date-time' })
  week_start: string;

  @ApiProperty()
  total_volume_kg: number;
}
