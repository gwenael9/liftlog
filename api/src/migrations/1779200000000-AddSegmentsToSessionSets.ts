import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSegmentsToSessionSets1779200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE session_sets ADD COLUMN segments JSONB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE session_sets DROP COLUMN segments`);
  }
}
