import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { AppModule } from "../../src/app.module";
import { UserRole } from "../../src/users/entities/user.entity";

export async function createTestApp(): Promise<{
  app: INestApplication;
  dataSource: DataSource;
}> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.init();

  const dataSource = moduleRef.get(DataSource);
  return { app, dataSource };
}

export async function clearDatabase(dataSource: DataSource): Promise<void> {
  const tables = dataSource.entityMetadatas
    .map((entity) => `"${entity.tableName}"`)
    .join(", ");
  await dataSource.query(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`);
}

export async function promoteToAdmin(
  dataSource: DataSource,
  userId: string,
): Promise<void> {
  await dataSource.query(`UPDATE users SET role = $1 WHERE id = $2`, [
    UserRole.ADMIN,
    userId,
  ]);
}
