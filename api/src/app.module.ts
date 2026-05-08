import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ExercisesModule } from "./exercises/exercises.module";
import { WorkoutTemplatesModule } from "./workout-templates/workout-templates.module";
import { WorkoutSessionsModule } from "./workout-sessions/workout-sessions.module";
import { SessionSetsModule } from "./session-sets/session-sets.module";
import { StatsModule } from "./stats/stats.module";
import { User } from "./users/entities/user.entity";
import { Exercise } from "./exercises/entities/exercise.entity";
import { WorkoutTemplate } from "./workout-templates/entities/workout-template.entity";
import { TemplateExercise } from "./workout-templates/entities/template-exercise.entity";
import { WorkoutSession } from "./workout-sessions/entities/workout-session.entity";
import { SessionSet } from "./session-sets/entities/session-set.entity";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DATABASE_HOST || "localhost",
      port: parseInt(process.env.DATABASE_PORT || "5432", 10),
      username: process.env.DATABASE_USER || "liftlog",
      password: process.env.DATABASE_PASSWORD || "liftlog_password",
      database: process.env.DATABASE_NAME || "liftlog_db",
      entities: [
        User,
        Exercise,
        WorkoutTemplate,
        TemplateExercise,
        WorkoutSession,
        SessionSet,
      ],
      synchronize: process.env.NODE_ENV !== "production",
      logging: process.env.NODE_ENV === "development",
    }),
    AuthModule,
    UsersModule,
    ExercisesModule,
    WorkoutTemplatesModule,
    WorkoutSessionsModule,
    SessionSetsModule,
    StatsModule,
  ],
})
export class AppModule {}
