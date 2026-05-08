import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorkoutTemplate } from './workout-template.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';

@Entity('template_exercises')
export class TemplateExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'template_id' })
  template_id: string;

  @ManyToOne(() => WorkoutTemplate, (t) => t.template_exercises, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'template_id' })
  template: WorkoutTemplate;

  @Column({ type: 'uuid', name: 'exercise_id' })
  exercise_id: string;

  @ManyToOne(() => Exercise, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise;

  @Column({ type: 'int', name: 'order_index' })
  order_index: number;

  @Column({ type: 'int', nullable: true, name: 'target_sets' })
  target_sets: number | null;

  @Column({ type: 'int', nullable: true, name: 'target_reps' })
  target_reps: number | null;

  @Column({ type: 'int', nullable: true, name: 'rest_seconds' })
  rest_seconds: number | null;

  @Column({ type: 'int', nullable: true, name: 'target_duration_sec' })
  target_duration_sec: number | null;
}
