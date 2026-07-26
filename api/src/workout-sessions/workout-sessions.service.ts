import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, FindOptionsWhere, Not } from "typeorm";
import { WorkoutSession } from "./entities/workout-session.entity";
import { CreateSessionDto } from "./dto/create-session.dto";
import { UpdateSessionDto } from "./dto/update-session.dto";

@Injectable()
export class WorkoutSessionsService {
  constructor(
    @InjectRepository(WorkoutSession)
    private readonly sessionsRepository: Repository<WorkoutSession>,
  ) {}

  async findAll(userId: string, month?: string): Promise<WorkoutSession[]> {
    const where: FindOptionsWhere<WorkoutSession> = { user_id: userId };

    if (month) {
      const [year, mon] = month.split("-");
      const lastDay = new Date(parseInt(year), parseInt(mon), 0).getDate();
      where.scheduled_date = Between(
        `${year}-${mon}-01`,
        `${year}-${mon}-${String(lastDay).padStart(2, "0")}`,
      );
    }

    return this.sessionsRepository.find({
      where,
      order: { scheduled_date: "ASC" },
      relations: ["session_sets"],
    });
  }

  async findOne(id: string, userId: string): Promise<WorkoutSession> {
    const session = await this.sessionsRepository.findOne({
      where: { id },
      relations: ["session_sets", "session_sets.exercise"],
    });
    if (!session) {
      throw new NotFoundException("Session not found");
    }
    if (session.user_id !== userId) {
      throw new ForbiddenException("Access denied");
    }
    if (session.session_sets) {
      session.session_sets.sort((a, b) =>
        a.exercise_order !== b.exercise_order
          ? a.exercise_order - b.exercise_order
          : a.set_index - b.set_index,
      );

      const prRows = await this.sessionsRepository.query<
        {
          exercise_id: string;
          max_weight: string;
          pr_session_id: string;
          pr_set_index: string;
        }[]
      >(
        `SELECT DISTINCT ON (ss.exercise_id)
           ss.exercise_id,
           ss.weight_kg AS max_weight,
           ss.session_id AS pr_session_id,
           ss.set_index AS pr_set_index
         FROM session_sets ss
         JOIN workout_sessions s ON ss.session_id = s.id
         WHERE s.user_id = $1
           AND ss.weight_kg IS NOT NULL
         ORDER BY ss.exercise_id,
                  ss.weight_kg DESC,
                  s.scheduled_date ASC,
                  ss.set_index ASC`,
        [userId],
      );
      const prByExercise = new Map(
        prRows.map((r) => [
          r.exercise_id,
          {
            pr_session_id: r.pr_session_id,
            pr_set_index: parseInt(r.pr_set_index, 10),
          },
        ]),
      );

      for (const set of session.session_sets) {
        const pr = prByExercise.get(set.exercise_id);
        set.is_pr =
          pr != null &&
          set.session_id === pr.pr_session_id &&
          set.set_index === pr.pr_set_index;
      }
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

  async update(
    id: string,
    dto: UpdateSessionDto,
    userId: string,
  ): Promise<WorkoutSession> {
    const session = await this.sessionsRepository.findOne({ where: { id } });
    if (!session) {
      throw new NotFoundException("Session not found");
    }
    if (session.user_id !== userId) {
      throw new ForbiddenException("Access denied");
    }

    if (dto.started_at !== undefined)
      session.started_at = new Date(dto.started_at);
    if (dto.ended_at !== undefined) session.ended_at = new Date(dto.ended_at);
    if (dto.notes !== undefined) session.notes = dto.notes;

    return this.sessionsRepository.save(session);
  }

  async remove(id: string, userId: string): Promise<void> {
    const session = await this.sessionsRepository.findOne({ where: { id } });
    if (!session) {
      throw new NotFoundException("Session not found");
    }
    if (session.user_id !== userId) {
      throw new ForbiddenException("Access denied");
    }
    await this.sessionsRepository.remove(session);
  }

  async findLastSessionByTemplate(
    userId: string,
    templateId: string,
    sessionId: string,
  ): Promise<string | null> {
    const session = await this.sessionsRepository.findOne({
      where: {
        user_id: userId,
        template_id: templateId,
        id: Not(sessionId),
      },
      order: { scheduled_date: "DESC" },
      relations: ["session_sets", "session_sets.exercise"],
    });

    return session ? session.id : null;
  }
}
