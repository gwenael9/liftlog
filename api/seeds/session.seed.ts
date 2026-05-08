import "reflect-metadata";
import * as bcrypt from "bcryptjs";
import { DataSource } from "typeorm";
import {
  Exercise,
  MuscleGroup,
} from "../src/exercises/entities/exercise.entity";
import { User, UnitSystem } from "../src/users/entities/user.entity";
import { WorkoutTemplate } from "../src/workout-templates/entities/workout-template.entity";
import { TemplateExercise } from "../src/workout-templates/entities/template-exercise.entity";
import {
  WorkoutSession,
  SessionStatus,
} from "../src/workout-sessions/entities/workout-session.entity";
import { SessionSet } from "../src/session-sets/entities/session-set.entity";

const dataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432", 10),
  username: process.env.DATABASE_USER || "liftlog",
  password: process.env.DATABASE_PASSWORD || "liftlog_password",
  database: process.env.DATABASE_NAME || "liftlog_db",
  entities: [
    Exercise,
    User,
    WorkoutTemplate,
    TemplateExercise,
    WorkoutSession,
    SessionSet,
  ],
  synchronize: false,
});

// Séance 1 : Full Body - Force Poussée
// squat 5×5 | bench press 5×5 | rowing barre 4×6
// overhead press 4×6 | rotation externe poulie 3×12 | plank 2×90s

async function seed() {
  console.log("Connecting to database...");
  await dataSource.initialize();
  console.log("Connected. Starting session seed...");

  const userRepo = dataSource.getRepository(User);
  const exerciseRepo = dataSource.getRepository(Exercise);
  const templateRepo = dataSource.getRepository(WorkoutTemplate);
  const templateExerciseRepo = dataSource.getRepository(TemplateExercise);
  const sessionRepo = dataSource.getRepository(WorkoutSession);
  const setRepo = dataSource.getRepository(SessionSet);

  // 1. User
  let user = await userRepo.findOne({ where: { email: "test@liftlog.dev" } });
  if (!user) {
    const passwordHash = await bcrypt.hash("test1234", 10);
    user = userRepo.create({
      email: "test@liftlog.dev",
      password_hash: passwordHash,
      display_name: "Test User",
      unit_system: UnitSystem.KG,
    });
    await userRepo.save(user);
    console.log("  INSERT user test@liftlog.dev");
  } else {
    console.log("  SKIP   user test@liftlog.dev (already exists)");
  }

  // 2. Exercises — global ones must exist (run exercises.seed.ts first)
  const findGlobal = async (name: string): Promise<Exercise> => {
    const ex = await exerciseRepo.findOne({ where: { name, is_global: true } });
    if (!ex)
      throw new Error(
        `Global exercise "${name}" not found. Run exercises.seed.ts first.`
      );
    return ex;
  };

  const squat = await findGlobal("Squat");
  const benchPress = await findGlobal("Bench Press");
  const barbellRow = await findGlobal("Barbell Row");
  const overheadPress = await findGlobal("Overhead Press");
  const plank = await findGlobal("Plank");

  let rotationExterne = await exerciseRepo.findOne({
    where: { name: "Rotation Externe Poulie", created_by: user.id },
  });
  if (!rotationExterne) {
    rotationExterne = exerciseRepo.create({
      name: "Rotation Externe Poulie",
      muscle_group: MuscleGroup.SHOULDERS,
      is_global: false,
      created_by: user.id,
    });
    await exerciseRepo.save(rotationExterne);
    console.log("  INSERT exercise Rotation Externe Poulie");
  } else {
    console.log("  SKIP   exercise Rotation Externe Poulie (already exists)");
  }

  // 3. Template
  let template = await templateRepo.findOne({
    where: { name: "Full Body - Force Poussée", user_id: user.id },
  });
  if (!template) {
    template = templateRepo.create({
      name: "Full Body - Force Poussée",
      user_id: user.id,
      description: "Séance force full body axée poussée",
      estimated_duration: 75,
    });
    await templateRepo.save(template);

    const templateExercises = [
      {
        exercise: squat,
        order_index: 1,
        target_sets: 5,
        target_reps: 5,
        rest_seconds: 180,
      },
      {
        exercise: benchPress,
        order_index: 2,
        target_sets: 5,
        target_reps: 5,
        rest_seconds: 180,
      },
      {
        exercise: barbellRow,
        order_index: 3,
        target_sets: 4,
        target_reps: 6,
        rest_seconds: 150,
      },
      {
        exercise: overheadPress,
        order_index: 4,
        target_sets: 4,
        target_reps: 6,
        rest_seconds: 150,
      },
      {
        exercise: rotationExterne,
        order_index: 5,
        target_sets: 3,
        target_reps: 12,
        rest_seconds: 60,
      },
      {
        exercise: plank,
        order_index: 6,
        target_sets: 2,
        target_reps: null,
        rest_seconds: 90,
      },
    ];

    for (const te of templateExercises) {
      await templateExerciseRepo.save(
        templateExerciseRepo.create({
          template_id: template.id,
          exercise_id: te.exercise.id,
          order_index: te.order_index,
          target_sets: te.target_sets,
          target_reps: te.target_reps,
          rest_seconds: te.rest_seconds,
        })
      );
    }
    console.log("  INSERT template Full Body - Force Poussée");
  } else {
    console.log("  SKIP   template Full Body - Force Poussée (already exists)");
  }

  // 4. Session
  const sessionDate = "2026-05-08";
  let session = await sessionRepo.findOne({
    where: { user_id: user.id, scheduled_date: sessionDate },
  });

  if (session) {
    console.log(`  SKIP   session ${sessionDate} (already exists)`);
  } else {
    session = sessionRepo.create({
      user_id: user.id,
      template_id: template.id,
      status: SessionStatus.COMPLETED,
      scheduled_date: sessionDate,
      started_at: new Date("2026-05-08T09:00:00Z"),
      ended_at: new Date("2026-05-08T10:15:00Z"),
      notes: "Bonne séance. Top set squat 100kg smooth.",
    });
    await sessionRepo.save(session);
    console.log(`  INSERT session ${sessionDate}`);

    // 5. Session sets
    type RawSet = {
      reps: number | null;
      weight_kg: number | null;
      duration_sec: number | null;
      is_pr?: boolean;
    };

    const setsData: { exercise: Exercise; sets: RawSet[] }[] = [
      {
        exercise: squat,
        sets: [
          { reps: 5, weight_kg: 80, duration_sec: null },
          { reps: 5, weight_kg: 90, duration_sec: null },
          { reps: 5, weight_kg: 100, duration_sec: null, is_pr: true },
          { reps: 5, weight_kg: 100, duration_sec: null },
          { reps: 5, weight_kg: 100, duration_sec: null },
        ],
      },
      {
        exercise: benchPress,
        sets: [
          { reps: 5, weight_kg: 65, duration_sec: null },
          { reps: 5, weight_kg: 72.5, duration_sec: null },
          { reps: 5, weight_kg: 80, duration_sec: null, is_pr: true },
          { reps: 5, weight_kg: 80, duration_sec: null },
          { reps: 5, weight_kg: 80, duration_sec: null },
        ],
      },
      {
        exercise: barbellRow,
        sets: [
          { reps: 6, weight_kg: 60, duration_sec: null },
          { reps: 6, weight_kg: 65, duration_sec: null },
          { reps: 6, weight_kg: 70, duration_sec: null },
          { reps: 6, weight_kg: 70, duration_sec: null },
        ],
      },
      {
        exercise: overheadPress,
        sets: [
          { reps: 6, weight_kg: 35, duration_sec: null },
          { reps: 6, weight_kg: 40, duration_sec: null },
          { reps: 6, weight_kg: 42.5, duration_sec: null },
          { reps: 6, weight_kg: 42.5, duration_sec: null },
        ],
      },
      {
        exercise: rotationExterne,
        sets: [
          { reps: 12, weight_kg: 7.5, duration_sec: null },
          { reps: 12, weight_kg: 7.5, duration_sec: null },
          { reps: 12, weight_kg: 7.5, duration_sec: null },
        ],
      },
      {
        exercise: plank,
        sets: [
          { reps: null, weight_kg: null, duration_sec: 90 },
          { reps: null, weight_kg: null, duration_sec: 90 },
        ],
      },
    ];

    const sessionStart = new Date("2026-05-08T09:05:00Z");
    let setOffset = 0;

    for (const { exercise, sets } of setsData) {
      for (let i = 0; i < sets.length; i++) {
        const s = sets[i];
        await setRepo.save(
          setRepo.create({
            session_id: session.id,
            exercise_id: exercise.id,
            set_index: i + 1,
            reps: s.reps,
            weight_kg: s.weight_kg,
            duration_sec: s.duration_sec,
            is_warmup: false,
            is_pr: s.is_pr ?? false,
            performed_at: new Date(
              sessionStart.getTime() + setOffset * 3 * 60 * 1000
            ),
          })
        );
        setOffset++;
      }
      console.log(`  INSERT ${sets.length} sets — ${exercise.name}`);
    }
  }

  console.log("\nSession seed complete.");
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
