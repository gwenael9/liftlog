Crée un backend NestJS complet pour une application de suivi de séances de sport appelée "Liftlog".

## Stack

- NestJS avec TypeScript
- TypeORM comme ORM
- PostgreSQL (via Docker Compose)
- Authentification JWT (passport-jwt)
- Validation avec class-validator / class-dto
- Docker Compose pour PostgreSQL + pgAdmin

## Structure des modules à générer

### Modules NestJS

- AuthModule (register, login, refresh token)
- UsersModule
- ExercisesModule
- WorkoutTemplatesModule
- TemplateExercisesModule
- WorkoutSessionsModule
- SessionSetsModule

---

## Schéma de base de données (TypeORM Entities)

### users

- id: uuid (PK, generated)
- email: varchar(255), unique, not null
- password_hash: varchar, not null
- display_name: varchar(100), nullable
- unit_system: enum('kg', 'lbs'), default 'kg'
- created_at: timestamptz
- updated_at: timestamptz

### exercises

- id: uuid (PK)
- created_by: uuid (FK → users, nullable)
- name: varchar(150), not null
- muscle_group: enum('chest','back','shoulders','biceps','triceps','legs','glutes','core','cardio','full_body')
- is_global: boolean, default false
- notes: text, nullable
- created_at: timestamptz

### workout_templates

- id: uuid (PK)
- user_id: uuid (FK → users, not null)
- name: varchar(150), not null
- description: text, nullable
- estimated_duration: int, nullable (minutes)
- created_at: timestamptz

### template_exercises

- id: uuid (PK)
- template_id: uuid (FK → workout_templates, not null)
- exercise_id: uuid (FK → exercises, not null)
- order_index: int, not null
- target_sets: int, nullable
- target_reps: int, nullable
- rest_seconds: int, nullable

### workout_sessions

- id: uuid (PK)
- user_id: uuid (FK → users, not null)
- template_id: uuid (FK → workout_templates, nullable)
- status: enum('planned','in_progress','completed','skipped'), default 'planned'
- scheduled_date: date, not null
- started_at: timestamptz, nullable
- ended_at: timestamptz, nullable
- notes: text, nullable
- Index composite sur (user_id, scheduled_date)

### session_sets

- id: uuid (PK)
- session_id: uuid (FK → workout_sessions, not null)
- exercise_id: uuid (FK → exercises, not null)
- set_index: int, not null
- reps: int, nullable
- weight_kg: decimal(6,2), nullable
- duration_sec: int, nullable (pour cardio/isométrie)
- is_warmup: boolean, default false
- is_pr: boolean, default false
- performed_at: timestamptz, nullable
- Index composite sur (exercise_id, performed_at)

---

## Endpoints REST à implémenter

### Auth

POST /auth/register → { email, password, display_name }
POST /auth/login → { email, password } → { access_token, refresh_token }
POST /auth/refresh → { refresh_token }

### Users

GET /users/me
PUT /users/me → { display_name, unit_system }

### Exercises

GET /exercises → liste globale + custom user (query: ?muscle_group=chest)
GET /exercises/:id
POST /exercises → créer exercice custom (lié au user connecté)
PUT /exercises/:id
DELETE /exercises/:id → uniquement si created_by = user connecté

### Workout Templates

GET /templates
GET /templates/:id → inclure template_exercises avec exercise
POST /templates → { name, description, estimated_duration, exercises: [{exercise_id, order_index, target_sets, target_reps, rest_seconds}] }
PUT /templates/:id
DELETE /templates/:id

### Workout Sessions

GET /sessions → query params: ?month=2025-05 pour calendrier
GET /sessions/:id → inclure session_sets avec exercise
POST /sessions → { scheduled_date, template_id?, status }
PUT /sessions/:id → { status, started_at, ended_at, notes }
DELETE /sessions/:id

### Session Sets

POST /sessions/:sessionId/sets → { exercise_id, set_index, reps, weight_kg, duration_sec, is_warmup }
PUT /sessions/:sessionId/sets/:id
DELETE /sessions/:sessionId/sets/:id

### Stats

GET /stats/exercise/:exerciseId → historique poids max par date (progression)
GET /stats/volume → volume total par semaine (query: ?weeks=12)
GET /stats/frequency → nb séances par semaine sur N semaines
GET /stats/prs → liste des records personnels par exercice

---

## Comportements métier importants

1. À chaque création d'un session_set avec weight_kg + reps renseignés,
   comparer avec le max historique pour cet exercice (même user).
   Si c'est un nouveau record → is_pr = true sur la ligne.

2. L'endpoint GET /exercises retourne :
   - tous les exercices is_global = true
   - ET les exercices créés par le user connecté (is_global = false)

3. Toutes les routes sauf /auth/\* sont protégées par JWT Guard.

4. Le user_id est toujours extrait du token JWT, jamais du body.

5. Un user ne peut modifier/supprimer que ses propres ressources
   (sessions, templates, exercices custom). Retourner 403 sinon.

---

## Docker Compose

Générer un docker-compose.yml avec :

- Service postgres : image postgres:16, port 5432, volume persistant, variables d'env
- Service pgadmin : image dbeaver (ou pgadmin4), port 8080, préconfigurer la connexion
- Service nestjs (optionnel, avec hot-reload via ts-node-dev)
- Fichier .env.example avec toutes les variables nécessaires

---

## Seed data

Créer un fichier seed qui insère une liste d'exercices globaux (is_global = true) couvrant les grands groupes musculaires :

- Chest : Bench Press, Incline Dumbbell Press, Cable Fly
- Back : Pull-up, Barbell Row, Lat Pulldown, Seated Cable Row
- Shoulders : Overhead Press, Lateral Raise, Face Pull
- Biceps : Barbell Curl, Hammer Curl
- Triceps : Tricep Pushdown, Skull Crusher, Dips
- Legs : Squat, Romanian Deadlift, Leg Press, Leg Curl, Calf Raise
- Core : Plank, Crunch, Hanging Leg Raise
- Cardio : Running, Cycling, Jump Rope

---

## À générer

1. Structure complète du projet NestJS
2. Toutes les entités TypeORM
3. Tous les modules / services / controllers / DTOs
4. Guards JWT + stratégie Passport
5. docker-compose.yml + .env.example
6. Script de seed
7. README avec les commandes pour démarrer le projet
