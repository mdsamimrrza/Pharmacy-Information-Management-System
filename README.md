# PIMS — Pharmacy Information Management System

> **Version:** 1.0.0 | **Status:** Active Development | **Last Updated:** April 2026
>
> A role-based, full-stack **web application** for managing ATC-classified prescriptions,
> drug inventory, and pharmacy workflows.
>
> **Stack:** React + Vite + Redux Toolkit + Tailwind CSS (frontend) · Express.js + Node.js (backend) · MongoDB + Mongoose (database)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Roles](#2-system-roles)
3. [Screen Inventory — UI Reference](#3-screen-inventory--ui-reference)
4. [Tech Stack](#4-tech-stack)
5. [ATC Classification](#5-atc-classification)
6. [Full Folder Structure — Frontend](#6-full-folder-structure--frontend)
7. [Full Folder Structure — Backend](#7-full-folder-structure--backend)
8. [Database Models — MongoDB Schemas](#8-database-models--mongodb-schemas)
9. [API Routes Reference](#9-api-routes-reference)
10. [RBAC — Role Based Access Control](#10-rbac--role-based-access-control)
11. [Business Logic](#11-business-logic)
12. [Environment Variables](#12-environment-variables)
13. [Setup & Run Instructions](#13-setup--run-instructions)
14. [MVP Scope — April 2025](#14-mvp-scope--april-2025)
15. [April Sprint Plan](#15-april-sprint-plan)
16. [Dataset Sources & References](#16-dataset-sources--references)
17. [Open Source References](#17-open-source-references)
18. [Viva / Demo Line](#18-viva--demo-line)

---

## 1. Project Overview

PIMS is a role-based healthcare web application that manages prescriptions, medicines,
and inventory using the **WHO ATC (Anatomical Therapeutic Chemical)** classification system.

**Three user roles** interact with the system:

- **Doctor** — creates patient profiles, generates ATC-based prescriptions, views history
- **Pharmacist** — manages drug inventory, monitors stock and expiry, dispenses prescriptions
- **Admin** — manages users, assigns roles, monitors audit logs and system health
- **Patient** — views own prescriptions, medical history, and profile

**Core user journey:**

```
Doctor logs in
  → Searches ATC drug tree
  → Selects drug → Builds prescription
  → Submits to Pharmacy

Pharmacist receives prescription
  → Checks inventory availability
  → Dispenses → Updates stock

Admin monitors
  → Manages users and roles
  → Views reports and system alerts
```

**Platform:** Web App only (React + Vite) — runs in any modern browser.
No mobile app. No desktop app. Web only.

---

## 2. System Roles

| Role          | Dashboard             | Key Access                                              |
|---------------|-----------------------|---------------------------------------------------------|
| `DOCTOR`      | Doctor Dashboard      | Create Rx, search ATC tree, view patient records        |
| `PHARMACIST`  | Pharmacist Dashboard  | Dispense Rx, manage inventory, acknowledge alerts       |
| `ADMIN`       | Admin Dashboard       | Manage users, assign roles, view audit logs and reports |

- Role is **selected at login screen** (Doctor / Pharmacist / Admin card)
- JWT token stores the role
- Every protected route checks the role via `role.middleware.js`

---

## 3. Screen Inventory — UI Reference

> All screens are designed in **Visily**. Each screen below = one task in the backlog.
> Build them in this order.

| #  | Screen Name             | Role        | JSX File to Build        | Key UI Elements                                                            |
|----|-------------------------|-------------|--------------------------|----------------------------------------------------------------------------|
| 1  | Login / Role Select     | All         | `Login.jsx`              | Role picker cards (Doctor / Pharmacist / Admin), email, password, JWT login |
| 2  | Doctor Dashboard        | Doctor      | `DoctorDashboard.jsx`    | Create New Prescription CTA, Patient Lookup, Quick ATC Search bar, Recent Prescriptions table, stat cards (Today's Total, Scheduled, New Patients, Critical Alerts) |
| 3  | Pharmacist Dashboard    | Pharmacist  | `PharmacistDashboard.jsx`| Inventory Health cards (Total SKUs, Low Stock, Expiring Soon, Ready for Pickup), Incoming Prescriptions live feed, Urgent System Alerts panel, Quick Inventory Check search |
| 4  | Admin Dashboard         | Admin       | `AdminDashboard.jsx`     | System stat cards (Active Users, Daily Prescriptions, Inventory Value, Security Score), User Activity Log table, Quick Actions panel, System Health Alerts |
| 5  | ATC Drug Classification | Doctor      | `ATCClassification.jsx`  | Left panel: collapsible classification tree (Level 1 to 5). Right panel: selected node detail (code, clinical notes, matched medicines table with Brand Name / Generic / Strength / Dosage Form) |
| 6  | New Prescription        | Doctor      | `NewPrescription.jsx`    | Patient Info form (name, DOB, gender, allergies), Medicine Picker (search ATC DB), Prescription Items table (dose, frequency, route, duration), Validation Status (Clear/Warning/Critical), Submit to Pharmacy button |
| 7  | Prescription Management | Doctor      | `Prescriptions.jsx`      | Stats bar (Total, Pending Review, Filled Today, Success Rate), Prescriptions table with status filter, Prescription Detail side panel (patient info, medications, clinical notes, history), Print PDF, Share with Pharmacy |
| 8  | Inventory Management    | Pharmacist  | `Inventory.jsx`          | Stats (Total SKUs, Low Stock Alert, Near Expiry, Items in Stock), search + filter bar, Medicine table (Medicine & Manufacturer, ATC Code, Current Stock, Batch ID, Storage, Expiry Status, Actions), Add Medicine button |
| 9  | System Alerts           | Pharmacist  | `Alerts.jsx`             | Summary cards (Critical Alerts, Warning Alerts, Resolution Rate), Critical Low Stock section, Expiring Soon section, Standard Inventory Warnings — each with Acknowledge / Restock actions |
| 10 | Reports & Analytics     | Admin       | `Reports.jsx`            | Date range + ATC category filters, stat cards (Prescription Volume, Inventory Turnover, Fulfillment Speed, System Uptime), Prescription & Revenue Volume line chart, Stock Flow Analysis bar chart, Fulfillment Performance table, Top ATC Usage list |
| 11 | User Management         | Admin       | `UserManagement.jsx`     | System Users table (name, email, role, status, last activity), Create New User modal (first name, last name, email, role assignment, auto-temp-password security protocol) |

---

## 4. Tech Stack

### Frontend

| Technology       | Version | Purpose                                                     |
|------------------|---------|-------------------------------------------------------------|
| React            | ^18.x   | UI component framework                                      |
| Vite             | ^5.x    | Build tool and dev server — fast HMR                        |
| Tailwind CSS     | ^3.x    | Utility-first CSS — all styling done with Tailwind classes  |
| React Router DOM | ^6.x    | Client-side routing and protected routes                    |
| Axios            | ^1.x    | HTTP client for API calls to Express backend                |
| React Hook Form  | ^7.x    | Form state management and validation                        |
| Redux Toolkit    | ^2.x    | Global state management                                     |
| Context API      | built-in| Auth state (user, role, token)                              |

> **No Ant Design / MUI.** All UI built purely with Tailwind CSS utility classes.

### Backend

| Technology        | Version  | Purpose                                           |
|-------------------|----------|---------------------------------------------------|
| Node.js           | v20 LTS  | JavaScript runtime                                |
| Express.js        | ^4.x     | REST API framework                                |
| MongoDB           | ^7.x     | NoSQL database — primary data store               |
| Mongoose          | ^8.x     | MongoDB ODM — schemas, models, queries            |
| jsonwebtoken      | ^9.x     | JWT token generation and verification             |
| bcryptjs          | ^2.x     | Password hashing                                  |
| pdfkit            | ^0.x     | Generates PDF prescriptions natively without headless Chrome |
| Nodemailer        | ^6.x     | Sends Rx email to pharmacy                        |
| node-cron         | ^3.x     | Scheduled jobs — expiry + low stock checks        |
| cors              | ^2.x     | Cross-Origin Resource Sharing                     |
| dotenv            | ^16.x    | Environment variable loading                      |
| express-validator | ^7.x     | Request body validation                           |
| helmet            | ^7.x     | Security headers                                  |
| morgan            | ^1.x     | HTTP request logging in dev                       |

---

## 5. ATC Classification

**ATC = Anatomical Therapeutic Chemical** — the WHO international standard for classifying drugs.

```
Level 1  →  A          Anatomical main group      (Alimentary tract & metabolism)
Level 2  →  A10        Therapeutic subgroup       (Drugs used in diabetes)
Level 3  →  A10B       Pharmacological subgroup   (Blood glucose lowering drugs)
Level 4  →  A10BA      Chemical subgroup          (Biguanides)
Level 5  →  A10BA02    Chemical substance         (Metformin)
```

**How PIMS uses ATC:**

- The ATC tree is stored in the `atccodes` collection in MongoDB
- Doctors browse Level 1 to 5 in screen 5 (ATCClassification.jsx)
- Each medicine in inventory has an `atcCode` field (e.g. `J01CA04`)
- Reports on screen 10 group prescriptions by ATC category
- Inventory table on screen 8 shows ATC code per row

**Dataset sources — where to get the ATC data:**

```
Recommended : github.com/fabkury/atcd
              Pre-scraped CSV · 6,331 ATC codes · All 5 levels · Free · No account needed

Official    : atcddd.fhi.no
              WHO Collaborating Centre · Free with registration · Excel/XML · Updated annually

Kaggle      : kaggle.com/datasets/remulusbi/who-atcddd
              Pre-packaged CSV · Easy download · Free Kaggle account
```

**Seeding the ATC database — P2 does this on Day 1:**

```bash
cd backend
# First: download atc_codes.csv from github.com/fabkury/atcd
# Place it at: backend/src/data/atc_codes.csv
node src/jobs/seedATC.js
# Reads CSV → bulk inserts into MongoDB atccodes collection
# Safe to re-run (idempotent)
```

---

## 6. Full Folder Structure — Frontend

```
/frontend
│
├── /public
│   └── favicon.ico
│
├── /src
│   │
│   ├── /assets
│   │   ├── logo.svg                        # PIMS logo — used in Topbar and Login
│   │   └── /icons                          # Custom SVG icons if needed
│   │
│   ├── /components                         # Reusable UI components — used across multiple pages
│   │   │
│   │   ├── /common
│   │   │   ├── Button.jsx                  # Variants: primary | secondary | danger | ghost
│   │   │   │                               # Uses Tailwind: bg-primary text-white rounded-lg px-4 py-2
│   │   │   ├── Input.jsx                   # Text, password, search with label + error message
│   │   │   ├── Modal.jsx                   # Generic modal wrapper — used for Create User, confirmations
│   │   │   ├── Badge.jsx                   # Status pills: Active | Pending | Filled | Critical | Stable
│   │   │   ├── StatCard.jsx                # Dashboard metric card — icon + big number + label + delta
│   │   │   ├── Table.jsx                   # Reusable table — accepts columns[] + data[] props
│   │   │   ├── Spinner.jsx                 # Loading spinner shown during API calls
│   │   │   └── EmptyState.jsx              # Empty illustration + message when no data
│   │   │
│   │   ├── /layout
│   │   │   ├── Sidebar.jsx                 # Left nav — shows role-appropriate menu links
│   │   │   ├── Topbar.jsx                  # Top bar — quick search, alerts bell, user avatar + role
│   │   │   └── MainLayout.jsx              # Shell: Sidebar (left) + Topbar (top) + <Outlet /> (content)
│   │   │
│   │   ├── /auth
│   │   │   └── RolePicker.jsx              # Three clickable role cards on login screen
│   │   │
│   │   ├── /atc
│   │   │   ├── ATCTreeNode.jsx             # Single collapsible node — renders children recursively
│   │   │   ├── ATCTree.jsx                 # Full tree component — fetches /api/atc/tree on mount
│   │   │   └── ATCDrugDetail.jsx           # Right panel — shows selected ATC node + matched medicines table
│   │   │
│   │   ├── /prescription
│   │   │   ├── MedicinePicker.jsx          # Search input + dropdown results for adding drugs to Rx
│   │   │   ├── PrescriptionItem.jsx        # One row in the prescription items table
│   │   │   └── PrescriptionDetail.jsx      # Side panel in Prescriptions.jsx (screen 7)
│   │   │
│   │   ├── /inventory
│   │   │   ├── InventoryRow.jsx            # One row in inventory table with expiry badge
│   │   │   └── AddMedicineForm.jsx         # Form inside modal to add a new medicine
│   │   │
│   │   └── /alerts
│   │       └── AlertCard.jsx               # Single alert card — name, stock count, Acknowledge/Restock buttons
│   │
│   ├── /pages                              # One file per screen — matches Visily design exactly
│   │   ├── Login.jsx                       # Screen 1  — Role picker + email + password
│   │   ├── DoctorDashboard.jsx             # Screen 2  — Doctor home view
│   │   ├── PharmacistDashboard.jsx         # Screen 3  — Pharmacist home view
│   │   ├── AdminDashboard.jsx              # Screen 4  — Admin home view
│   │   ├── ATCClassification.jsx           # Screen 5  — ATC tree browser + drug detail panel
│   │   ├── NewPrescription.jsx             # Screen 6  — Create new prescription
│   │   ├── Prescriptions.jsx               # Screen 7  — Prescription management list + detail
│   │   ├── Inventory.jsx                   # Screen 8  — Inventory table
│   │   ├── Alerts.jsx                      # Screen 9  — System alerts (low stock + expiry)
│   │   ├── Reports.jsx                     # Screen 10 — Reports and analytics charts
│   │   └── UserManagement.jsx              # Screen 11 — Admin user management
│   │
│   ├── /context                            # React Context API — global state without Redux
│   │   ├── AuthContext.jsx                 # Provides { user, role, token, login(), logout() }
│   │   │                                   # login() calls POST /api/auth/login → stores JWT in localStorage
│   │   └── AlertContext.jsx                # Provides global unread alert count for Topbar bell
│   │
│   ├── /hooks                              # Custom React hooks
│   │   ├── useAuth.js                      # Reads AuthContext → returns { user, role, isAuthenticated }
│   │   ├── useDebounce.js                  # 300ms debounce — used on ATC search and medicine picker
│   │   └── useAlerts.js                    # Polls GET /api/alerts every 60s → updates Topbar badge
│   │
│   ├── /services                           # All Axios API calls — one file per domain
│   │   ├── api.js                          # Axios instance: baseURL from VITE_API_BASE_URL
│   │   │                                   # Interceptor: attaches Authorization: Bearer <token> to every request
│   │   ├── authService.js                  # login(email, password, role) · logout() · getMe()
│   │   ├── atcService.js                   # getTree() · getByCode(code) · search(query)
│   │   ├── medicineService.js              # getAll(filters) · getById(id) · create(data) · update(id,data)
│   │   ├── patientService.js               # search(query) · getById(id) · create(data)
│   │   ├── prescriptionService.js          # getAll(filters) · create(data) · getById(id) · updateStatus(id,s) · getPDF(id)
│   │   ├── inventoryService.js             # getAll(filters) · addStock(data) · updateStock(id,data) · getAuditLog()
│   │   └── alertService.js                 # getAll() · acknowledge(id) · dismiss(id)
│   │
│   ├── /utils
│   │   ├── formatDate.js                   # formatDate('2024-05-20') → 'May 20, 2024'
│   │   ├── formatCurrency.js               # formatCurrency(1200000) → '$1.2M'
│   │   ├── getStatusColor.js               # getStatusColor('NEAR EXPIRY') → Tailwind bg+text class string
│   │   └── constants.js                    # ROLES · PRESCRIPTION_STATUS · ALERT_SEVERITY · DOSAGE_FORMS
│   │
│   ├── /routes
│   │   ├── AppRoutes.jsx                   # All <Route> definitions — maps path to page component
│   │   └── ProtectedRoute.jsx              # Checks auth + role → redirects to /login if not allowed
│   │
│   ├── App.jsx                             # Root component — wraps AuthContext provider + BrowserRouter
│   ├── main.jsx                            # Entry — ReactDOM.createRoot('#root').render(<App />)
│   └── index.css                           # Tailwind directives only:
│                                           #   @tailwind base;
│                                           #   @tailwind components;
│                                           #   @tailwind utilities;
│
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js                      # Extend colors for PIMS teal brand
└── postcss.config.js                       # Required by Tailwind
```

### Frontend Routing Map

| Path                   | Component               | Allowed Roles              |
|------------------------|-------------------------|----------------------------|
| `/`                    | Redirect to `/login`    | Public                     |
| `/login`               | `Login.jsx`             | Public                     |
| `/dashboard`           | `DoctorDashboard.jsx`   | DOCTOR                     |
| `/pharmacist`          | `PharmacistDashboard.jsx`| PHARMACIST                |
| `/admin`               | `AdminDashboard.jsx`    | ADMIN                      |
| `/atc`                 | `ATCClassification.jsx` | DOCTOR                     |
| `/prescription/new`    | `NewPrescription.jsx`   | DOCTOR                     |
| `/prescriptions`       | `Prescriptions.jsx`     | DOCTOR, PHARMACIST         |
| `/inventory`           | `Inventory.jsx`         | PHARMACIST                 |
| `/alerts`              | `Alerts.jsx`            | PHARMACIST                 |
| `/reports`             | `Reports.jsx`           | ADMIN                      |
| `/admin/users`         | `UserManagement.jsx`    | ADMIN                      |

### Tailwind Config — PIMS Brand Colors

```js
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D7B6A',   // teal — buttons, active nav, badges
          light:   '#E6F5F2',   // light teal — card backgrounds, hover fills
          dark:    '#085C4F',   // dark teal — sidebar bg, page headers
        },
      },
    },
  },
  plugins: [],
}
```

---

## 7. Full Folder Structure — Backend

```
/backend
│
├── /src
│   │
│   ├── /config
│   │   ├── db.js                           # mongoose.connect(MONGO_URI) — called once in server.js
│   │   └── env.js                          # Checks all required env vars on startup — throws if missing
│   │
│   ├── /models                             # Mongoose schemas — one file per MongoDB collection
│   │   ├── User.model.js                   # Collection: users
│   │   ├── ATCCode.model.js                # Collection: atccodes
│   │   ├── Medicine.model.js               # Collection: medicines
│   │   ├── Patient.model.js                # Collection: patients
│   │   ├── Prescription.model.js           # Collection: prescriptions
│   │   ├── Inventory.model.js              # Collection: inventory
│   │   └── Alert.model.js                  # Collection: alerts
│   │
│   ├── /controllers                        # HTTP handlers — parse req, call service, send res
│   │   ├── auth.controller.js              # login() · logout() · getMe()
│   │   ├── user.controller.js              # getAll() · create() · update() · remove()
│   │   ├── atc.controller.js               # getTree() · getByCode() · search()
│   │   ├── medicine.controller.js          # getAll() · getById() · create() · update()
│   │   ├── patient.controller.js           # search() · getById() · create()
│   │   ├── prescription.controller.js      # getAll() · create() · getById() · updateStatus() · generatePDF()
│   │   ├── inventory.controller.js         # getAll() · addStock() · updateStock() · getAuditLog()
│   │   └── alert.controller.js             # getAll() · acknowledge() · dismiss()
│   │
│   ├── /services                           # Business logic — called by controllers only
│   │   ├── auth.service.js                 # verifyCredentials() · generateJWT() · hashPassword() · comparePassword()
│   │   ├── user.service.js                 # createWithTempPassword() · sendInviteEmail()
│   │   ├── atc.service.js                  # buildTree() · getNodeWithChildren() · searchByNameOrCode()
│   │   ├── medicine.service.js             # getByATCCode() · checkDrugInteractions()
│   │   ├── patient.service.js              # findOrCreate() · getAllergyWarnings()
│   │   ├── prescription.service.js         # buildDocument() · validateItems() · calculateTotal()
│   │   ├── inventory.service.js            # deductStock() · checkThreshold() · getExpiringSoon()
│   │   ├── alert.service.js                # createAlert() · getActiveBySeverity() · resolve()
│   │   └── pdf.service.js                  # generatePDF(rxId) — Puppeteer: HTML template → PDF buffer
│   │
│   ├── /routes                             # Express Router files — one per domain
│   │   ├── auth.routes.js                  # /api/auth/*
│   │   ├── user.routes.js                  # /api/users/*
│   │   ├── atc.routes.js                   # /api/atc/*
│   │   ├── medicine.routes.js              # /api/medicines/*
│   │   ├── patient.routes.js               # /api/patients/*
│   │   ├── prescription.routes.js          # /api/prescriptions/*
│   │   ├── inventory.routes.js             # /api/inventory/*
│   │   └── alert.routes.js                 # /api/alerts/*
│   │
│   ├── /middlewares
│   │   ├── auth.middleware.js              # verifyToken() — reads Authorization header → sets req.user
│   │   ├── role.middleware.js              # requireRole(...roles) — checks req.user.role is allowed
│   │   └── error.middleware.js             # Global error handler — catches all errors → JSON response
│   │
│   ├── /validators                         # express-validator chains — used in routes before controller
│   │   ├── auth.validator.js               # email format, password min 6 chars
│   │   ├── prescription.validator.js       # patientId required, items[] not empty, dose required
│   │   └── user.validator.js               # name, email, role must be valid enum
│   │
│   ├── /utils
│   │   ├── generateToken.js                # jwt.sign({ id, role }, JWT_SECRET, { expiresIn })
│   │   ├── responseHandler.js              # sendSuccess(res, data, msg) · sendError(res, msg, statusCode)
│   │   ├── constants.js                    # ROLES · PRESCRIPTION_STATUS · ALERT_TYPES · SEVERITY_LEVELS
│   │   └── emailTemplates.js               # HTML strings for invite email and Rx share email
│   │
│   ├── /jobs                               # Scheduled background tasks — node-cron
│   │   ├── expiryCheck.job.js              # Cron: "0 0 * * *" (daily midnight)
│   │   │                                   # Finds inventory expiring in < 30 days → creates NEAR_EXPIRY alert
│   │   │                                   # If already expired → creates EXPIRED CRITICAL alert
│   │   │
│   │   ├── lowStockCheck.job.js            # Cron: "0 */6 * * *" (every 6 hours)
│   │   │                                   # Finds inventory where currentStock < threshold
│   │   │                                   # Creates LOW_STOCK CRITICAL alert
│   │   │
│   │   └── seedATC.js                      # One-time seed script (not a cron)
│   │                                       # Run: node src/jobs/seedATC.js
│   │                                       # Reads /data/atc_codes.csv → inserts into atccodes collection
│   │
│   ├── /data
│   │   └── atc_codes.csv                   # Downloaded from github.com/fabkury/atcd
│   │                                       # Place here before running seedATC.js
│   │
│   ├── app.js                              # Express setup: cors, helmet, morgan, json parser, mount routes
│   └── server.js                           # Entry: db.connect() → app.listen(PORT)
│
├── package.json
└── .env
```

### Backend Request → Response Flow

```
HTTP Request
  ↓
  cors / helmet / morgan              (app.js — runs on every request)
  ↓
  express.json()                      (parse JSON body)
  ↓
  auth.middleware.js                  (verify JWT → set req.user = { id, role })
  ↓
  role.middleware.js                  (check req.user.role is in allowed roles)
  ↓
  express-validator rules             (validate req.body fields)
  ↓
  controller function                 (parse req → call service)
  ↓
  service function                    (business logic → call model)
  ↓
  Mongoose model                      (query MongoDB)
  ↓
  responseHandler.sendSuccess()       (JSON response back to client)
```

---

## 8. Database Models — MongoDB Schemas

### User — collection: `users`

```js
{
  _id:          ObjectId,
  firstName:    String,   required,
  lastName:     String,   required,
  email:        String,   required, unique,
  passwordHash: String,   required,          // bcrypt — never store plain text
  role:         String,   enum: ['DOCTOR', 'PHARMACIST', 'ADMIN', 'PATIENT'],
  isActive:     Boolean,  default: true,
  lastLogin:    Date,
  createdAt:    Date,     default: Date.now
}
```

### ATCCode — collection: `atccodes`

```js
{
  _id:         ObjectId,
  code:        String,  required, unique,   // "A10BA02"
  name:        String,  required,           // "Metformin"
  level:       Number,  min: 1, max: 5,
  parentCode:  String,                      // "A10BA" — null for level 1
  description: String
}
```

### Medicine — collection: `medicines`

```js
{
  _id:          ObjectId,
  name:         String,  required,          // "Metformin HCl 500mg"
  genericName:  String,  required,          // "Metformin"
  brand:        String,                     // "Glucophage"
  atcCode:      String,  required,          // "A10BA02"
  strength:     String,                     // "500mg"
  dosageForm:   String,  enum: ['Tablet', 'Capsule', 'Injection', 'Syrup', 'Cream', 'Inhaler'],
  manufacturer: String,                     // "Merck Group"
  mrp:          Number,                     // 23.22
  createdAt:    Date,    default: Date.now
}
```

### Patient — collection: `patients`

```js
{
  _id:       ObjectId,
  patientId: String,  required, unique,     // "P-123456"
  name:      String,  required,
  dob:       Date,    required,
  gender:    String,  enum: ['Male', 'Female', 'Other'],
  weight:    Number,                        // kg
  allergies: [{
    substance: String,                      // "Penicillin"
    severity:  String,  enum: ['Severe', 'Moderate', 'Mild']
  }],
  medicalHistory: [String],
  createdAt: Date,  default: Date.now
}
```

### Prescription — collection: `prescriptions`

```js
{
  _id:       ObjectId,
  rxId:      String,  required, unique,     // "RX-9021" — auto-generated
  patientId: { type: ObjectId, ref: 'Patient', required: true },
  doctorId:  { type: ObjectId, ref: 'User',    required: true },
  diagnosis: String,
  items: [{
    medicineId:   { type: ObjectId, ref: 'Medicine' },
    atcCode:      String,                   // "C09AA03"
    dose:         String,                   // "10mg"
    frequency:    String,                   // "TID" | "BID" | "OD" | "PRN"
    route:        String,                   // "Oral" | "Injection" | "Topical"
    durationDays: Number,
    instructions: String                    // "Take after food"
  }],
  status:           String,  enum: ['Pending', 'Processing', 'Filled', 'Cancelled'],  default: 'Pending',
  isUrgent:         Boolean, default: false,
  allowRefills:     Number,  max: 3, default: 0,
  digitalSignature: String,                 // "DSIG-SMITH-9921-X"
  pdfUrl:           String,
  createdAt:        Date,  default: Date.now,
  updatedAt:        Date
}
```

### Inventory — collection: `inventory`

```js
{
  _id:          ObjectId,
  medicineId:   { type: ObjectId, ref: 'Medicine', required: true },
  atcCode:      String,                     // denormalised for fast filter
  batchId:      String,  required,          // "AX-2023-001"
  currentStock: Number,  required, min: 0,
  threshold:    Number,  required,          // alert triggers when currentStock < threshold
  expiryDate:   Date,    required,
  storage:      String,                     // "Shelf A-12" | "Cold Storage Unit 2"
  status:       String,  enum: ['STABLE', 'LOW STOCK', 'NEAR EXPIRY', 'EXPIRED'],  default: 'STABLE',
  updatedAt:    Date,  default: Date.now
}
```

### Alert — collection: `alerts`

```js
{
  _id:            ObjectId,
  type:           String,  enum: ['LOW_STOCK', 'NEAR_EXPIRY', 'EXPIRED'],
  severity:       String,  enum: ['CRITICAL', 'WARNING', 'INFO'],
  medicineId:     { type: ObjectId, ref: 'Medicine' },
  message:        String,
  isAcknowledged: Boolean, default: false,
  acknowledgedBy: { type: ObjectId, ref: 'User' },
  createdAt:      Date,  default: Date.now
}
```

---

## 9. API Routes Reference

### Auth — `/api/auth`

| Method | Endpoint   | Auth | Role   | Description                      |
|--------|------------|------|--------|----------------------------------|
| POST   | `/login`   | No   | Public | Validate credentials, return JWT |
| POST   | `/logout`  | Yes  | Any    | Client clears token              |
| GET    | `/me`      | Yes  | Any    | Return current user profile      |

### Users — `/api/users`

| Method | Endpoint   | Auth | Role  | Description                       |
|--------|------------|------|-------|-----------------------------------|
| GET    | `/`        | Yes  | ADMIN | List all users                    |
| POST   | `/`        | Yes  | ADMIN | Create user + send invite email   |
| PUT    | `/:id`     | Yes  | ADMIN | Update role or active status      |
| DELETE | `/:id`     | Yes  | ADMIN | Deactivate user (soft delete)     |

### ATC Classification — `/api/atc`

| Method | Endpoint      | Auth | Role          | Description                  |
|--------|---------------|------|---------------|------------------------------|
| GET    | `/tree`       | Yes  | DOCTOR, ADMIN | Full tree Level 1–3          |
| GET    | `/:code`      | Yes  | DOCTOR, ADMIN | Node detail + children       |
| GET    | `/search`     | Yes  | DOCTOR        | Search by name or code `?q=` |

### Medicines — `/api/medicines`

| Method | Endpoint   | Auth | Role     | Description               |
|--------|------------|------|----------|---------------------------|
| GET    | `/`        | Yes  | Any auth | List, filter by atcCode   |
| GET    | `/:id`     | Yes  | Any auth | Single medicine detail    |
| POST   | `/`        | Yes  | ADMIN    | Add new medicine          |
| PUT    | `/:id`     | Yes  | ADMIN    | Update medicine           |

### Patients — `/api/patients`

| Method | Endpoint   | Auth | Role   | Description                      |
|--------|------------|------|--------|----------------------------------|
| GET    | `/`        | Yes  | DOCTOR | Search by name or patientId `?q=`|
| GET    | `/:id`     | Yes  | DOCTOR | Detail + allergy warnings        |
| POST   | `/`        | Yes  | DOCTOR | Create new patient               |

### Prescriptions — `/api/prescriptions`

| Method | Endpoint        | Auth | Role               | Description                        |
|--------|-----------------|------|--------------------|-------------------------------------|
| GET    | `/`             | Yes  | DOCTOR, PHARMACIST | List with status filter            |
| POST   | `/`             | Yes  | DOCTOR             | Create + submit to pharmacy        |
| GET    | `/:id`          | Yes  | DOCTOR, PHARMACIST | Full detail                        |
| PUT    | `/:id/status`   | Yes  | PHARMACIST         | Update status (Processing → Filled)|
| GET    | `/:id/pdf`      | Yes  | DOCTOR, PHARMACIST | Generate PDF download              |

### Inventory — `/api/inventory`

| Method | Endpoint   | Auth | Role        | Description               |
|--------|------------|------|-------------|---------------------------|
| GET    | `/`        | Yes  | PHARMACIST  | List with filters         |
| POST   | `/`        | Yes  | PHARMACIST  | Add new stock entry       |
| PUT    | `/:id`     | Yes  | PHARMACIST  | Update stock / batch      |
| GET    | `/audit`   | Yes  | ADMIN       | Full audit log            |

### Alerts — `/api/alerts`

| Method | Endpoint              | Auth | Role       | Description          |
|--------|-----------------------|------|------------|----------------------|
| GET    | `/`                   | Yes  | PHARMACIST | All active alerts    |
| PUT    | `/:id/acknowledge`    | Yes  | PHARMACIST | Mark acknowledged    |
| PUT    | `/:id/dismiss`        | Yes  | PHARMACIST | Dismiss warning      |

### Reports — `/api/reports`

| Method | Endpoint          | Auth | Role  | Description                           |
|--------|-------------------|------|-------|---------------------------------------|
| GET    | `/summary`        | Yes  | ADMIN | Rx volume, inventory value, uptime    |
| GET    | `/atcUsage`       | Yes  | ADMIN | Top ATC categories by Rx count        |
| GET    | `/fulfillment`    | Yes  | ADMIN | Pharmacist dispensing performance     |

---

## 10. RBAC — Role Based Access Control

### Express middleware

```js
// auth.middleware.js
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Unauthorised' })
  req.user = jwt.verify(token, process.env.JWT_SECRET)  // sets { id, role }
  next()
}

// role.middleware.js
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: 'Forbidden' })
  next()
}

// Route usage:
router.post('/prescriptions', verifyToken, requireRole('DOCTOR'), create)
router.get('/inventory',      verifyToken, requireRole('PHARMACIST'), getAll)
router.get('/users',          verifyToken, requireRole('ADMIN'), getAll)
```

### React route guard

```jsx
// ProtectedRoute.jsx
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, role } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(role)) return <Navigate to="/login" replace />
  return children
}

// AppRoutes.jsx
<Route path="/inventory" element={
  <ProtectedRoute allowedRoles={['PHARMACIST']}>
    <Inventory />
  </ProtectedRoute>
} />
```

### Feature access matrix

| Feature                     | DOCTOR | PHARMACIST | ADMIN |
|-----------------------------|:------:|:----------:|:-----:|
| View own dashboard          | ✅     | ✅         | ✅    |
| Create prescription         | ✅     | ❌         | ❌    |
| View ATC tree               | ✅     | ✅         | ✅    |
| View prescription list      | ✅     | ✅         | ❌    |
| Update prescription status  | ❌     | ✅         | ❌    |
| Manage inventory            | ❌     | ✅         | ❌    |
| Acknowledge alerts          | ❌     | ✅         | ✅    |
| Manage users                | ❌     | ❌         | ✅    |
| View reports                | ❌     | ❌         | ✅    |
| Seed / sync ATC database    | ❌     | ❌         | ✅    |

---

## 11. Business Logic

### Prescription → Inventory Flow

```
1. Doctor creates Rx  →  Prescription.status = "Pending"
2. Pharmacist opens   →  Prescription.status = "Processing"
3. Pharmacist dispenses:
     inventory.service.deductStock(medicineId, quantity) for each Rx item
     if inventory.currentStock < inventory.threshold after deduction:
       alert.service.createAlert({ type: 'LOW_STOCK', severity: 'CRITICAL' })
     Prescription.status = "Filled"
     Prescription.updatedAt = now
```

### Auto Alert Jobs (node-cron)

```
expiryCheck.job.js   —  cron "0 0 * * *"  (daily midnight)
  Inventory.find({ expiryDate: { $lt: addDays(today, 30) } })
  → createAlert({ type: 'NEAR_EXPIRY', severity: 'WARNING' })
  If expiryDate < today:
  → createAlert({ type: 'EXPIRED', severity: 'CRITICAL' })

lowStockCheck.job.js —  cron "0 */6 * * *"  (every 6 hours)
  Inventory.find({ $expr: { $lt: ['$currentStock', '$threshold'] } })
  → createAlert({ type: 'LOW_STOCK', severity: 'CRITICAL' })
```

### PDF Generation (PDFKit)

```
GET /api/prescriptions/:id/pdf

1. Fetch Rx, populate patient and doctor
2. Build PDF Document using pdfkit:
     - Doctor letterhead (name, qualification, hospital, registration)
     - Patient info (name, age, weight, diagnosis)
     - Rx table (medicine name, ATC code, dose, frequency, duration)
     - Digital signature block and barcode
3. PDFKit streams directly to response:
     res.set('Content-Type', 'application/pdf')
     doc.pipe(res)
     doc.end()
```

### Drug Interaction Check

```
When doctor adds a drug to NewPrescription.jsx:
  POST /api/medicines/interactions  { newDrug, existingItems[] }
  medicine.service.checkDrugInteractions() compares ATC drug classes
  Returns { status: 'Clear' | 'Warning' | 'Critical', interactions: [] }
  Displayed in Validation Status box on screen 6
```

### Admin User Creation

```
Admin fills Create User modal → POST /api/users
  user.service.createWithTempPassword():
    tempPassword = generateRandom16Chars()
    passwordHash = bcrypt.hash(tempPassword, 10)
    User.create({ ...data, passwordHash })
    Nodemailer.sendInviteEmail(email, tempPassword, role)
  User must reset password on first login
```

---

## 12. Environment Variables

### `/backend/.env`

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB — primary database
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pims?retryWrites=true&w=majority

# JWT
JWT_SECRET=minimum_32_character_random_string_here
JWT_EXPIRES_IN=7d

# Nodemailer — Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourapp@gmail.com
SMTP_PASS=xxxx_xxxx_xxxx_xxxx     # 16-char App Password from myaccount.google.com/apppasswords

# Puppeteer
# Leave blank to use bundled Chromium — or set path on Linux servers
PUPPETEER_EXECUTABLE_PATH=

# CORS — must match Vite dev server URL
CLIENT_URL=http://localhost:5173
```

### `/frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> Add both `.env` files to `.gitignore`. Never commit secrets.

---

## 13. Setup & Run Instructions

### Prerequisites — install on all team machines before Day 1

```
Node.js v20 LTS   →  nodejs.org/en/download
npm v10+          →  comes with Node
Git               →  git-scm.com
VS Code           →  code.visualstudio.com
MongoDB Atlas     →  cloud.mongodb.com  (free tier — no local install needed)

Recommended VS Code extensions:
  ESLint · Prettier · Tailwind CSS IntelliSense · Thunder Client
```

### Step 1 — Clone

```bash
git clone https://github.com/your-org/pims-project.git
cd pims-project
```

### Step 2 — Backend

```bash
cd backend
npm install
cp .env.example .env          # fill in MONGO_URI, JWT_SECRET, SMTP credentials

# Seed ATC data — P2 runs this once on Day 1
# Download atc_codes.csv from github.com/fabkury/atcd
# Place at: backend/src/data/atc_codes.csv
node src/jobs/seedATC.js

npm run dev                   # Express on http://localhost:5000
# Verify: GET http://localhost:5000/api/health → { "status": "ok" }
```

### Step 3 — Frontend

```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_BASE_URL=http://localhost:5000/api
npm run dev                   # Vite on http://localhost:5173
```

### Step 4 — Seed test users (run once)

```bash
cd backend
node src/jobs/seedUsers.js
# doctor@pims.com   / test123  → DOCTOR
# pharma@pims.com   / test123  → PHARMACIST
# admin@pims.com    / test123  → ADMIN
```

### Git Branching

```
main          production only — PRs required, no direct commits
dev           team integration — all features merge here
feature/*     one branch per task

Workflow:
  git checkout dev && git pull
  git checkout -b feature/your-task-name
  # code → commit
  git push origin feature/your-task-name
  # open Pull Request into dev
```

---

## 14. MVP Scope — April 2025

### Included — Web App only

| Feature                          | Backend     | Frontend |
|----------------------------------|-------------|----------|
| Login with role selector + JWT   | P1          | P3       |
| Doctor Dashboard                 | P1          | P3       |
| Pharmacist Dashboard             | P2          | P4       |
| Admin Dashboard                  | P1          | P3       |
| ATC tree browser + search        | P2          | P3       |
| New prescription form            | P1          | P4       |
| Prescription management + detail | P1          | P4       |
| Inventory management table       | P2          | P4       |
| System alerts (auto + manual)    | P1 (cron)   | P4       |
| PDF prescription generation      | P6          | P4       |
| Share Rx via email               | P6          | P4       |
| Reports & analytics charts       | P2          | P3       |
| Admin user management            | P1          | P3       |

### Excluded from MVP

- Mobile app (Android / iOS) — web only for now
- Desktop app (Electron) — web only for now
- Advanced drug interaction database
- External EHR / HL7 integration
- Payment or billing module
- Multi-hospital / multi-tenant

---

## 15. April Sprint Plan

### Team

| Person | Role           | Owns                                          |
|--------|----------------|-----------------------------------------------|
| P1     | Tech Lead      | Auth, Prescriptions API, Admin API, Cron jobs |
| P2     | Backend Dev    | ATC seed + API, Medicines, Inventory API       |
| P6     | Backend Dev    | PDF service (Puppeteer), Email (Nodemailer)    |
| P3     | Frontend Dev 1 | Login, Dashboards, ATC tree UI, Reports        |
| P4     | Frontend Dev 2 | Prescription form, Inventory UI, Alerts UI     |

### Weeks

| Week | Dates         | Backend focus                                  | Frontend focus                              |
|------|---------------|------------------------------------------------|---------------------------------------------|
| 1    | Apr 1 – 5     | DB models, Express + CORS setup, Auth API, ATC seed | Vite + Tailwind setup, Login screen, routing |
| 2    | Apr 7 – 11    | ATC API, Drug search, Patient API → **FREEZE** | ATC tree UI, Doctor Dashboard, Patient lookup |
| 3    | Apr 14 – 19   | Prescription API, Inventory API, PDF service   | New Rx form, Prescription list, Inventory UI |
| 4    | Apr 22 – 30   | Alerts + cron jobs, Reports API, Deploy        | Alerts UI, Reports charts, Admin screens, Polish |

> **API Freeze — April 11.** No backend contract changes after this without lead approval.
> Frontend builds against stable, documented endpoints from Week 3.

> **Daily Standup — 11 AM, 10 min.** Done · Doing · Blocker. Lead resolves blockers same day.

---

## 16. Dataset Sources & References

| # | Source                | URL                                                                 | Notes                                      |
|---|-----------------------|---------------------------------------------------------------------|--------------------------------------------|
| 1 | WHO ATC/DDD Toolkit   | [who.int/tools/atc-ddd-toolkit](https://www.who.int/tools/atc-ddd-toolkit) | Gold standard reference · cite in report |
| 2 | WHO WHOCC ATC Index   | [atcddd.fhi.no](https://atcddd.fhi.no)                             | Free with registration · annual update     |
| 3 | fabkury/atcd          | [github.com/fabkury/atcd](https://github.com/fabkury/atcd)         | **Use for seeding** · 6,331 codes · CSV    |
| 4 | Kaggle WHO ATC/DDD    | [kaggle.com/datasets/remulusbi/who-atcddd](https://www.kaggle.com/datasets/remulusbi/who-atcddd) | Alternative CSV |
| 5 | DrugBank              | [go.drugbank.com](https://go.drugbank.com)                         | Drug detail + interaction reference        |

**Formal citation:**
> WHO Collaborating Centre for Drug Statistics Methodology.
> *ATC classification index with DDDs, 2026.* Oslo, Norway, 2025.

---

## 17. Open Source References

> Study these repos for MERN patterns, Mongoose schemas and Express API structure.
> Use for learning only — do not copy.

| Repo | Stack | What to study |
|------|-------|---------------|
| [mahadevm6/Pharmacy-Management-System](https://github.com/mahadevm6/-Pharmacy-Management-System) | React + Node + Express + MongoDB | CRUD patterns, API structure |
| [malithJayasinghe2000/Pharmacy-management-system](https://github.com/malithJayasinghe2000/Pharmacy-management-system) | Full MERN | Mongoose models, Express routes |
| [LalanaChami/Pharmacy-Mangment-System](https://github.com/LalanaChami/Pharmacy-Mangment-System) | MEAN + JWT + Nodemailer | Email share feature |
| [github.com/topics/pharmacy-management-system](https://github.com/topics/pharmacy-management-system) | Various | 50+ repos to browse |

---

## 18. Viva / Demo Line

> *"PIMS is a role-based full-stack web application built on the MERN stack —
> MongoDB, Express.js, React with Tailwind CSS, and Node.js —
> that integrates WHO ATC drug classification with prescription creation,
> inventory management, and automated alerts,
> with role-based access control for Doctors, Pharmacists, and Admins."*

---

## Quick Commands

```bash
# Backend
cd backend
npm run dev           # nodemon dev server on port 5000
npm run start         # production server
npm run seed:atc      # seed ATC codes (once, Day 1)
npm run seed:users    # seed test users

# Frontend
cd frontend
npm run dev           # Vite dev server on port 5173
npm run build         # production build → /dist
npm run preview       # preview production build
```

---

*PIMS — Pharmacy Information Management System*
*MERN Stack · Web App Only · React + Vite + Tailwind CSS · Express · MongoDB*
*SIT Bangalore · B.E. Computer Science · 2022–2026 · April 2025*
