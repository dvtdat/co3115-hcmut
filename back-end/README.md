# CO3115 HCMUT — Backend API

NestJS REST API with JWT auth and user management. Built for the CO3115 course project at HCMUT.

## Tech Stack

- **Framework:** NestJS 11, Express
- **Language:** TypeScript 5.7
- **ORM:** MikroORM 6.5 (MongoDB driver)
- **Auth:** Passport.js — local strategy, JWT, refresh token
- **Docs:** Swagger (`/api`)

## Setup

```bash
npm install
cp .env.example .env   # fill in required variables
```

## Running

```bash
npm run start:dev      # development (watch mode)
npm run build && npm run start:prod
```

Swagger UI: `http://localhost:3300/api`

## Commands

```bash
npm run lint           # fix ESLint issues
npm run format         # fix formatting
npm run typecheck      # TypeScript type check
npm run pre-push       # lint + typecheck + build
npm run swagger:generate  # generate OpenAPI schema file
```

## Environment Variables

| Variable                 | Required | Purpose                          |
| ------------------------ | -------- | -------------------------------- |
| `DATABASE_URL`           | Yes      | MongoDB connection string        |
| `DATABASE_NAME`          | Yes      | Database name                    |
| `JWT_SECRET`             | Yes      | JWT signing key                  |
| `REFRESH_JWT_SECRET`     | Yes      | Refresh token signing key        |
| `ENCRYPTION_KEY`         | Yes      | AES key for user name encryption |
| `PORT`                   | No       | HTTP port (default: `3300`)      |
| `JWT_EXPIRES_IN`         | No       | JWT expiry (default: `1h`)       |
| `REFRESH_JWT_EXPIRES_IN` | No       | Refresh token expiry             |
| `NGROK_AUTHTOKEN`        | No       | ngrok tunnel (dev only)          |

## API Endpoints

### Auth — `/auth`

| Method | Path            | Auth | Description                    |
| ------ | --------------- | ---- | ------------------------------ |
| POST   | `/auth/login`   | —    | Login → JWT + refresh token    |
| POST   | `/auth/refresh` | —    | Exchange refresh token for JWT |

### Users — `/users`

| Method | Path                  | Auth  | Description              |
| ------ | --------------------- | ----- | ------------------------ |
| POST   | `/users`              | —     | Register                 |
| GET    | `/users`              | Admin | List all users           |
| GET    | `/users/me`           | JWT   | Current user profile     |
| GET    | `/users/:id`          | JWT   | Get user by ID           |
| GET    | `/users/email/:email` | JWT   | Get user by email        |
| PATCH  | `/users/:id`          | JWT   | Update name / password   |
| PATCH  | `/users/:id/status`   | Admin | Activate / deactivate    |
| DELETE | `/users/:id`          | Admin | Soft-delete user         |

## Testing

```bash
npm run test           # unit tests
npm run test:e2e       # e2e tests
npm run test:cov       # coverage report
```
