import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Sex, UnitSystem, UserRole } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiPropertyOptional({ nullable: true })
  display_name: string | null;

  @ApiProperty({ enum: Sex })
  sex: Sex;

  @ApiProperty({ enum: UnitSystem })
  unit_system: UnitSystem;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ format: 'date-time' })
  created_at: Date;

  @ApiProperty({ format: 'date-time' })
  updated_at: Date;
}
