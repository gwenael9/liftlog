import "reflect-metadata";
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

loadEnv({ path: resolve(__dirname, "../../.env") });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  const config = new DocumentBuilder()
    .setTitle("LiftLog API")
    .setDescription("Workout tracking API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  const port = parseInt(process.env.PORT || "3000", 10);
  await app.listen(port);
  console.log(`liftlog backend is running on: http://localhost:${port}`);
}

bootstrap();
