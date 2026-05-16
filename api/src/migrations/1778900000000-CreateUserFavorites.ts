import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserFavorites1778900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_favorites" (
        "id"          uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "user_id"     uuid          NOT NULL,
        "entity_type" varchar(50)   NOT NULL,
        "entity_id"   uuid          NOT NULL,
        "created_at"  TIMESTAMP     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_favorites" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_favorites" UNIQUE ("user_id", "entity_type", "entity_id"),
        CONSTRAINT "FK_user_favorites_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_favorites"`);
  }
}
