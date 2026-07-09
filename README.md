# LiftLog

Application de suivi d'entraînement (musculation) : séances, templates, statistiques de progression, favoris.

Monorepo composé de :

- **`api/`** — backend [NestJS](https://nestjs.com/) + [TypeORM](https://typeorm.io/) + PostgreSQL
- **`web/`** — frontend [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/), déployé sur [Cloudflare Workers](https://workers.cloudflare.com/)

---

## Stack technique

### Backend (`api/`)

- NestJS 11, TypeORM 0.3, PostgreSQL
- Auth JWT (access + refresh token) via `@nestjs/jwt` / `passport-jwt`
- Validation via `class-validator` / `class-transformer`
- Documentation API via Swagger (`@nestjs/swagger`)

### Frontend (`web/`)

- React 19 + Vite + TypeScript
- Routing : `react-router-dom`
- Data fetching : `@tanstack/react-query` + `openapi-fetch` (client typé généré depuis le schéma OpenAPI du backend)
- State global : `zustand`
- UI : Tailwind CSS v4, shadcn/ui, `@base-ui/react`, `lucide-react`
- Formulaires : `react-hook-form` + `zod`
- i18n : `i18next` / `react-i18next` (fr/en)
- Graphiques : `recharts`
- Déploiement : Cloudflare Workers (`wrangler`)

Architecture front détaillée dans [`web/ARCHITECTURE.md`](web/ARCHITECTURE.md) (séparation `shared/` vs `views/`, inspirée DDD).

---

## Prérequis

- Node.js 20+
- Docker + Docker Compose (pour PostgreSQL)

---

## Installation

### 1. Variables d'environnement

```bash
cp .env.example .env
```

Renseigner dans `.env` :

| Variable                 | Description                              |
| ------------------------ | ---------------------------------------- |
| `DATABASE_HOST`          | Host PostgreSQL (`localhost` en local)   |
| `DATABASE_PORT`          | Port PostgreSQL (défaut `5432`)          |
| `DATABASE_USER`          | Utilisateur PostgreSQL                   |
| `DATABASE_PASSWORD`      | Mot de passe PostgreSQL                  |
| `DATABASE_NAME`          | Nom de la base                           |
| `JWT_ACCESS_SECRET`      | Secret du token d'accès                  |
| `JWT_ACCESS_EXPIRES_IN`  | Durée de vie du token d'accès (ex. `8h`) |
| `JWT_REFRESH_SECRET`     | Secret du refresh token                  |
| `JWT_REFRESH_EXPIRES_IN` | Durée de vie du refresh token (ex. `7d`) |
| `PORT`                   | Port du serveur NestJS (défaut `3000`)   |
| `PGADMIN_EMAIL`          | Email de connexion pgAdmin               |
| `PGADMIN_PASSWORD`       | Mot de passe pgAdmin                     |

### 2. Base de données

```bash
docker compose up -d
```

Démarre PostgreSQL (`localhost:5432`) et pgAdmin (`localhost:8080`).

### 3. Backend

```bash
cd api
npm install
npm run migration:run   # applique les migrations TypeORM
npm run seed             # (optionnel) seed des exercices par défaut
npm run start:dev
```

API disponible sur `http://localhost:3000`, doc Swagger sur `http://localhost:3000/api`.

### 4. Frontend

```bash
cd web
npm install
npm run dev
```

App disponible sur `http://localhost:5173`.

---

## Scripts utiles

### `api/`

| Commande                     | Description                                       |
| ---------------------------- | ------------------------------------------------- |
| `npm run start:dev`          | Démarre l'API en mode watch                       |
| `npm run build`              | Build de production (`dist/`)                     |
| `npm run start:prod`         | Démarre l'API buildée                             |
| `npm run migration:generate` | Génère une migration TypeORM à partir des entités |
| `npm run migration:run`      | Applique les migrations en attente                |
| `npm run seed`               | Seed la table des exercices                       |

### `web/`

| Commande                 | Description                                                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `npm run dev`            | Démarre le serveur de dev Vite                                                                              |
| `npm run build`          | Build de production (`tsc -b && vite build`)                                                                |
| `npm run lint`           | Lint ESLint                                                                                                 |
| `npm run preview`        | Build + preview via `wrangler dev`                                                                          |
| `npm run generate:types` | Régénère `src/shared/api/schema.d.ts` depuis le schéma OpenAPI de l'API (nécessite l'API démarrée en local) |
| `npm run deploy`         | Build + déploiement sur Cloudflare Workers (`wrangler deploy`)                                              |

---

## Fonctionnalités principales

- Authentification (inscription / connexion, tokens JWT access + refresh)
- Gestion des exercices (catalogue + admin)
- Séances d'entraînement (`workout-sessions`) avec séries (`session-sets`)
- Templates de séances réutilisables (`workout-templates`)
- Favoris d'exercices
- Statistiques de progression (calendrier, records, courbes)
- Back-office admin (utilisateurs, exercices, templates)
- Préférences utilisateur (thème clair/sombre, langue)

---

## Structure du dépôt

```
liftlog/
├── api/                    Backend NestJS
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── exercises/
│   │   ├── favorites/
│   │   ├── workout-sessions/
│   │   ├── session-sets/
│   │   ├── workout-templates/
│   │   ├── stats/
│   │   └── common/
│   ├── migrations/
│   └── seeds/
│
├── web/                    Frontend React
│   └── src/
│       ├── shared/         Code transversal (api, components, hooks, store, i18n...)
│       └── views/          Une vue = un domaine fonctionnel (sessions, templates, stats, admin, auth)
│
├── docker-compose.yml      PostgreSQL + pgAdmin
└── .env.example
```

---
