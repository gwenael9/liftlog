import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { WorkoutSession } from "../../workout-sessions/entities/workout-session.entity";
import { Exercise } from "../../exercises/entities/exercise.entity";

export interface SessionSetSegment {
  reps: number;
  weight_kg?: number | null;
}

@Entity("session_sets")
@Index(["exercise_id", "performed_at"])
export class SessionSet {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", name: "session_id" })
  session_id: string;

  @ManyToOne(() => WorkoutSession, (s) => s.session_sets, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "session_id" })
  session: WorkoutSession;

  @Column({ type: "uuid", name: "exercise_id" })
  exercise_id: string;

  @ManyToOne(() => Exercise, { eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "exercise_id" })
  exercise: Exercise;

  @Column({ type: "int", name: "set_index" })
  set_index: number;

  @Column({ type: "int", default: 0, name: "exercise_order" })
  exercise_order: number;

  @Column({ type: "int", nullable: true })
  reps: number | null;

  @Column({
    type: "decimal",
    precision: 6,
    scale: 2,
    nullable: true,
    name: "weight_kg",
  })
  weight_kg: number | null;

  @Column({ type: "int", nullable: true, name: "duration_min" })
  duration_min: number | null;

  // Segments successifs d'une même série (drop set) : ex. 4 reps @ X kg puis 3 reps @ Y kg.
  @Column({ type: "jsonb", nullable: true })
  segments: SessionSetSegment[] | null;

  is_pr: boolean = false;

  @Column({ type: "timestamptz", nullable: true, name: "performed_at" })
  performed_at: Date | null;
}
