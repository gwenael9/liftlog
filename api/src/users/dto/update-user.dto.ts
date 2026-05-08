import { IsOptional, IsString, MaxLength, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UnitSystem } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  display_name?: string;

  @ApiPropertyOptional({ enum: UnitSystem })
  @IsOptional()
  @IsEnum(UnitSystem)
  unit_system?: UnitSystem;
}
