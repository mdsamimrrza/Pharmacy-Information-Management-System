# PIMS Backend

Backend service for the Pharmacy Information Management System (PIMS).

## Overview

This service exposes secure REST APIs for:

- Authentication and role-based access control (RBAC)
- WHO ATC drug classification and search
- Patients and prescriptions
- Inventory tracking, low-stock and expiry alerts
- Reports and operational analytics
- PDF prescription generation and email flows

Architecture: MVC + service layer.

## Backend Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Node.js | v20 LTS | Runtime |
| Express.js | ^4.x | API framework |
| MongoDB | ^7.x | Primary database |
| Mongoose | ^8.x | ODM |
| jsonwebtoken | ^9.x | JWT issue/verify |
| bcryptjs | ^2.x | Password hashing |
| Puppeteer | ^22.x | Prescription PDF generation |
| Nodemailer | ^6.x | Invite/share email delivery |
| node-cron | ^3.x | Scheduled checks |
| cors | ^2.x | Cross-origin support |
| dotenv | ^16.x | Environment loading |
| express-validator | ^7.x | Request validation |
| helmet | ^7.x | Security headers |
| morgan | ^1.x | HTTP request logging |

## Planned Folder Structure (Reference)

```text
/backend
|
├── /src
│   ├── /config
│   │   ├── db.js
│   │   └── env.js
│   ├── /models
│   │   ├── User.model.js
│   │   ├── ATCCode.model.js
│   │   ├── Medicine.model.js
│   │   ├── Patient.model.js
│   │   ├── Prescription.model.js
│   │   ├── Inventory.model.js
│   │   └── Alert.model.js
│   ├── /controllers
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── atc.controller.js
│   │   ├── medicine.controller.js
│   │   ├── patient.controller.js
│   │   ├── prescription.controller.js
│   │   ├── inventory.controller.js
│   │   └── alert.controller.js
│   ├── /services
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── atc.service.js
│   │   ├── medicine.service.js
│   │   ├── patient.service.js
│   │   ├── prescription.service.js
│   │   ├── inventory.service.js
│   │   ├── alert.service.js
│   │   └── pdf.service.js
│   ├── /routes
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── atc.routes.js
│   │   ├── medicine.routes.js
│   │   ├── patient.routes.js
│   │   ├── prescription.routes.js
│   │   ├── inventory.routes.js
│   │   └── alert.routes.js
│   ├── /middlewares
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   └── error.middleware.js
│   ├── /validators
│   │   ├── auth.validator.js
│   │   ├── prescription.validator.js
│   │   └── user.validator.js
│   ├── /utils
│   │   ├── generateToken.js
│   │   ├── responseHandler.js
│   │   ├── constants.js
│   │   └── emailTemplates.js
│   ├── /jobs
│   │   ├── expiryCheck.job.js
│   │   ├── lowStockCheck.job.js
│   │   └── seedATC.js
│   ├── /data
│   │   └── atc_codes.csv
│   ├── app.js
│   └── server.js
|
├── package.json
└── .env
```

## Request Flow

```text
HTTP Request
  -> cors / helmet / morgan (app.js)
  -> express.json()
  -> auth.middleware.js (JWT verify)
  -> role.middleware.js (RBAC)
  -> express-validator rules
  -> controller
  -> service
  -> model (Mongoose)
  -> responseHandler.sendSuccess()
```

## RBAC and Auth

JWT header format:

```text
Authorization: Bearer <token>
```

Role access summary:

| Role | Access |
|---|---|
| ADMIN | Full system, users, reports |
| DOCTOR | Patients, prescriptions, ATC workflows |
| PHARMACIST | Inventory, alerts, prescription fulfillment |

Feature matrix (reference):

| Feature | DOCTOR | PHARMACIST | ADMIN |
|---|:---:|:---:|:---:|
| View own dashboard | Yes | Yes | Yes |
| Create prescription | Yes | No | No |
| View ATC tree | Yes | Yes | Yes |
| View prescription list | Yes | Yes | No |
| Update prescription status | No | Yes | No |
| Manage inventory | No | Yes | No |
| Acknowledge alerts | No | Yes | Yes |
| Manage users | No | No | Yes |
| View reports | No | No | Yes |
| Seed/sync ATC data | No | No | Yes |

## Data Models (MongoDB)

Collections used by the backend:

- users
- atccodes
- medicines
- patients
- prescriptions
- inventory
- alerts

Model fields include:

- `User`: name, email, password hash, role, status, last login
- `ATCCode`: code, name, level, parent code, description
- `Medicine`: generic/brand, ATC code, strength, dosage form, pricing
- `Patient`: patientId, demographics, allergies, history
- `Prescription`: patient/doctor refs, items, status, urgency, signature, pdfUrl
- `Inventory`: medicine ref, stock, threshold, expiry, storage, status
- `Alert`: type, severity, medicine ref, message, acknowledgement state

## API Routes Reference

### Auth (`/api/auth`)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | /login | No | Public | Validate credentials, return JWT |
| POST | /logout | Yes | Any | Client clears token |
| GET | /me | Yes | Any | Current user profile |

### Users (`/api/users`)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | / | Yes | ADMIN | List users |
| POST | / | Yes | ADMIN | Create user and send invite |
| PUT | /:id | Yes | ADMIN | Update role/status |
| DELETE | /:id | Yes | ADMIN | Soft delete/deactivate |

### ATC (`/api/atc`)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | /tree | Yes | DOCTOR, ADMIN | Tree levels 1-3 |
| GET | /:code | Yes | DOCTOR, ADMIN | Node + children |
| GET | /search | Yes | DOCTOR | Search by `q` |

### Medicines (`/api/medicines`)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | / | Yes | Any auth | List/filter medicines |
| GET | /:id | Yes | Any auth | Single medicine |
| POST | / | Yes | ADMIN | Create medicine |
| PUT | /:id | Yes | ADMIN | Update medicine |

### Patients (`/api/patients`)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | / | Yes | DOCTOR | Search by name/patientId |
| GET | /:id | Yes | DOCTOR | Patient detail |
| POST | / | Yes | DOCTOR | Create patient |

### Prescriptions (`/api/prescriptions`)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | / | Yes | DOCTOR, PHARMACIST | List with filters |
| POST | / | Yes | DOCTOR | Create and submit |
| GET | /:id | Yes | DOCTOR, PHARMACIST | Detail |
| PUT | /:id/status | Yes | PHARMACIST | Update status |
| GET | /:id/pdf | Yes | DOCTOR, PHARMACIST | Generate PDF |

### Inventory (`/api/inventory`)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | / | Yes | PHARMACIST | List/filter inventory |
| POST | / | Yes | PHARMACIST | Add stock |
| PUT | /:id | Yes | PHARMACIST | Update stock/batch |
| GET | /audit | Yes | ADMIN | Full audit log |

### Alerts (`/api/alerts`)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | / | Yes | PHARMACIST | Active alerts |
| PUT | /:id/acknowledge | Yes | PHARMACIST | Mark acknowledged |
| PUT | /:id/dismiss | Yes | PHARMACIST | Dismiss warning |

### Reports (`/api/reports`)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | /summary | Yes | ADMIN | Rx volume, value, uptime |
| GET | /atcUsage | Yes | ADMIN | Top ATC usage |
| GET | /fulfillment | Yes | ADMIN | Dispensing performance |

## Business Logic Highlights

- Prescription lifecycle: Pending -> Processing -> Filled.
- On dispense, stock is deducted for each medicine item.
- If stock drops below threshold, LOW_STOCK CRITICAL alert is generated.
- Expiry checks create NEAR_EXPIRY WARNING alerts (< 30 days).
- Expired stock creates EXPIRED CRITICAL alerts.
- Optional interaction checks can return Clear/Warning/Critical before finalizing Rx.

## Background Jobs

- `expiryCheck.job.js`: cron `0 0 * * *` (daily midnight).
- `lowStockCheck.job.js`: cron `0 */6 * * *` (every 6 hours).
- `seedATC.js`: one-time seed script for ATC CSV.

## ATC Dataset and Seeding

Recommended ATC source:

- https://github.com/fabkury/atcd

Seed flow:

```bash
cd Backend
# place CSV in Backend/src/data/atc_codes.csv
node src/jobs/seedATC.js
```

## Environment Variables

Create `Backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pims?retryWrites=true&w=majority

# JWT
JWT_SECRET=minimum_32_character_random_string_here
JWT_EXPIRES_IN=7d

# SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourapp@gmail.com
SMTP_PASS=xxxx_xxxx_xxxx_xxxx

# Puppeteer
PUPPETEER_EXECUTABLE_PATH=

# CORS
CLIENT_URL=http://localhost:5173
```

Do not commit secrets.

## Setup and Run

```bash
cd Backend
npm install
cp .env.example .env

# one-time ATC seed
node src/jobs/seedATC.js

npm run dev
```

Default local URL: http://localhost:5000

Health check endpoint: `GET /api/health` should return `{ "status": "ok" }`.

## Quick Commands

```bash
cd Backend
npm run dev
npm run start
npm run seed:atc
npm run seed:users
```

## Development Rules

- Keep controllers thin.
- Put business logic in services.
- Keep DB access out of controllers.
- Keep request validation in validators.
