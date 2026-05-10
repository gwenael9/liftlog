import { IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { UpdateSetDto } from './update-set.dto';
import { CreateSetDto } from './create-set.dto';

export class UpdateSetItemDto extends UpdateSetDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  id: string;
}

export class BulkUpdateSetsDto {
  @ApiProperty({ type: [UpdateSetItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSetItemDto)
  updates: UpdateSetItemDto[];

  @ApiPropertyOptional({ type: [CreateSetDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSetDto)
  creates: CreateSetDto[];
}
