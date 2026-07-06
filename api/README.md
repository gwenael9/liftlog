# Liftlog — Backend NestJS

API REST pour le suivi de séances de sport. NestJS + TypeORM + PostgreSQL.

## Prérequis

- Node.js 20+
- Docker + Docker Compose

## Démarrage rapide

```bash
# 1. Variables d'environnement
cp .env.example .env
# Éditer .env si besoin (secrets JWT, etc.)

# 2. Démarrer PostgreSQL + pgAdmin
docker compose up -d

# 3. Installer les dépendances
npm install

# 4. Démarrer l'API (hot-reload)
npm run start:dev
```

L'API écoute sur `http://localhost:3000`.

## Seed (exercices globaux)

```bash
npm run seed
```

Insère les exercices globaux (bench press, squat, etc.) si absents.

## Commandes utiles

| Commande               | Description                 |
| ---------------------- | --------------------------- |
| `npm run start:dev`    | Dev avec hot-reload         |
| `npm run build`        | Compilation TypeScript      |
| `npm run start:prod`   | Production (`dist/main`)    |
| `npm run seed`         | Seed exercices globaux      |
| `npm test`             | Tests unitaires             |
| `npm run test:e2e`     | Tests d'intégration         |
| `docker compose up -d` | Démarrer Postgres + pgAdmin |
| `docker compose down`  | Arrêter les services        |

## pgAdmin

URL : `http://localhost:8080`  
Email : valeur de `PGADMIN_EMAIL` (.env)  
Mot de passe : valeur de `PGADMIN_PASSWORD` (.env)

Connexion au serveur Postgres :

- Host : `postgres` (nom du service Docker)
- Port : `5432`
- Database : valeur de `DATABASE_NAME`
- Username : valeur de `DATABASE_USER`

## Variables d'environnement

| Variable                 | Défaut             | Description          |
| ------------------------ | ------------------ | -------------------- |
| `DATABASE_HOST`          | `localhost`        | Host PostgreSQL      |
| `DATABASE_PORT`          | `5432`             | Port PostgreSQL      |
| `DATABASE_USER`          | `liftlog`          | Utilisateur DB       |
| `DATABASE_PASSWORD`      | `liftlog_password` | Mot de passe DB      |
| `DATABASE_NAME`          | `liftlog_db`       | Nom de la base       |
| `JWT_ACCESS_SECRET`      | —                  | Secret token d'accès |
| `JWT_ACCESS_EXPIRES_IN`  | `15m`              | Durée token accès    |
| `JWT_REFRESH_SECRET`     | —                  | Secret refresh token |
| `JWT_REFRESH_EXPIRES_IN` | `7d`               | Durée refresh token  |
| `PORT`                   | `3000`             | Port de l'API        |

## Endpoints

### Auth

```
POST /auth/register    { email, password, display_name }
POST /auth/login       { email, password }  →  { access_token, refresh_token }
POST /auth/refresh     { refresh_token }
```

### Users (JWT requis)

```
GET  /users/me
PUT  /users/me         { display_name, unit_system }
```

### Exercises (JWT requis)

```
GET    /exercises              ?muscle_group=chest
GET    /exercises/:id
POST   /exercises
PUT    /exercises/:id
DELETE /exercises/:id
```

### Workout Templates (JWT requis)

```
GET    /templates
GET    /templates/:id
POST   /templates
PUT    /templates/:id
DELETE /templates/:id
```

### Workout Sessions (JWT requis)

```
GET    /sessions              ?month=2025-05
GET    /sessions/:id
POST   /sessions
PUT    /sessions/:id
DELETE /sessions/:id
```

### Session Sets (JWT requis)

```
POST   /sessions/:sessionId/sets
PUT    /sessions/:sessionId/sets/:id
DELETE /sessions/:sessionId/sets/:id
```

### Favorites (JWT requis)

```
POST   /favorites                          { entity_type, entity_id }  →  ajoute un favori
DELETE /favorites/:entity_type/:entity_id                              →  supprime un favori
GET    /favorites/:entity_type                                         →  liste les entity_ids favoris
```

`entity_type` : valeurs supportées : `template`

### Stats (JWT requis)

```
GET /stats/exercise/:exerciseId    Progression poids max par date
GET /stats/prs                     Records personnels par exercice
GET /stats/activity-dates          Affichage des séances
```

## Tests

```bash
npm test              # Tests unitaires (services, mocks)
npm run test:watch    # Mode watch
npm run test:cov      # Avec couverture
npm run test:e2e      # Tests d'intégration (HTTP + vraie DB Postgres)
```

Les tests unitaires (`*.spec.ts`, à côté du code dans `src/`) mockent les repositories/services, aucune dépendance externe requise.

Les tests d'intégration (`*.e2e-spec.ts` dans `test/`) démarrent l'app Nest complète et tapent sur une vraie base Postgres. Prérequis : `docker compose up -d postgres` (utilise les credentials du `.env` existant). Une base séparée `<DATABASE_NAME>_test` est créée automatiquement si absente (`test/global-setup.ts`) et vidée entre chaque test (`clearDatabase` dans `test/utils/test-app.ts`).

## Base de données

Le schéma est synchronisé automatiquement au démarrage (`synchronize: true` hors production). En production, utiliser des migrations TypeORM.

Pour générer une migration :

```bash
npx typeorm migration:generate -d src/app.module.ts src/migrations/NomDeLaMigration
```
