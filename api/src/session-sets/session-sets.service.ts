import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { SessionSet } from './entities/session-set.entity';
import { WorkoutSession } from '../workout-sessions/entities/workout-session.entity';
import { CreateSetDto } from './dto/create-set.dto';
import { UpdateSetDto } from './dto/update-set.dto';
import { BulkUpdateSetsDto } from './dto/bulk-update-sets.dto';

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

  async create(sessionId: string, dto: CreateSetDto, userId: string): Promise<SessionSet> {
    await this.getSessionOrThrow(sessionId, userId);

    const set = this.setsRepository.create({
      session_id: sessionId,
      exercise_id: dto.exercise_id,
      set_index: dto.set_index,
      exercise_order: dto.exercise_order ?? 0,
      reps: dto.reps ?? null,
      weight_kg: dto.weight_kg ?? null,
      duration_sec: dto.duration_sec ?? null,
      segments: dto.segments ?? null,
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
    if (dto.segments !== undefined) set.segments = dto.segments;
    if (dto.performed_at !== undefined) set.performed_at = new Date(dto.performed_at);

    return this.setsRepository.save(set);
  }

  async bulkUpdate(sessionId: string, dto: BulkUpdateSetsDto, userId: string): Promise<SessionSet[]> {
    await this.getSessionOrThrow(sessionId, userId);

    const updateIds = dto.updates.map(u => u.id);

    const existingSets = updateIds.length > 0
      ? await this.setsRepository.find({ where: { id: In(updateIds), session_id: sessionId } })
      : [];

    if (existingSets.length !== updateIds.length) {
      throw new NotFoundException('One or more sets not found');
    }

    const existingMap = new Map(existingSets.map(s => [s.id, s]));
    const results: SessionSet[] = [];

    for (const item of dto.updates) {
      const set = existingMap.get(item.id)!;
      if (item.set_index !== undefined) set.set_index = item.set_index;
      if (item.exercise_order !== undefined) set.exercise_order = item.exercise_order;
      if (item.reps !== undefined) set.reps = item.reps;
      if (item.weight_kg !== undefined) set.weight_kg = item.weight_kg;
      if (item.duration_sec !== undefined) set.duration_sec = item.duration_sec;
      if (item.segments !== undefined) set.segments = item.segments;
      if (item.performed_at !== undefined) set.performed_at = new Date(item.performed_at);

      results.push(await this.setsRepository.save(set));
    }

    for (const createDto of dto.creates ?? []) {
      const set = this.setsRepository.create({
        session_id: sessionId,
        exercise_id: createDto.exercise_id,
        set_index: createDto.set_index,
        exercise_order: createDto.exercise_order ?? 0,
        reps: createDto.reps ?? null,
        weight_kg: createDto.weight_kg ?? null,
        duration_sec: createDto.duration_sec ?? null,
        segments: createDto.segments ?? null,
        performed_at: createDto.performed_at ? new Date(createDto.performed_at) : null,
      });
      results.push(await this.setsRepository.save(set));
    }

    return results;
  }

  async remove(sessionId: string, id: string, userId: string): Promise<void> {
    await this.getSessionOrThrow(sessionId, userId);

    const set = await this.setsRepository.findOne({
      where: { id, session_id: sessionId },
    });
    if (!set) {
      throw new NotFoundException('Set not found');
    }

    const deletedIndex = set.set_index;
    const deletedExerciseId = set.exercise_id;

    await this.setsRepository.remove(set);

    const remaining = await this.setsRepository.find({
      where: { session_id: sessionId, exercise_id: deletedExerciseId },
      order: { set_index: 'ASC' },
    });

    const toUpdate = remaining.filter(s => s.set_index > deletedIndex);
    for (const s of toUpdate) {
      s.set_index -= 1;
    }
    if (toUpdate.length > 0) {
      await this.setsRepository.save(toUpdate);
    }
  }
}
