import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsPublicToTemplates1778800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workout_templates" ADD COLUMN "is_public" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workout_templates" DROP COLUMN "is_public"`,
    );
  }
}
