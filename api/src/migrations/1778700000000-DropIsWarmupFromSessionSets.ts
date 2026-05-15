import { MigrationInterface, QueryRunner } from "typeorm";

export class DropIsWarmupFromSessionSets1778700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE session_sets DROP COLUMN is_warmup`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE session_sets ADD COLUMN is_warmup BOOLEAN NOT NULL DEFAULT false`,
    );
  }
}
