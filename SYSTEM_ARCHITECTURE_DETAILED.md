    # PIMS End-to-End Detailed Architecture

    ## 1. Purpose and Scope

    This document describes the current implemented architecture of PIMS (Pharmacy Information Management System), from frontend UX routing to backend APIs, domain models, security, background jobs, and runtime deployment assumptions.

    It is based on the live codebase in this workspace (Frontend + Backend), not only planned designs.

    ---

    ## 2. System Context

    PIMS is a role-based web platform for managing:

    - ATC classification lookup
    - Prescription lifecycle (create, process, fulfill)
    - Pharmacy inventory and alerts
    - User and access administration
    - Patient-facing read access and summary reporting

    ### Supported roles

    - DOCTOR
    - PHARMACIST
    - ADMIN
    - PATIENT

    ---

    ## 3. High-Level Architecture

    ```mermaid
    flowchart LR
    U[Browser Client] --> F[React + Vite Frontend]
    F -->|HTTPS/JSON| B[Express API Backend]
    B --> M[(MongoDB via Mongoose)]
    B --> O[(File Outbox for Emails)]
    B --> J[Background Jobs]
    J --> M
    J --> O
    ```

    ### Runtime boundaries

    - Frontend runs as SPA in browser.
    - Backend runs as Node.js process exposing REST APIs under /api.
    - MongoDB persists all core entities.
    - Email is currently file-outbox mode in development.
    - Background jobs run in backend process (can be disabled by env).

    ---

    ## 4. Repository Layout

    ### Root

    - README.md
    - SYSTEM_ARCHITECTURE_DETAILED.md
    - Frontend/
    - Backend/

    ### Frontend (actual modules)

    - src/main.jsx (app bootstrap)
    - src/App.jsx (session hydration + top-level routes)
    - src/routes/AppRoutes.jsx (route map)
    - src/routes/ProtectedRoute.jsx (RBAC guard)
    - src/layouts/MainLayout.jsx
    - src/layouts/PatientLayout.jsx
    - src/layouts/AuthLayout.jsx
    - src/pages/* (role pages, login/access pages, dashboards)
    - src/store/store.js
    - src/store/slices/* (auth, inventory, alerts, admin users, prescriptions, toast)
    - src/api/pimsApi.js (axios client + API methods)
    - src/utils/session.js (session persistence)
    - src/utils/adminAccess.js (admin pre-login gate)
    - src/styles/global.css (global visual system)

    ### Backend (actual modules)

    - src/server.js (startup orchestration)
    - src/app.js (express app config)
    - src/config/env.js (env validation)
    - src/config/db.js (mongoose connection)
    - src/routes/*.js (API route modules)
    - src/controllers/*.js (HTTP adapter layer)
    - src/services/*.js (business logic)
    - src/models/*.js (mongoose schemas)
    - src/middlewares/*.js (auth, role, errors)
    - src/validators/*.js (request validation)
    - src/jobs/*.js (scheduled checks and seed scripts)
    - outbox/ (email payload artifacts in file mode)

    ---

    ## 5. Frontend Detailed Design

    ## 5.1 Bootstrapping and Providers

    - Entry: src/main.jsx
    - Providers:
    - Redux Provider with store
    - BrowserRouter
    - Global styles loaded from src/styles/global.css

    ## 5.2 Top-level Application Lifecycle

    Entry logic in src/App.jsx:

    1. Hydrates auth session from local storage via hydrateAuthSession thunk.
    2. Registers a global listener for SESSION_EXPIRED_EVENT (raised by axios interceptor on 401).
    3. On session expiry:
    - Clears auth state
    - Pushes warning toast
    - Redirects to login path
    4. Handles auth checking state with a transient full-page loader.

    ## 5.3 Frontend Routing Topology

    Routing is split across src/App.jsx and src/routes/AppRoutes.jsx.

    ### Public and auth-adjacent routes

    - /doctor/access
    - /doctor/login
    - /pharmacist/access
    - /pharmacist/login
    - /patient/access
    - /patient/login
    - /admin/access (pre-login key gate)
    - /admin/login
    - /forgot-password
    - /reset-password

    ### Protected role routes

    - DOCTOR:
    - /dashboard
    - /atc (also ADMIN)
    - /prescription/new
    - /prescriptions (also PHARMACIST)
    - /change-password
    - PHARMACIST:
    - /pharmacist
    - /inventory
    - /alerts
    - /prescriptions
    - /change-password
    - ADMIN:
    - /admin
    - /admin/users
    - /reports
    - /inventory/audit
    - /atc
    - /change-password
    - PATIENT:
    - /patient
    - /patient/change-password

    ### Route guard behavior

    ProtectedRoute enforces:

    - token presence in Redux
    - valid role from Redux or persisted session
    - allowedRoles check
    - redirect fallback to role home path when blocked

    ## 5.4 Session and Auth State Design

    Session storage keys in src/utils/session.js:

    - pims_token
    - pims_role
    - pims_user
    - pims_remember

    Key flows:

    - setAuthSession(): persists token/user/role
    - hydrateAuthSession(): validates token by calling /auth/me
    - clearSession(): removes auth artifacts

    Role home mapping:

    - PATIENT -> /patient
    - PHARMACIST -> /pharmacist
    - ADMIN -> /admin
    - DOCTOR -> /dashboard

    ## 5.5 Admin Login Privacy Gate

    Admin login has an additional frontend gate in src/utils/adminAccess.js + src/pages/AdminAccess.jsx:

    - Route /admin/access requires a configured VITE_ADMIN_LOGIN_KEY check.
    - On success, short-lived sessionStorage grant is created.
    - Failed attempts are tracked in sessionStorage.
    - Lockout policy:
    - max attempts: 5
    - lockout window: 5 minutes
    - access grant TTL: 10 minutes

    This is a UX-level hardening layer before /admin/login.

    ## 5.6 API Client Architecture

    Single axios client in src/api/pimsApi.js:

    - baseURL from VITE_API_BASE_URL (fallback http://localhost:5000/api)
    - request interceptor injects Bearer token
    - response interceptor catches 401:
    - clears session
    - dispatches browser event pims:session-expired

    API module exports typed helpers by domain:

    - auth: login, logout, getCurrentUser, forgot/reset/change password
    - users: listUsers, createUser
    - patients: listPatients, createPatient, getMyPatientRecord, createPatientPortalAccount
    - prescriptions: list/create/get/updateStatus/downloadPdf
    - inventory: list/create/update/audit
    - alerts: list/acknowledge/dismiss
    - reports: summary, atc usage, fulfillment, patient summary
    - atc: tree/search/node

    ## 5.7 State Management

    Redux Toolkit store slices:

    - authSlice
    - inventorySlice
    - alertsSlice
    - prescriptionsSlice
    - adminUsersSlice
    - toastSlice

    Pattern:

    - async thunks call pimsApi.js
    - global toasts communicate success/error
    - session hydration resolves anonymous vs authenticated bootstrap state

    ## 5.8 UI and Layout Design

    Layout system:

    - MainLayout for doctor/pharmacist/admin
    - PatientLayout for patient-only pages
    - AuthLayout for login/access/password recovery screens

    Styling:

    - Tailwind v4 package installed
    - Global visual language is CSS-driven via src/styles/global.css
    - Gradient and surface design tokens now centralized at global level

    ---

    ## 6. Backend Detailed Design

    ## 6.1 Startup Sequence

    Defined in src/server.js:

    1. Load environment from Backend/.env
    2. validateEnv() mandatory keys check
    3. connectDatabase() via mongoose
    4. startBackgroundJobs()
    5. listen on PORT (default 5000)

    ## 6.2 Express App Pipeline

    Defined in src/app.js middleware order:

    1. cors()
    2. helmet()
    3. morgan('dev')
    4. express.json()
    5. /api router
    6. notFound middleware
    7. errorHandler middleware

    ## 6.3 Routing and Layered Pattern

    Each backend module follows:

    - route -> validator -> middleware -> controller -> service -> model

    ### API root

    - /api/health
    - /api/auth
    - /api/users
    - /api/atc
    - /api/medicines
    - /api/patients
    - /api/prescriptions
    - /api/inventory
    - /api/alerts
    - /api/reports

    ## 6.4 Authentication and Authorization

    ### Token verification

    src/middlewares/auth.middleware.js:

    - reads Authorization: Bearer token
    - verifies JWT signature
    - resolves user from DB
    - ensures user is active
    - invalidates token issued before passwordChangedAt
    - attaches req.user and req.auth payload

    ### Role enforcement

    src/middlewares/role.middleware.js:

    - requireRole(...roles)
    - returns 403 Forbidden on mismatch

    ## 6.5 Validation Strategy

    Per-domain validators (src/validators/*.js) run before controller logic.
    This minimizes invalid payload propagation and keeps service layer focused on business rules.

    ## 6.6 Standard Response Contract

    src/utils/responseHandler.js:

    - sendSuccess(res, data, message, statusCode)
    - sendError(res, message, statusCode, errors)

    Shape:

    - success: boolean
    - message: string
    - data or errors payload

    Error middleware centralizes unhandled exceptions into this shape.

    ---

    ## 7. Domain Data Model and Relationships

    ## 7.1 Core entities

    ### User

    - firstName, lastName, email (unique)
    - passwordHash
    - role: DOCTOR | PHARMACIST | ADMIN | PATIENT
    - isActive
    - security fields: reset token hash/expiry, passwordChangedAt

    ### Patient

    - patientId (unique business id)
    - name, dob, gender
    - userId (optional portal link, unique sparse)
    - allergies[], medicalHistory[]

    ### Medicine

    - name, genericName, brand
    - atcCode
    - strength, dosageForm
    - manufacturer, mrp

    ### Inventory

    - medicineId ref
    - atcCode, batchId
    - currentStock, threshold
    - expiryDate, storage
    - status: STABLE | LOW STOCK | NEAR EXPIRY | EXPIRED

    ### Prescription

    - rxId (unique)
    - patientId ref, doctorId ref
    - diagnosis
    - items[] (medicine link, atcCode, dose, frequency, route, duration, instructions)
    - status: Pending | Processing | Filled | Cancelled
    - urgency/refill/signature/pdf metadata

    ### Alert

    - type: LOW_STOCK | NEAR_EXPIRY | EXPIRED
    - severity: CRITICAL | WARNING | INFO
    - medicineId ref
    - message
    - acknowledgement fields

    ### ATCCode

    - code (unique)
    - name
    - level (1..5)
    - parentCode
    - description

    ## 7.2 Logical relationships

    ```mermaid
    erDiagram
    USER ||--o{ PRESCRIPTION : "doctorId"
    PATIENT ||--o{ PRESCRIPTION : "patientId"
    USER ||--o| PATIENT : "portal userId"
    MEDICINE ||--o{ INVENTORY : "medicineId"
    MEDICINE ||--o{ ALERT : "medicineId"
    MEDICINE ||--o{ PRESCRIPTION : "via items.medicineId"
    ATCCODE ||--o{ MEDICINE : "atcCode"
    ATCCODE ||--o{ INVENTORY : "atcCode"
    ATCCODE ||--o{ PRESCRIPTION : "items.atcCode"
    ```

    ---

    ## 8. API and RBAC Matrix (Current)

    ## 8.1 Auth

    - POST /api/auth/setup-admin (public bootstrap)
    - POST /api/auth/login (public)
    - POST /api/auth/forgot-password (public)
    - POST /api/auth/reset-password (public)
    - PUT /api/auth/change-password (authenticated)
    - POST /api/auth/logout (authenticated)
    - GET /api/auth/me (authenticated)

    ## 8.2 Users (admin only)

    - GET /api/users
    - POST /api/users
    - GET /api/users/:id
    - PUT /api/users/:id
    - DELETE /api/users/:id

    ## 8.3 Patients

    - GET /api/patients/me (PATIENT)
    - GET /api/patients (DOCTOR, ADMIN)
    - POST /api/patients (DOCTOR)
    - POST /api/patients/:id/portal-account (ADMIN)
    - GET /api/patients/:id (DOCTOR, ADMIN)

    ## 8.4 Prescriptions

    - GET /api/prescriptions (DOCTOR, PHARMACIST, PATIENT)
    - POST /api/prescriptions (DOCTOR)
    - GET /api/prescriptions/:id/pdf (DOCTOR, PHARMACIST, PATIENT)
    - GET /api/prescriptions/:id (DOCTOR, PHARMACIST, PATIENT)
    - PUT /api/prescriptions/:id/status (PHARMACIST)

    ## 8.5 Inventory

    - GET /api/inventory/audit (ADMIN)
    - GET /api/inventory (PHARMACIST)
    - POST /api/inventory (PHARMACIST)
    - PUT /api/inventory/:id (PHARMACIST)

    ## 8.6 Alerts

    - GET /api/alerts
    - PUT /api/alerts/:id/acknowledge
    - PUT /api/alerts/:id/dismiss

    Notes:

    - Route file currently does not show role middleware in alert routes.
    - Access behavior should be verified and tightened if needed.

    ## 8.7 Reports

    - GET /api/reports/summary (ADMIN)
    - GET /api/reports/atcUsage (ADMIN)
    - GET /api/reports/fulfillment (ADMIN)
    - GET /api/reports/patient-summary (PATIENT)

    ## 8.8 ATC and Medicines

    - /api/atc/tree, /api/atc/search, /api/atc/:code
    - /api/medicines CRUD (write operations are ADMIN-only)

    ---

    ## 9. End-to-End Business Flows

    ## 9.1 Doctor prescription creation flow

    1. Doctor authenticates from /doctor/login.
    2. Frontend stores token/user in localStorage.
    3. Doctor accesses /prescription/new.
    4. Frontend loads patients and ATC/medicine catalogs through API client.
    5. POST /api/prescriptions creates Rx with item list and patient linkage.
    6. Prescription becomes visible to pharmacist queue endpoints.

    ## 9.2 Pharmacist dispensing flow

    1. Pharmacist authenticates at /pharmacist/login.
    2. Reads pending prescriptions via GET /api/prescriptions.
    3. Checks inventory via GET /api/inventory.
    4. Updates fulfillment via PUT /api/prescriptions/:id/status.
    5. Inventory updates may trigger alert generation logic.

    ## 9.3 Patient self-service flow

    1. Patient authenticates at /patient/login.
    2. Reads own profile via GET /api/patients/me.
    3. Reads own Rx list via GET /api/prescriptions.
    4. Reads own report summary via GET /api/reports/patient-summary.

    ## 9.4 Admin governance flow

    1. Accesses /admin/access and passes key gate.
    2. Logs in at /admin/login.
    3. Manages users in /admin/users via /api/users APIs.
    4. Monitors reports and inventory audit endpoints.

    ## 9.5 Password recovery flow

    1. Public user submits email to /api/auth/forgot-password.
    2. Backend writes reset payload to outbox (file mode).
    3. User submits token/code + new password to /api/auth/reset-password.
    4. passwordChangedAt invalidates old JWTs automatically.

    ---

    ## 10. Background Jobs and Operational Behavior

    Job bootstrap in src/jobs/index.js:

    - startLowStockCheckJob()
    - startExpiryCheckJob()

    Behavior:

    - Jobs run at startup and recurring interval.
    - Can be disabled with ENABLE_BACKGROUND_JOBS=false.
    - Job outputs can influence alerts and operational visibility.

    ---

    ## 11. Security Architecture

    Current controls:

    - JWT authentication for protected APIs
    - Role-based middleware at route level
    - Password hashing (auth service path)
    - Password change invalidates older JWTs
    - Helmet + CORS + JSON parser hardening
    - Frontend 401 interceptor clears stale sessions
    - Admin login pre-gate with lockout in frontend

    Security notes:

    - Frontend admin key is UX obfuscation, not a backend authorization boundary.
    - Real authorization remains backend role checks.
    - Consider adding rate limiting and login attempt controls server-side.

    ---

    ## 12. Configuration and Environment

    ## 12.1 Frontend

    - VITE_API_BASE_URL
    - VITE_ADMIN_LOGIN_KEY

    ## 12.2 Backend required

    - PORT
    - NODE_ENV
    - MONGO_URI
    - JWT_SECRET
    - JWT_EXPIRES_IN
    - CLIENT_URL
    - ADMIN_SETUP_TOKEN

    ## 12.3 Backend optional

    - ENABLE_BACKGROUND_JOBS
    - LOW_STOCK_JOB_INTERVAL_MS
    - EXPIRY_JOB_INTERVAL_MS
    - EMAIL_MODE
    - EMAIL_OUTBOX_DIR
    - PHARMACY_NOTIFICATION_EMAIL

    ---

    ## 13. Deployment View (Recommended)

    ```mermaid
    flowchart TB
    subgraph Browser
        SPA[React SPA]
    end

    subgraph AppServer
        API[Node Express API]
        JOB[Job Runner in same process]
    end

    subgraph Data
        MDB[(MongoDB)]
        OUT[(Outbox Files)]
    end

    SPA --> API
    API --> MDB
    API --> OUT
    JOB --> MDB
    JOB --> OUT
    ```

    Production notes:

    - Prefer process manager (pm2/systemd/container) for backend.
    - Use managed MongoDB with backups.
    - Terminate TLS at reverse proxy/load balancer.
    - Keep frontend and backend envs separate.

    ---

    ## 14. Architecture Strengths and Gaps

    ## 14.1 Strengths

    - Clear separation of route/controller/service/model layers.
    - Consistent response envelope and centralized error handling.
    - Strong role-aware route partitioning frontend and backend.
    - Good session invalidation semantics after password changes.
    - Modular API client and Redux slice organization.

    ## 14.2 Gaps and recommended next steps

    - Add backend rate limiting and auth throttling middleware.
    - Add API versioning strategy (/api/v1).
    - Expand observability (structured logs, request ids, metrics).
    - Add OpenAPI spec generation for contract governance.
    - Add explicit backend role guard for any alert endpoints not yet gated.
    - Consider refresh-token strategy for long-running sessions.

    ---

    ## 15. Quick Traceability Index

    Frontend key entrypoints:

    - src/main.jsx
    - src/App.jsx
    - src/routes/AppRoutes.jsx
    - src/routes/ProtectedRoute.jsx
    - src/api/pimsApi.js
    - src/store/slices/authSlice.js
    - src/utils/session.js
    - src/utils/adminAccess.js

    Backend key entrypoints:

    - src/server.js
    - src/app.js
    - src/routes/index.js
    - src/middlewares/auth.middleware.js
    - src/middlewares/role.middleware.js
    - src/models/*.js
    - src/jobs/index.js

    This index is intended for onboarding and debugging handoff.
