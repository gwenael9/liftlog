import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SessionSet } from "../session-sets/entities/session-set.entity";
import { WorkoutSession } from "../workout-sessions/entities/workout-session.entity";

export interface ExerciseProgressionPoint {
  date: string;
  max_weight_kg: number;
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
    from?: string,
  ): Promise<ExerciseProgressionPoint[]> {
    const qb = this.setsRepository
      .createQueryBuilder("ss")
      .innerJoin("ss.session", "s")
      .where("s.user_id = :userId", { userId })
      .andWhere("ss.exercise_id = :exerciseId", { exerciseId })
      .andWhere("ss.weight_kg IS NOT NULL");

    if (from) {
      qb.andWhere("s.scheduled_date >= :from", { from });
    }

    const rows = await qb
      .select([
        "DATE(s.scheduled_date) AS date",
        "MAX(ss.weight_kg) AS max_weight_kg",
      ])
      .groupBy("DATE(s.scheduled_date)")
      .orderBy("DATE(s.scheduled_date)", "ASC")
      .getRawMany<{ date: string; max_weight_kg: string }>();

    return rows.map((r) => ({
      date: r.date,
      max_weight_kg: parseFloat(r.max_weight_kg),
    }));
  }

  async getActivityDates(
    userId: string,
  ): Promise<{ date: string; session_id: string }[]> {
    const rows = await this.sessionsRepository
      .createQueryBuilder("s")
      .where("s.user_id = :userId", { userId })
      .andWhere(
        "EXISTS (SELECT 1 FROM session_sets ss WHERE ss.session_id = s.id)",
      )
      .select([
        "s.id AS session_id",
        "TO_CHAR(s.scheduled_date, 'YYYY-MM-DD') AS date",
      ])
      .orderBy("s.scheduled_date", "ASC")
      .getRawMany<{ session_id: string; date: string }>();

    return rows;
  }

  async getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    const rows = await this.setsRepository.query<{
      exercise_id: string;
      exercise_slug: string;
      max_weight_kg: string;
      performed_at: Date | null;
    }[]>(
      `SELECT sub.exercise_id, sub.exercise_slug, sub.max_weight_kg, sub.performed_at
       FROM (
         SELECT DISTINCT ON (ss.exercise_id)
           ss.exercise_id,
           e.slug AS exercise_slug,
           ss.weight_kg AS max_weight_kg,
           s.scheduled_date::timestamp AS performed_at
         FROM session_sets ss
         JOIN workout_sessions s ON ss.session_id = s.id
         JOIN exercises e ON ss.exercise_id = e.id
         WHERE s.user_id = $1
           AND ss.weight_kg IS NOT NULL
         ORDER BY ss.exercise_id, ss.weight_kg DESC, s.scheduled_date ASC
       ) sub
       ORDER BY sub.exercise_slug ASC`,
      [userId],
    );

    return rows.map(r => ({
      exercise_id: r.exercise_id,
      exercise_slug: r.exercise_slug,
      max_weight_kg: parseFloat(r.max_weight_kg),
      performed_at: r.performed_at,
    }));
  }
}
