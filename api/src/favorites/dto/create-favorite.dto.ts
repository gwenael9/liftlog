import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { EntityType } from '../entities/favorite.entity';

export class CreateFavoriteDto {
  @ApiProperty({ enum: EntityType, example: EntityType.TEMPLATE })
  @IsEnum(EntityType)
  entity_type: EntityType;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  entity_id: string;
}
