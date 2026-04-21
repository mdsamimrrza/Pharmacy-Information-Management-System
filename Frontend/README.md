# PIMS Frontend

Role-based React web app for the Pharmacy Information Management System (PIMS).

## Overview

This frontend is the web UI for:

- Login with role selection (Doctor, Pharmacist, Admin)
- ATC drug classification browsing and search
- Prescription creation and management
- Inventory and alerts workflows
- Admin reporting and user management screens

Core journey:

1. Doctor logs in and creates prescriptions from ATC-classified medicines.
2. Pharmacist receives prescriptions, checks stock, and dispenses.
3. Admin manages users and monitors reports/alerts.

Web only (React + Vite). No mobile or desktop app.

## Frontend Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | ^18.x | Component-based UI |
| Vite | ^5.x | Dev server + build tool |
| Tailwind CSS | ^3.x | Utility-first styling |
| React Router DOM | ^6.x | Client-side routing + protected pages |
| Redux Toolkit | ^2.2.x | Global state management (auth, user management) |
| Axios | ^1.x | HTTP client with JWT interceptor |
| React Hook Form | ^7.x | Form handling and validation |
| Recharts | ^2.x | Reports and analytics charts |

Notes:

- Redux Toolkit is used for auth and admin user management state.
- No Ant Design or MUI; all styling uses Tailwind CSS and custom CSS.
- Environment variables are read from `.env` file (e.g., `VITE_API_BASE_URL`, `VITE_ADMIN_LOGIN_KEY`).

## Development Setup

```bash
cd Frontend
npm install
cp .env.example .env  # Create environment config
npm run dev          # Start Vite dev server on http://localhost:5173
```

**Note:** The dev server proxies `/api/*` requests to the backend (default `http://localhost:5000`), or to production API if `VITE_API_BASE_URL` is configured.

Build for production:

```bash
npm run build        # Generate optimized build in dist/
npm run preview      # Preview production build locally
```

## Folder Structure (Reference)

```text
/frontend
|
├── /public
│   └── favicon.ico
|
├── /src
│   ├── /assets
│   │   ├── logo.svg
│   │   └── /icons
│   │
│   ├── /components
│   │   ├── /common
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Spinner.jsx
│   │   │   └── EmptyState.jsx
│   │   ├── /layout
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Topbar.jsx
│   │   │   └── MainLayout.jsx
│   │   ├── /auth
│   │   │   └── RolePicker.jsx
│   │   ├── /atc
│   │   │   ├── ATCTreeNode.jsx
│   │   │   ├── ATCTree.jsx
│   │   │   └── ATCDrugDetail.jsx
│   │   ├── /prescription
│   │   │   ├── MedicinePicker.jsx
│   │   │   ├── PrescriptionItem.jsx
│   │   │   └── PrescriptionDetail.jsx
│   │   ├── /inventory
│   │   │   ├── InventoryRow.jsx
│   │   │   └── AddMedicineForm.jsx
│   │   └── /alerts
│   │       └── AlertCard.jsx
│   │
│   ├── /pages
│   │   ├── Login.jsx
│   │   ├── DoctorDashboard.jsx
│   │   ├── PharmacistDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── ATCClassification.jsx
│   │   ├── NewPrescription.jsx
│   │   ├── Prescriptions.jsx
│   │   ├── Inventory.jsx
│   │   ├── Alerts.jsx
│   │   ├── Reports.jsx
│   │   └── UserManagement.jsx
│   │
│   ├── /context
│   │   ├── AuthContext.jsx
│   │   └── AlertContext.jsx
│   │
│   ├── /hooks
│   │   ├── useAuth.js
│   │   ├── useDebounce.js
│   │   └── useAlerts.js
│   │
│   ├── /services
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── atcService.js
│   │   ├── medicineService.js
│   │   ├── patientService.js
│   │   ├── prescriptionService.js
│   │   ├── inventoryService.js
│   │   └── alertService.js
│   │
│   ├── /utils
│   │   ├── formatDate.js
│   │   ├── formatCurrency.js
│   │   ├── getStatusColor.js
│   │   └── constants.js
│   │
│   ├── /routes
│   │   ├── AppRoutes.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
|
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Current Workspace Structure (Actual)

```text
Frontend/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── components/
    │   ├── RolePicker.jsx
    │   ├── StatCard.jsx
    │   └── Topbar.jsx
    ├── constants/
    │   └── roles.js
    ├── layouts/
    │   ├── AuthLayout.jsx
    │   └── MainLayout.jsx
    ├── pages/
    │   ├── Admin.jsx
    │   ├── Alerts.jsx
    │   ├── ATCClassification.jsx
    │   ├── Dashboard.jsx
    │   ├── Inventory.jsx
    │   ├── Login.jsx
    │   ├── Prescription.jsx
    │   ├── Prescriptions.jsx
    │   └── Reports.jsx
    ├── routes/
    │   ├── AppRoutes.jsx
    │   └── ProtectedRoute.jsx
    ├── store/
    │   └── store.js
    └── styles/
        └── global.css
```

## Frontend Routes (Reference Contract)

| Path | Component | Allowed Roles |
|---|---|---|
| / | Redirect to /login | Public |
| /login | Login.jsx | Public |
| /dashboard | DoctorDashboard.jsx | DOCTOR |
| /pharmacist | PharmacistDashboard.jsx | PHARMACIST |
| /admin | AdminDashboard.jsx | ADMIN |
| /atc | ATCClassification.jsx | DOCTOR |
| /prescription/new | NewPrescription.jsx | DOCTOR |
| /prescriptions | Prescriptions.jsx | DOCTOR, PHARMACIST |
| /inventory | Inventory.jsx | PHARMACIST |
| /alerts | Alerts.jsx | PHARMACIST |
| /reports | Reports.jsx | ADMIN |
| /admin/users | UserManagement.jsx | ADMIN |

## Screen Inventory (Reference)

1. Login / Role Select
2. Doctor Dashboard
3. Pharmacist Dashboard
4. Admin Dashboard
5. ATC Drug Classification
6. New Prescription
7. Prescription Management
8. Inventory Management
9. System Alerts
10. Reports & Analytics
11. User Management

## Environment Variables

Create `Frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Do not commit secrets.

## Setup and Run

```bash
cd Frontend
npm install
cp .env.example .env
npm run dev
```

Default local URL: http://localhost:5173

## Quick Commands

```bash
cd Frontend
npm run dev
npm run build
npm run preview
```

## Integration Notes

- Backend expected at `http://localhost:5000`.
- API base URL should point to `/api`.
- Protected routes must enforce role checks equivalent to backend RBAC.
