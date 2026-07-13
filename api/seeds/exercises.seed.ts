import "reflect-metadata";
import { DataSource } from "typeorm";
import {
  Exercise,
  MuscleGroup,
  TrackingType,
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

const exercises: {
  slug: string;
  muscle_group: MuscleGroup;
  tracking_type: TrackingType;
}[] = [
  // Chest
  {
    slug: "bench_press",
    muscle_group: MuscleGroup.CHEST,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "incline_dumbbell_press",
    muscle_group: MuscleGroup.CHEST,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "cable_fly",
    muscle_group: MuscleGroup.CHEST,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "incline_barbell_press",
    muscle_group: MuscleGroup.CHEST,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "chest_press",
    muscle_group: MuscleGroup.CHEST,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "butterfly",
    muscle_group: MuscleGroup.CHEST,
    tracking_type: TrackingType.STRENGTH,
  },
  // Back
  {
    slug: "pull_up",
    muscle_group: MuscleGroup.BACK,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "barbell_row",
    muscle_group: MuscleGroup.BACK,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "lat_pulldown",
    muscle_group: MuscleGroup.BACK,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "seated_cable_row",
    muscle_group: MuscleGroup.BACK,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "unilateral_row",
    muscle_group: MuscleGroup.BACK,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "chin_pull",
    muscle_group: MuscleGroup.BACK,
    tracking_type: TrackingType.STRENGTH,
  },
  // Shoulders
  {
    slug: "overhead_press",
    muscle_group: MuscleGroup.SHOULDERS,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "lateral_raise",
    muscle_group: MuscleGroup.SHOULDERS,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "face_pull",
    muscle_group: MuscleGroup.SHOULDERS,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "shrug_barbell",
    muscle_group: MuscleGroup.SHOULDERS,
    tracking_type: TrackingType.STRENGTH,
  },
  // Biceps
  {
    slug: "barbell_curl",
    muscle_group: MuscleGroup.BICEPS,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "hammer_curl",
    muscle_group: MuscleGroup.BICEPS,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "incline_curl",
    muscle_group: MuscleGroup.BICEPS,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "preacher_curl",
    muscle_group: MuscleGroup.BICEPS,
    tracking_type: TrackingType.STRENGTH,
  },
  // Triceps
  {
    slug: "tricep_pushdown",
    muscle_group: MuscleGroup.TRICEPS,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "skull_crusher",
    muscle_group: MuscleGroup.TRICEPS,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "dips",
    muscle_group: MuscleGroup.TRICEPS,
    tracking_type: TrackingType.STRENGTH,
  },
  // Legs
  {
    slug: "squat",
    muscle_group: MuscleGroup.LEGS,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "romanian_deadlift",
    muscle_group: MuscleGroup.LEGS,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "leg_press",
    muscle_group: MuscleGroup.LEGS,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "leg_curl",
    muscle_group: MuscleGroup.LEGS,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "calf_raise",
    muscle_group: MuscleGroup.LEGS,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "bulgarian_split_squat",
    muscle_group: MuscleGroup.LEGS,
    tracking_type: TrackingType.STRENGTH,
  },
  // Core
  {
    slug: "plank",
    muscle_group: MuscleGroup.CORE,
    tracking_type: TrackingType.DURATION,
  },
  {
    slug: "crunch",
    muscle_group: MuscleGroup.CORE,
    tracking_type: TrackingType.STRENGTH,
  },
  {
    slug: "hanging_leg_raise",
    muscle_group: MuscleGroup.CORE,
    tracking_type: TrackingType.STRENGTH,
  },
  // Cardio
  {
    slug: "running",
    muscle_group: MuscleGroup.CARDIO,
    tracking_type: TrackingType.DURATION,
  },
  {
    slug: "cycling",
    muscle_group: MuscleGroup.CARDIO,
    tracking_type: TrackingType.DURATION,
  },
  {
    slug: "jump_rope",
    muscle_group: MuscleGroup.CARDIO,
    tracking_type: TrackingType.DURATION,
  },
];

async function seed() {
  console.log("Connecting to database...");
  await dataSource.initialize();
  console.log("Connected. Starting seed...");

  const exerciseRepo = dataSource.getRepository(Exercise);

  let inserted = 0;
  let skipped = 0;

  for (const exerciseData of exercises) {
    const existing = await exerciseRepo.findOne({
      where: {
        slug: exerciseData.slug,
        is_global: true,
      },
    });

    if (existing) {
      console.log(`  SKIP  ${exerciseData.slug} (already exists)`);
      skipped++;
      continue;
    }

    const exercise = exerciseRepo.create({
      slug: exerciseData.slug,
      muscle_group: exerciseData.muscle_group,
      tracking_type: exerciseData.tracking_type,
      is_global: true,
      created_by: null,
    });

    await exerciseRepo.save(exercise);
    console.log(`  INSERT ${exercise.slug} (${exercise.muscle_group})`);
    inserted++;
  }

  console.log(`\nSeed complete: ${inserted} inserted, ${skipped} skipped.`);
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
