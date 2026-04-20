# PIMS Backend

Express + MongoDB API for authentication, users, ATC lookup, medicines, patients, prescriptions, inventory, alerts, and reports.

## Stack

- Node.js (ESM)
- Express 4
- MongoDB + Mongoose 8
- JWT (`jsonwebtoken`)
- Security and logging: `helmet`, `cors`, `morgan`
- Dev and testing: `nodemon`, `node:test`, `supertest`, `mongodb-memory-server`

## Project Layout

```text
Backend/
  src/
    app.js
    server.js
    config/
    controllers/
    jobs/
    middlewares/
    models/
    routes/
    services/
    utils/
    validators/
  scripts/
    verify-modules.mjs
  tests/
    integration/
      auth-flow.test.js
      list-endpoints.test.js
```

## Setup

```bash
cd Backend
npm install
cp .env.example .env
npm run dev
```

Health check:

```bash
GET http://localhost:5000/api/health
```

## Environment Variables

Required:

- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_URL`
- `ADMIN_SETUP_TOKEN`

Optional:

- `PORT` (default: `5000`)
- `ENABLE_BACKGROUND_JOBS` (`false` disables interval jobs)
- `LOW_STOCK_JOB_INTERVAL_MS`
- `EXPIRY_JOB_INTERVAL_MS`
- `EMAIL_MODE` (`file` or `disabled`)
- `EMAIL_OUTBOX_DIR` (default: `outbox`)
- `PHARMACY_NOTIFICATION_EMAIL`

### MongoDB Atlas Notes

- Use an Atlas SRV URI format for `MONGO_URI`:
  - `mongodb+srv://<username>:<password>@<cluster-url>/pims?retryWrites=true&w=majority&appName=pims`
- Ensure your current public IP is added in Atlas:
  - Atlas Console -> `Security` -> `Network Access` -> `Add IP Address`
- Ensure the Atlas database user has read/write permissions on the target database.

## Scripts

- `npm run dev` - start with nodemon
- `npm start` - start production process
- `npm test` - run integration tests
- `npm run seed:atc` - seed ATC dataset
- `npm run seed:users` - seed default users
- `npm run verify:modules` - verify core backend modules exist and load

## Authentication

JWT is sent as:

```http
Authorization: Bearer <token>
```

Auth routes:

- `POST /api/auth/setup-admin` - one-time first-admin bootstrap
- `POST /api/auth/login` - login with email, password, and optional role hint
- `GET /api/auth/me` - current authenticated user
- `POST /api/auth/logout` - client-side logout helper
- `POST /api/auth/forgot-password` - request a reset email
- `POST /api/auth/reset-password` - complete password reset using email + token
- `PUT /api/auth/change-password` - change password while logged in

Bootstrap behavior:

- `setup-admin` is allowed only when no admin exists yet.
- The request must include `ADMIN_SETUP_TOKEN`.
- The first admin response includes a JWT so the setup flow can end already signed in.

Password reset behavior:

- Reset requests are accepted even when the email does not exist.
- The backend writes reset instructions to the file outbox in `EMAIL_MODE=file`.
- Reset emails include both a link and a one-time code.
- Password change and password reset both invalidate older JWTs through the password-change timestamp check.

Roles:

- `DOCTOR`
- `PHARMACIST`
- `ADMIN`

## API Modules

All routes are mounted under `/api`.

- `GET /health`
- `POST /auth/setup-admin`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `PUT /auth/change-password`
- `GET/POST/PUT/DELETE /users` (admin-managed)
- `GET /atc/tree`, `GET /atc/search`, `GET /atc/:code`
- `GET/POST/PUT/DELETE /medicines`
- `GET/POST /patients`, `GET /patients/:id`
- `GET/POST /prescriptions`, `GET /prescriptions/:id`, `PUT /prescriptions/:id/status`, `GET /prescriptions/:id/pdf`
- `GET/POST/PUT /inventory`, `GET /inventory/audit`
- `GET /alerts`, `PUT /alerts/:id/acknowledge`, `PUT /alerts/:id/dismiss`
- `GET /reports/summary`, `GET /reports/atcUsage`, `GET /reports/fulfillment`

## List Endpoint Conventions

All list endpoints support query pagination:

- `page` (default `1`)
- `limit` (default `20`, capped per endpoint)

Standard response shape:

```json
{
  "success": true,
  "message": "...",
  "data": {
    "<items>": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "totalPages": 1
    }
  }
}
```

Paginated list endpoints:

- `GET /users`
- `GET /medicines`
- `GET /patients`
- `GET /prescriptions`
- `GET /inventory`
- `GET /alerts`
- `GET /inventory/audit` (returns `items` plus a computed `summary`)

## Background Jobs

Started from `src/server.js` via `startBackgroundJobs()`:

- Low stock checker
- Expiry checker

Each job runs once on startup and then on interval.

## Email and PDF

- Email service writes JSON payloads to `Backend/outbox/` when `EMAIL_MODE=file`.
- Invite emails are used for admin-created users.
- Password reset and password change confirmations also use the file outbox.
- Prescription PDF endpoint returns a generated PDF buffer.

## Tests

Integration tests are in:

- `tests/integration/auth-flow.test.js`
- `tests/integration/list-endpoints.test.js`

Coverage currently validates:

- first-admin bootstrap
- login flow
- admin user creation
- change password
- forgot-password and reset-password flow
- role-protected list access
- pagination and filtering behavior for patients, inventory, alerts, prescriptions

Run:

```bash
npm test
```
