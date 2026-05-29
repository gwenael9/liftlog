import { IsOptional, IsString, MaxLength, IsEnum, IsHexColor, ValidateNested, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UnitSystem } from '../entities/user.entity';

export class UpdateUserPreferencesDto {
  @ApiPropertyOptional({ example: 'fr' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ example: 'dark' })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiPropertyOptional({ example: '#3b82f6' })
  @IsOptional()
  @IsHexColor()
  couleur_primary?: string;
}

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

  @ApiPropertyOptional({ type: UpdateUserPreferencesDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateUserPreferencesDto)
  preferences?: UpdateUserPreferencesDto;
}
