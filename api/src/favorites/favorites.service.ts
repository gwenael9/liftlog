import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite, EntityType } from './entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoritesRepository: Repository<Favorite>,
  ) {}

  async add(dto: CreateFavoriteDto, userId: string): Promise<Favorite> {
    const existing = await this.favoritesRepository.findOne({
      where: { user_id: userId, entity_type: dto.entity_type, entity_id: dto.entity_id },
    });
    if (existing) throw new ConflictException('Already in favorites');

    const favorite = this.favoritesRepository.create({
      user_id: userId,
      entity_type: dto.entity_type,
      entity_id: dto.entity_id,
    });
    return this.favoritesRepository.save(favorite);
  }

  async remove(entityType: EntityType, entityId: string, userId: string): Promise<void> {
    const favorite = await this.favoritesRepository.findOne({
      where: { user_id: userId, entity_type: entityType, entity_id: entityId },
    });
    if (!favorite) throw new NotFoundException('Favorite not found');
    await this.favoritesRepository.remove(favorite);
  }

  async findByType(entityType: EntityType, userId: string): Promise<string[]> {
    const favorites = await this.favoritesRepository.find({
      where: { user_id: userId, entity_type: entityType },
      order: { created_at: 'ASC' },
    });
    return favorites.map((f) => f.entity_id);
  }

  async isFavorite(entityType: EntityType, entityId: string, userId: string): Promise<boolean> {
    const count = await this.favoritesRepository.count({
      where: { user_id: userId, entity_type: entityType, entity_id: entityId },
    });
    return count > 0;
  }
}
