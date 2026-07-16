import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1778356723840 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Extensions
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Enums
    await queryRunner.query(`
      CREATE TYPE public.exercises_muscle_group_enum AS ENUM (
        'chest', 'back', 'shoulders', 'biceps', 'triceps',
        'legs', 'glutes', 'core', 'cardio', 'full_body'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE public.exercises_tracking_type_enum AS ENUM (
        'strength', 'duration'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE public.users_role_enum AS ENUM ('user', 'admin')
    `);
    await queryRunner.query(`
      CREATE TYPE public.users_unit_system_enum AS ENUM ('kg', 'lbs')
    `);
    await queryRunner.query(`
      CREATE TYPE public.workout_sessions_status_enum AS ENUM (
        'planned', 'in_progress', 'completed', 'skipped'
      )
    `);

    // Tables
    await queryRunner.query(`
      CREATE TABLE public.users (
        id uuid DEFAULT public.gen_random_uuid() NOT NULL,
        email character varying(255) NOT NULL,
        password_hash character varying NOT NULL,
        display_name character varying(100),
        unit_system public.users_unit_system_enum DEFAULT 'kg' NOT NULL,
        refresh_token_hash character varying,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL,
        role public.users_role_enum DEFAULT 'user' NOT NULL,
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE public.exercises (
        id uuid DEFAULT public.gen_random_uuid() NOT NULL,
        created_by uuid,
        slug character varying(150) NOT NULL,
        muscle_group public.exercises_muscle_group_enum NOT NULL,
        is_global boolean DEFAULT false NOT NULL,
        notes text,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        tracking_type public.exercises_tracking_type_enum DEFAULT 'strength' NOT NULL,
        CONSTRAINT "PK_c4c46f5fa89a58ba7c2d894e3c3" PRIMARY KEY (id),
        CONSTRAINT "UQ_39b440305ccf965ef366de53ab8" UNIQUE (slug),
        CONSTRAINT "FK_04f0913a3334b245234bd6d3479"
          FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE public.workout_templates (
        id uuid DEFAULT public.gen_random_uuid() NOT NULL,
        user_id uuid NOT NULL,
        name character varying(150) NOT NULL,
        description text,
        estimated_duration integer,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        CONSTRAINT "PK_7ef9887437cbf97fefaa93dc6e5" PRIMARY KEY (id),
        CONSTRAINT "FK_7ade528bde7d140c3b9ea582396"
          FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE public.workout_sessions (
        id uuid DEFAULT public.gen_random_uuid() NOT NULL,
        user_id uuid NOT NULL,
        template_id uuid,
        status public.workout_sessions_status_enum DEFAULT 'planned' NOT NULL,
        scheduled_date date NOT NULL,
        started_at timestamp with time zone,
        ended_at timestamp with time zone,
        notes text,
        CONSTRAINT "PK_eea00e05dc78d40b55a588c9f57" PRIMARY KEY (id),
        CONSTRAINT "FK_3a1ec9260afc530837db15579a5"
          FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
        CONSTRAINT "FK_415765806f037d1fb1f1e26b3e0"
          FOREIGN KEY (template_id) REFERENCES public.workout_templates(id) ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE public.template_exercises (
        id uuid DEFAULT public.gen_random_uuid() NOT NULL,
        template_id uuid NOT NULL,
        exercise_id uuid NOT NULL,
        order_index integer NOT NULL,
        target_sets integer,
        target_reps integer,
        rest_seconds integer,
        target_duration_sec integer,
        CONSTRAINT "PK_8c67b5a9e1eaf3e4f7320349cfd" PRIMARY KEY (id),
        CONSTRAINT "FK_a5501e4e4e6dbe58f472eb097c8"
          FOREIGN KEY (template_id) REFERENCES public.workout_templates(id) ON DELETE CASCADE,
        CONSTRAINT "FK_eb57fccdb71c3cc3ed6430f448c"
          FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE public.session_sets (
        id uuid DEFAULT public.gen_random_uuid() NOT NULL,
        session_id uuid NOT NULL,
        exercise_id uuid NOT NULL,
        set_index integer NOT NULL,
        reps integer,
        weight_kg numeric(6,2),
        duration_sec integer,
        is_warmup boolean DEFAULT false NOT NULL,
        is_pr boolean DEFAULT false NOT NULL,
        performed_at timestamp with time zone,
        CONSTRAINT "PK_78566b25f157fedf3275de3408d" PRIMARY KEY (id),
        CONSTRAINT "FK_08c0e1d8b9c9b5f2c7c90481a0b"
          FOREIGN KEY (session_id) REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
        CONSTRAINT "FK_b2b3100492eafa39d6498f087ff"
          FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE CASCADE
      )
    `);

    // Index
    await queryRunner.query(`
      CREATE INDEX "IDX_8d2d18f34a4c5160efb390b3da"
        ON public.workout_sessions (user_id, scheduled_date)
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_c4c1eca99d543a94125c8040df"
        ON public.session_sets (exercise_id, performed_at)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_c4c1eca99d543a94125c8040df"`);
    await queryRunner.query(`DROP INDEX "IDX_8d2d18f34a4c5160efb390b3da"`);
    await queryRunner.query(`DROP TABLE public.session_sets`);
    await queryRunner.query(`DROP TABLE public.template_exercises`);
    await queryRunner.query(`DROP TABLE public.workout_sessions`);
    await queryRunner.query(`DROP TABLE public.workout_templates`);
    await queryRunner.query(`DROP TABLE public.exercises`);
    await queryRunner.query(`DROP TABLE public.users`);
    await queryRunner.query(`DROP TYPE public.workout_sessions_status_enum`);
    await queryRunner.query(`DROP TYPE public.users_unit_system_enum`);
    await queryRunner.query(`DROP TYPE public.users_role_enum`);
    await queryRunner.query(`DROP TYPE public.exercises_tracking_type_enum`);
    await queryRunner.query(`DROP TYPE public.exercises_muscle_group_enum`);
  }
}
