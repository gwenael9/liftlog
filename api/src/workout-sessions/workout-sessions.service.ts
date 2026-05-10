import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { WorkoutSession } from './entities/workout-session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class WorkoutSessionsService {
  constructor(
    @InjectRepository(WorkoutSession)
    private readonly sessionsRepository: Repository<WorkoutSession>,
  ) {}

  async findAll(userId: string, month?: string): Promise<WorkoutSession[]> {
    const where: FindOptionsWhere<WorkoutSession> = { user_id: userId };

    if (month) {
      const [year, mon] = month.split('-');
      const lastDay = new Date(parseInt(year), parseInt(mon), 0).getDate();
      where.scheduled_date = Between(
        `${year}-${mon}-01`,
        `${year}-${mon}-${String(lastDay).padStart(2, '0')}`,
      );
    }

    return this.sessionsRepository.find({
      where,
      order: { scheduled_date: 'ASC' },
      relations: ['session_sets', 'session_sets.exercise'],
    });
  }

  async findOne(id: string, userId: string): Promise<WorkoutSession> {
    const session = await this.sessionsRepository.findOne({
      where: { id },
      relations: ['session_sets', 'session_sets.exercise'],
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    if (session.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }
    if (session.session_sets) {
      session.session_sets.sort((a, b) => a.set_index - b.set_index);
    }
    return session;
  }

  async create(dto: CreateSessionDto, userId: string): Promise<WorkoutSession> {
    const session = this.sessionsRepository.create({
      user_id: userId,
      scheduled_date: dto.scheduled_date,
      template_id: dto.template_id ?? null,
    });
    return this.sessionsRepository.save(session);
  }

  async update(id: string, dto: UpdateSessionDto, userId: string): Promise<WorkoutSession> {
    const session = await this.sessionsRepository.findOne({ where: { id } });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    if (session.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (dto.started_at !== undefined) session.started_at = new Date(dto.started_at);
    if (dto.ended_at !== undefined) session.ended_at = new Date(dto.ended_at);
    if (dto.notes !== undefined) session.notes = dto.notes;

    return this.sessionsRepository.save(session);
  }

  async remove(id: string, userId: string): Promise<void> {
    const session = await this.sessionsRepository.findOne({ where: { id } });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    if (session.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }
    await this.sessionsRepository.remove(session);
  }
}
