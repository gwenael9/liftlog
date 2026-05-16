import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum EntityType {
  TEMPLATE = 'template',
}

@Entity('user_favorites')
@Unique(['user_id', 'entity_type', 'entity_id'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  entity_type: EntityType;

  @Column('uuid')
  entity_id: string;

  @CreateDateColumn()
  created_at: Date;
}
