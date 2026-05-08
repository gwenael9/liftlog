import "reflect-metadata";
import { DataSource } from "typeorm";
import {
  Exercise,
  MuscleGroup,
} from "../src/exercises/entities/exercise.entity";
import { User } from "../src/users/entities/user.entity";
import { WorkoutTemplate } from "../src/workout-templates/entities/workout-template.entity";
import { TemplateExercise } from "../src/workout-templates/entities/template-exercise.entity";
import { WorkoutSession } from "../src/workout-sessions/entities/workout-session.entity";
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

interface SeedExercise {
  name: string;
  muscle_group: MuscleGroup;
}

const globalExercises: SeedExercise[] = [
  // Chest
  { name: "Bench Press", muscle_group: MuscleGroup.CHEST },
  { name: "Incline Dumbbell Press", muscle_group: MuscleGroup.CHEST },
  { name: "Cable Fly", muscle_group: MuscleGroup.CHEST },

  // Back
  { name: "Pull-up", muscle_group: MuscleGroup.BACK },
  { name: "Barbell Row", muscle_group: MuscleGroup.BACK },
  { name: "Lat Pulldown", muscle_group: MuscleGroup.BACK },
  { name: "Seated Cable Row", muscle_group: MuscleGroup.BACK },

  // Shoulders
  { name: "Overhead Press", muscle_group: MuscleGroup.SHOULDERS },
  { name: "Lateral Raise", muscle_group: MuscleGroup.SHOULDERS },
  { name: "Face Pull", muscle_group: MuscleGroup.SHOULDERS },

  // Biceps
  { name: "Barbell Curl", muscle_group: MuscleGroup.BICEPS },
  { name: "Hammer Curl", muscle_group: MuscleGroup.BICEPS },

  // Triceps
  { name: "Tricep Pushdown", muscle_group: MuscleGroup.TRICEPS },
  { name: "Skull Crusher", muscle_group: MuscleGroup.TRICEPS },
  { name: "Dips", muscle_group: MuscleGroup.TRICEPS },

  // Legs
  { name: "Squat", muscle_group: MuscleGroup.LEGS },
  { name: "Romanian Deadlift", muscle_group: MuscleGroup.LEGS },
  { name: "Leg Press", muscle_group: MuscleGroup.LEGS },
  { name: "Leg Curl", muscle_group: MuscleGroup.LEGS },
  { name: "Calf Raise", muscle_group: MuscleGroup.LEGS },

  // Core
  { name: "Plank", muscle_group: MuscleGroup.CORE },
  { name: "Crunch", muscle_group: MuscleGroup.CORE },
  { name: "Hanging Leg Raise", muscle_group: MuscleGroup.CORE },

  // Cardio
  { name: "Running", muscle_group: MuscleGroup.CARDIO },
  { name: "Cycling", muscle_group: MuscleGroup.CARDIO },
  { name: "Jump Rope", muscle_group: MuscleGroup.CARDIO },
];

async function seed() {
  console.log("Connecting to database...");
  await dataSource.initialize();
  console.log("Connected. Starting seed...");

  const exerciseRepo = dataSource.getRepository(Exercise);

  let inserted = 0;
  let skipped = 0;

  for (const exerciseData of globalExercises) {
    const existing = await exerciseRepo.findOne({
      where: {
        name: exerciseData.name,
        is_global: true,
      },
    });

    if (existing) {
      console.log(`  SKIP  ${exerciseData.name} (already exists)`);
      skipped++;
      continue;
    }

    const exercise = exerciseRepo.create({
      name: exerciseData.name,
      muscle_group: exerciseData.muscle_group,
      is_global: true,
      created_by: null,
    });

    await exerciseRepo.save(exercise);
    console.log(`  INSERT ${exerciseData.name} (${exerciseData.muscle_group})`);
    inserted++;
  }

  console.log(`\nSeed complete: ${inserted} inserted, ${skipped} skipped.`);
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
