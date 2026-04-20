# Backend Task List

Audit basis:
- `Backend/README.md`
- root `README.md`
- current `Backend/src` implementation

## Status Snapshot

Implemented today:
- [x] Core backend bootstrap: env loading, DB connection, auth, users, ATC, medicines
- [x] Replace the stubbed `src/jobs/seedATC.js` with a real CSV import script
- [x] Add the Patients API module and wire `/api/patients`
- [x] Add the Prescriptions API module and wire `/api/prescriptions`
- [x] Add the Inventory API module and wire `/api/inventory`
- [x] Add the Alerts API module and wire `/api/alerts`
- [x] Add the admin inventory audit endpoint
- [x] Add reports endpoints under `/api/reports`
- [x] Add prescription PDF export
- [x] Add dev email outbox support
- [x] Add background inventory alert jobs
- [x] Add a backend module verification script

Still missing or incomplete compared with the READMEs:
- [x] Backend README alignment with the actual implementation
- [x] Deeper automated API/integration tests

## Priority Order

### P0: Fix documented-but-broken pieces
- [x] Implement `seedATC.js`
- [x] Align backend README with the code that actually exists today
- [x] Remove or finish unused backend files/utilities where needed

### P1: Finish MVP backend domains
- [x] Patients API
- [x] Prescriptions API
- [x] Inventory API
- [x] Alerts API

### P2: Harden current modules
- [x] Add validators to auth, users, medicines, and ATC search inputs
- [x] Add the admin inventory audit route
- [x] Add safer duplicate checks on user and medicine updates
- [x] Add route coverage for delete operations that already exist in services
- [x] Expand pagination/filtering consistently across every list endpoint

### P3: Secondary workflow features
- [x] PDF service for prescriptions
- [x] Email support
- [x] Cron jobs for stock / expiry
- [x] Reporting endpoints

## Working Rule

We will complete this one item at a time, verify each item, then move to the next highest-priority task.
