import { MigrationInterface, QueryRunner } from "typeorm";

export class DropSessionStatus1778400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.workout_sessions DROP COLUMN status`);
    await queryRunner.query(`DROP TYPE public.workout_sessions_status_enum`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE public.workout_sessions_status_enum AS ENUM (
        'planned', 'in_progress', 'completed', 'skipped'
      )
    `);
    await queryRunner.query(`
      ALTER TABLE public.workout_sessions
        ADD COLUMN status public.workout_sessions_status_enum DEFAULT 'planned' NOT NULL
    `);
  }
}
