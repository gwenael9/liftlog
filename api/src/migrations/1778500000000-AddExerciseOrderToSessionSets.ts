import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExerciseOrderToSessionSets1778500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE session_sets ADD COLUMN exercise_order INT NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      WITH ranked AS (
        SELECT
          session_id,
          exercise_id,
          ROW_NUMBER() OVER (
            PARTITION BY session_id
            ORDER BY MIN(performed_at) NULLS LAST, exercise_id
          ) - 1 AS ord
        FROM session_sets
        GROUP BY session_id, exercise_id
      )
      UPDATE session_sets ss
      SET exercise_order = ranked.ord
      FROM ranked
      WHERE ss.session_id = ranked.session_id
        AND ss.exercise_id = ranked.exercise_id
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE session_sets DROP COLUMN exercise_order`);
  }
}
