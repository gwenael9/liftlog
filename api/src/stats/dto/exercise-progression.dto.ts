import { ApiProperty } from '@nestjs/swagger';

export class ExerciseProgressionPointDto {
  @ApiProperty({ example: '2026-05-08' })
  date: string;

  @ApiProperty()
  max_weight_kg: number;
}
