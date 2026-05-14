import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionSet } from '../session-sets/entities/session-set.entity';
import { WorkoutSession } from '../workout-sessions/entities/workout-session.entity';

export interface ExerciseProgressionPoint {
  date: string;
  max_weight_kg: number;
}

export interface VolumePerWeek {
  week_start: string;
  total_volume_kg: number;
}

export interface PersonalRecord {
  exercise_id: string;
  exercise_slug: string;
  max_weight_kg: number;
  performed_at: Date | null;
}

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(SessionSet)
    private readonly setsRepository: Repository<SessionSet>,
    @InjectRepository(WorkoutSession)
    private readonly sessionsRepository: Repository<WorkoutSession>,
  ) {}

  async getExerciseProgression(
    exerciseId: string,
    userId: string,
  ): Promise<ExerciseProgressionPoint[]> {
    const rows = await this.setsRepository
      .createQueryBuilder('ss')
      .innerJoin('ss.session', 's')
      .where('s.user_id = :userId', { userId })
      .andWhere('ss.exercise_id = :exerciseId', { exerciseId })
      .andWhere('ss.weight_kg IS NOT NULL')
      .andWhere('ss.is_warmup = false')
      .select([
        "DATE(ss.performed_at) AS date",
        'MAX(ss.weight_kg) AS max_weight_kg',
      ])
      .groupBy("DATE(ss.performed_at)")
      .orderBy("DATE(ss.performed_at)", 'ASC')
      .getRawMany<{ date: string; max_weight_kg: string }>();

    return rows.map((r) => ({
      date: r.date,
      max_weight_kg: parseFloat(r.max_weight_kg),
    }));
  }

  async getVolumePerWeek(userId: string, weeks: number = 12): Promise<VolumePerWeek[]> {
    const rows = await this.setsRepository
      .createQueryBuilder('ss')
      .innerJoin('ss.session', 's')
      .where('s.user_id = :userId', { userId })
      .andWhere('ss.weight_kg IS NOT NULL')
      .andWhere('ss.reps IS NOT NULL')
      .andWhere('ss.performed_at >= :since', {
        since: new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000),
      })
      .select([
        "DATE_TRUNC('week', ss.performed_at) AS week_start",
        'SUM(ss.weight_kg * ss.reps) AS total_volume_kg',
      ])
      .groupBy("DATE_TRUNC('week', ss.performed_at)")
      .orderBy("DATE_TRUNC('week', ss.performed_at)", 'ASC')
      .getRawMany<{ week_start: string; total_volume_kg: string }>();

    return rows.map((r) => ({
      week_start: r.week_start,
      total_volume_kg: parseFloat(r.total_volume_kg),
    }));
  }

  async getActivityDates(userId: string): Promise<{ date: string; session_id: string }[]> {
    const rows = await this.sessionsRepository
      .createQueryBuilder('s')
      .where('s.user_id = :userId', { userId })
      .andWhere(
        'EXISTS (SELECT 1 FROM session_sets ss WHERE ss.session_id = s.id)',
      )
      .select([
        's.id AS session_id',
        "TO_CHAR(s.scheduled_date, 'YYYY-MM-DD') AS date",
      ])
      .orderBy('s.scheduled_date', 'ASC')
      .getRawMany<{ session_id: string; date: string }>();

    return rows;
  }

  async getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    const rows = await this.setsRepository
      .createQueryBuilder('ss')
      .innerJoin('ss.session', 's')
      .innerJoin('ss.exercise', 'e')
      .where('s.user_id = :userId', { userId })
      .andWhere('ss.is_pr = true')
      .andWhere('ss.is_warmup = false')
      .select([
        'ss.exercise_id AS exercise_id',
        'e.slug AS exercise_slug',
        'MAX(ss.weight_kg) AS max_weight_kg',
        'COALESCE(MAX(ss.performed_at), MAX(s.scheduled_date::timestamp)) AS performed_at',
      ])
      .groupBy('ss.exercise_id, e.slug')
      .orderBy('e.slug', 'ASC')
      .getRawMany<{
        exercise_id: string;
        exercise_slug: string;
        max_weight_kg: string;
        performed_at: Date | null;
      }>();

    return rows.map((r: { exercise_id: string; exercise_slug: string; max_weight_kg: string; performed_at: Date | null }) => ({
      exercise_id: r.exercise_id,
      exercise_slug: r.exercise_slug,
      max_weight_kg: parseFloat(r.max_weight_kg),
      performed_at: r.performed_at,
    }));
  }
}
