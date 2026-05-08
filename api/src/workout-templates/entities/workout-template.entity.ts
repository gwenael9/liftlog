import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TemplateExercise } from './template-exercise.entity';

@Entity('workout_templates')
export class WorkoutTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', nullable: true, name: 'estimated_duration' })
  estimated_duration: number | null;

  @OneToMany(() => TemplateExercise, (te) => te.template, {
    cascade: true,
    eager: false,
  })
  template_exercises: TemplateExercise[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;
}
