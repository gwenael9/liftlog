import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionSet } from './entities/session-set.entity';
import { WorkoutSession } from '../workout-sessions/entities/workout-session.entity';
import { CreateSetDto } from './dto/create-set.dto';
import { UpdateSetDto } from './dto/update-set.dto';

@Injectable()
export class SessionSetsService {
  constructor(
    @InjectRepository(SessionSet)
    private readonly setsRepository: Repository<SessionSet>,
    @InjectRepository(WorkoutSession)
    private readonly sessionsRepository: Repository<WorkoutSession>,
  ) {}

  private async getSessionOrThrow(sessionId: string, userId: string): Promise<WorkoutSession> {
    const session = await this.sessionsRepository.findOne({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    if (session.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return session;
  }

  private async checkPersonalRecord(
    exerciseId: string,
    userId: string,
    weightKg: number,
    reps: number,
  ): Promise<boolean> {
    // Find max weight * reps ever recorded for this user+exercise (excluding warmups)
    const result = await this.setsRepository
      .createQueryBuilder('ss')
      .innerJoin('ss.session', 's')
      .where('s.user_id = :userId', { userId })
      .andWhere('ss.exercise_id = :exerciseId', { exerciseId })
      .andWhere('ss.is_warmup = false')
      .andWhere('ss.weight_kg IS NOT NULL')
      .andWhere('ss.reps IS NOT NULL')
      .select('MAX(ss.weight_kg)', 'maxWeight')
      .getRawOne<{ maxWeight: string | null }>();

    if (!result || result.maxWeight === null) {
      return true; // First recorded set is always a PR
    }

    const previousMax = parseFloat(result.maxWeight);
    return weightKg > previousMax;
  }

  async create(sessionId: string, dto: CreateSetDto, userId: string): Promise<SessionSet> {
    await this.getSessionOrThrow(sessionId, userId);

    let isPr = false;
    if (
      dto.weight_kg !== undefined &&
      dto.weight_kg !== null &&
      dto.reps !== undefined &&
      dto.reps !== null &&
      !dto.is_warmup
    ) {
      isPr = await this.checkPersonalRecord(dto.exercise_id, userId, dto.weight_kg, dto.reps);
    }

    const set = this.setsRepository.create({
      session_id: sessionId,
      exercise_id: dto.exercise_id,
      set_index: dto.set_index,
      reps: dto.reps ?? null,
      weight_kg: dto.weight_kg ?? null,
      duration_sec: dto.duration_sec ?? null,
      is_warmup: dto.is_warmup ?? false,
      is_pr: isPr,
      performed_at: dto.performed_at ? new Date(dto.performed_at) : null,
    });

    return this.setsRepository.save(set);
  }

  async update(
    sessionId: string,
    id: string,
    dto: UpdateSetDto,
    userId: string,
  ): Promise<SessionSet> {
    await this.getSessionOrThrow(sessionId, userId);

    const set = await this.setsRepository.findOne({
      where: { id, session_id: sessionId },
    });
    if (!set) {
      throw new NotFoundException('Set not found');
    }

    if (dto.set_index !== undefined) set.set_index = dto.set_index;
    if (dto.reps !== undefined) set.reps = dto.reps;
    if (dto.weight_kg !== undefined) set.weight_kg = dto.weight_kg;
    if (dto.duration_sec !== undefined) set.duration_sec = dto.duration_sec;
    if (dto.is_warmup !== undefined) set.is_warmup = dto.is_warmup;
    if (dto.performed_at !== undefined) set.performed_at = new Date(dto.performed_at);

    // Re-check PR if weight/reps updated and not warmup
    if (
      (dto.weight_kg !== undefined || dto.reps !== undefined) &&
      set.weight_kg !== null &&
      set.reps !== null &&
      !set.is_warmup
    ) {
      set.is_pr = await this.checkPersonalRecord(
        set.exercise_id,
        userId,
        set.weight_kg,
        set.reps,
      );
    }

    return this.setsRepository.save(set);
  }

  async remove(sessionId: string, id: string, userId: string): Promise<void> {
    await this.getSessionOrThrow(sessionId, userId);

    const set = await this.setsRepository.findOne({
      where: { id, session_id: sessionId },
    });
    if (!set) {
      throw new NotFoundException('Set not found');
    }
    await this.setsRepository.remove(set);
  }
}
