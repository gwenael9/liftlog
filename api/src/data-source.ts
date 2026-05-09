import { DataSource } from "typeorm";
import { User } from "./users/entities/user.entity";
import { Exercise } from "./exercises/entities/exercise.entity";
import { WorkoutTemplate } from "./workout-templates/entities/workout-template.entity";
import { TemplateExercise } from "./workout-templates/entities/template-exercise.entity";
import { WorkoutSession } from "./workout-sessions/entities/workout-session.entity";
import { SessionSet } from "./session-sets/entities/session-set.entity";

export const AppDataSource = new DataSource({
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
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
});
