import { MigrationInterface, QueryRunner } from "typeorm";

export class DropIsPrFromSessionSets1778600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE session_sets DROP COLUMN is_pr`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE session_sets ADD COLUMN is_pr BOOLEAN NOT NULL DEFAULT false`,
    );
  }
}
