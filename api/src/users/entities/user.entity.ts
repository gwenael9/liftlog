import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum UnitSystem {
  KG = 'kg',
  LBS = 'lbs',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum Sex {
  MALE = 'male',
  FEMALE = 'female',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', name: 'password_hash' })
  password_hash: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'display_name' })
  display_name: string | null;

  @Column({
    type: 'enum',
    enum: UnitSystem,
    default: UnitSystem.KG,
    name: 'unit_system',
  })
  unit_system: UnitSystem;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
    name: 'role',
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: Sex,
    default: Sex.MALE,
    name: 'sex',
  })
  sex: Sex;

  @Column({ type: 'varchar', nullable: true, name: 'refresh_token_hash' })
  refresh_token_hash: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updated_at: Date;
}
