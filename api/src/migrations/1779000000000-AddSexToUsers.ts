import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSexToUsers1779000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "sex_enum" AS ENUM ('male', 'female')
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN "sex" "sex_enum" NOT NULL DEFAULT 'male'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "sex"`);
    await queryRunner.query(`DROP TYPE "sex_enum"`);
  }
}
