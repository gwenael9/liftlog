import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WorkoutTemplate } from '../../workout-templates/entities/workout-template.entity';
import { SessionSet } from '../../session-sets/entities/session-set.entity';

export enum SessionStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

@Entity('workout_sessions')
@Index(['user_id', 'scheduled_date'])
export class WorkoutSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', nullable: true, name: 'template_id' })
  template_id: string | null;

  @ManyToOne(() => WorkoutTemplate, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'template_id' })
  template: WorkoutTemplate | null;

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.PLANNED })
  status: SessionStatus;

  @Column({ type: 'date', name: 'scheduled_date' })
  scheduled_date: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'started_at' })
  started_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'ended_at' })
  ended_at: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => SessionSet, (s) => s.session, { eager: false })
  session_sets: SessionSet[];
}
