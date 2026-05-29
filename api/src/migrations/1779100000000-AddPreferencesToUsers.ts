import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPreferencesToUsers1779100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN "preferences" jsonb NOT NULL DEFAULT '{}'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "preferences"`);
  }
}
