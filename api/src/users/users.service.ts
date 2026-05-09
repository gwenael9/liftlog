import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (dto.display_name !== undefined) {
      user.display_name = dto.display_name;
    }
    if (dto.unit_system !== undefined) {
      user.unit_system = dto.unit_system;
    }
    return this.usersRepository.save(user);
  }

  async updateRefreshTokenHash(id: string, hash: string | null): Promise<void> {
    await this.usersRepository.update(id, { refresh_token_hash: hash });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { created_at: 'DESC' } });
  }

  async getMe(id: string): Promise<Omit<User, 'password_hash' | 'refresh_token_hash'>> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password_hash, refresh_token_hash, ...result } = user;
    return result;
  }
}
