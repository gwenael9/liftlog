import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

export enum TrackingType {
  STRENGTH = "strength",
  DURATION = "duration",
}

export enum MuscleGroup {
  CHEST = "chest",
  BACK = "back",
  SHOULDERS = "shoulders",
  BICEPS = "biceps",
  TRICEPS = "triceps",
  LEGS = "legs",
  GLUTES = "glutes",
  CORE = "core",
  CARDIO = "cardio",
  FULL_BODY = "full_body",
}

@Entity("exercises")
export class Exercise {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", nullable: true, name: "created_by" })
  created_by: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "created_by" })
  creator: User | null;

  @Column({ type: "varchar", length: 150, unique: true })
  slug: string;

  @Column({ type: "enum", enum: MuscleGroup, name: "muscle_group" })
  muscle_group: MuscleGroup;

  @Column({ type: "boolean", default: false, name: "is_global" })
  is_global: boolean;

  @Column({
    type: "enum",
    enum: TrackingType,
    default: TrackingType.STRENGTH,
    name: "tracking_type",
  })
  tracking_type: TrackingType;

  @Column({ type: "text", nullable: true })
  notes: string | null;

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  created_at: Date;
}
