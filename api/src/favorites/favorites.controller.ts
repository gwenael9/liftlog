import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  ParseEnumPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { EntityType } from './entities/favorite.entity';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  add(@Body() dto: CreateFavoriteDto, @CurrentUser() user: { id: string }) {
    return this.favoritesService.add(dto, user.id);
  }

  @Delete(':entity_type/:entity_id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('entity_type', new ParseEnumPipe(EntityType)) entityType: EntityType,
    @Param('entity_id') entityId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.favoritesService.remove(entityType, entityId, user.id);
  }

  @Get(':entity_type')
  @ApiResponse({ status: 200, type: [String] })
  findByType(
    @Param('entity_type', new ParseEnumPipe(EntityType)) entityType: EntityType,
    @CurrentUser() user: { id: string },
  ) {
    return this.favoritesService.findByType(entityType, user.id);
  }
}
