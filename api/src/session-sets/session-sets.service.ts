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
      exercise_order: dto.exercise_order ?? 0,
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

  async bulkUpdate(sessionId: string, dto: BulkUpdateSetsDto, userId: string): Promise<SessionSet[]> {
    await this.getSessionOrThrow(sessionId, userId);

    const updateIds = dto.updates.map(u => u.id);

    // Load all sets being updated in one query
    const existingSets = updateIds.length > 0
      ? await this.setsRepository.find({ where: { id: In(updateIds), session_id: sessionId } })
      : [];

    if (existingSets.length !== updateIds.length) {
      throw new NotFoundException('One or more sets not found');
    }

    const existingMap = new Map(existingSets.map(s => [s.id, s]));

    // Build the post-update state for each set (apply patches in memory)
    const updatedStates = dto.updates.map(item => {
      const set = existingMap.get(item.id)!;
      return {
        id: item.id,
        exercise_id: set.exercise_id,
        weight_kg: item.weight_kg ?? set.weight_kg,
        reps: item.reps ?? set.reps,
        is_warmup: item.is_warmup ?? set.is_warmup,
      };
    });

    const creates = dto.creates ?? [];

    // Gather all exercise IDs involved
    const exerciseIds = new Set([
      ...updatedStates.map(s => s.exercise_id),
      ...creates.map(c => c.exercise_id),
    ]);

    // For each exercise, get the historical max weight EXCLUDING all sets in this batch
    const priorMaxByExercise = new Map<string, number>();
    for (const exId of exerciseIds) {
      const qb = this.setsRepository
        .createQueryBuilder('ss')
        .innerJoin('ss.session', 's')
        .where('s.user_id = :userId', { userId })
        .andWhere('ss.exercise_id = :exId', { exId })
        .andWhere('ss.is_warmup = false')
        .andWhere('ss.weight_kg IS NOT NULL')
        .andWhere('ss.reps IS NOT NULL')
        .select('MAX(ss.weight_kg)', 'maxWeight');

      if (updateIds.length > 0) {
        qb.andWhere('ss.id NOT IN (:...updateIds)', { updateIds });
      }

      const result = await qb.getRawOne<{ maxWeight: string | null }>();
      priorMaxByExercise.set(exId, result?.maxWeight ? parseFloat(result.maxWeight) : 0);
    }

    // Compute the best (max) weight per exercise across this entire batch
    const batchMaxByExercise = new Map<string, number>();
    for (const s of updatedStates) {
      if (!s.is_warmup && s.weight_kg != null && s.reps != null) {
        const curr = batchMaxByExercise.get(s.exercise_id) ?? 0;
        if (s.weight_kg > curr) batchMaxByExercise.set(s.exercise_id, s.weight_kg);
      }
    }
    for (const c of creates) {
      if (!(c.is_warmup ?? false) && c.weight_kg != null && c.reps != null) {
        const curr = batchMaxByExercise.get(c.exercise_id) ?? 0;
        if (c.weight_kg > curr) batchMaxByExercise.set(c.exercise_id, c.weight_kg);
      }
    }

    const isPrForWeight = (exerciseId: string, weight: number | null, reps: number | null, warmup: boolean): boolean => {
      if (warmup || weight == null || reps == null) return false;
      const priorMax = priorMaxByExercise.get(exerciseId) ?? 0;
      const batchMax = batchMaxByExercise.get(exerciseId) ?? 0;
      return weight > priorMax && weight >= batchMax;
    };

    const results: SessionSet[] = [];

    for (const item of dto.updates) {
      const set = existingMap.get(item.id)!;
      if (item.set_index !== undefined) set.set_index = item.set_index;
      if (item.reps !== undefined) set.reps = item.reps;
      if (item.weight_kg !== undefined) set.weight_kg = item.weight_kg;
      if (item.duration_sec !== undefined) set.duration_sec = item.duration_sec;
      if (item.is_warmup !== undefined) set.is_warmup = item.is_warmup;
      if (item.performed_at !== undefined) set.performed_at = new Date(item.performed_at);

      set.is_pr = isPrForWeight(set.exercise_id, set.weight_kg, set.reps, set.is_warmup);
      results.push(await this.setsRepository.save(set));
    }

    for (const createDto of creates) {
      const isPr = isPrForWeight(
        createDto.exercise_id,
        createDto.weight_kg ?? null,
        createDto.reps ?? null,
        createDto.is_warmup ?? false,
      );

      const set = this.setsRepository.create({
        session_id: sessionId,
        exercise_id: createDto.exercise_id,
        set_index: createDto.set_index,
        exercise_order: createDto.exercise_order ?? 0,
        reps: createDto.reps ?? null,
        weight_kg: createDto.weight_kg ?? null,
        duration_sec: createDto.duration_sec ?? null,
        is_warmup: createDto.is_warmup ?? false,
        is_pr: isPr,
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
