# CivicVoice — Location-Based Civic Issue Dispatch & Resolution Platform

> **A community-driven digital civic platform connecting citizen dispatches directly to municipal public works with transparent, before-and-after photo verification, real PostgreSQL database, and role-based authorization.**

[![React 19](https://img.shields.io/badge/Frontend-React%2019%20+%20Vite%208-blue.svg)](https://react.dev/)
[![Node Express](https://img.shields.io/badge/Backend-Node.js%20+%20Express-green.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg)](https://www.postgresql.org/)
[![RBAC](https://img.shields.io/badge/Security-JWT%20+%20RBAC-red.svg)]()
[![Status](https://img.shields.io/badge/Civic%20Lifecycle-7--Stage-10B981.svg)]()

---

## 🏛️ 1. Project Overview

Citizens regularly encounter civic problems such as hazardous potholes, damaged road asphalt, overflowing garbage dumpsters, broken streetlamps causing blackout zones, clogged storm drains, and compromised park infrastructure.

**CivicVoice** provides an intuitive, location-based reporting and resolution tracking platform that eliminates bureaucratic black holes. Instead of filing reports into forgotten municipal inboxes, citizens dispatch geolocated reports with photographic proof, neighbors can co-sign existing issues to prevent duplicates, and city crews must upload verified completion evidence before citizens certify the fix.

The application is structured into a clean full-stack architecture:
- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Web Audio API synthesis.
- **Backend API**: Node.js & Express REST API with JWT authentication and strict Role-Based Access Control (RBAC).
- **Database**: PostgreSQL storing users, roles, issues, lifecycle audit logs, co-signs, and citizen verifications.

---

## 📂 2. Final Project Structure

```text
CivicVoice/
│
├── frontend/                     # React 19 + Vite Frontend Application
│   ├── src/
│   │   ├── components/           # UI Components, Modals, Postal Staging
│   │   │   ├── AuthModal.jsx     # Real Citizen & Officer Authentication Modal
│   │   │   ├── Navbar.jsx        # Role-aware Navigation Bar & User Profile
│   │   │   ├── IssueCard.jsx     # Dispatch Card with RBAC Action Buttons
│   │   │   ├── IssueTimelineModal.jsx
│   │   │   ├── IssueReportModal.jsx
│   │   │   ├── AdminActionModal.jsx
│   │   │   └── CitizenVerifyModal.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication State & Session Persistence
│   │   ├── services/
│   │   │   └── api.js            # API Client handling Bearer Token & Calls
│   │   ├── data/                 # Themes and Static Metadata
│   │   └── utils/audio.js        # Synthesized Web Audio API Engine
│   ├── public/                   # Static Postal Assets
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Node.js + Express REST API
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js       # PostgreSQL Pool & In-Memory Test Adapter
│   │   │   ├── env.js            # Environment Variable Loader
│   │   │   ├── initDb.js         # Schema Initializer Script
│   │   │   └── seedDb.js         # Seed Data Populator Script
│   │   ├── controllers/
│   │   │   ├── authController.js # Register, Login, Me, Logout
│   │   │   ├── issueController.js# CRUD, Status, Upvotes, Verifications
│   │   │   ├── municipalController.js
│   │   │   └── adminController.js# User Registry & RBAC Role Management
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js # authenticateUser, authorizeRoles, optionalAuth
│   │   │   └── errorMiddleware.js# Safe Error Handling & 404 Routing
│   │   ├── models/
│   │   │   ├── userModel.js      # Parameterized PostgreSQL Queries for Users
│   │   │   └── issueModel.js     # Parameterized PostgreSQL Queries for Issues
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── issueRoutes.js
│   │   │   ├── municipalRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── utils/response.js     # Standardized JSON Response Formatter
│   │   ├── app.js                # Express App Configuration
│   │   └── server.js             # Server Startup & DB Health Check
│   ├── test/
│   │   └── auth_rbac_suite.js    # Comprehensive 14-Scenario Validation Suite
│   ├── uploads/                  # ₹0 Local File Storage for Evidence Photos
│   ├── package.json
│   ├── .env.example              # Template with Placeholders Only
│   └── .env                      # Local Development Environment Configuration
│
├── database/
│   ├── schema.sql                # Complete Relational PostgreSQL DDL
│   └── seed.sql                  # Seed Accounts (Hashed Passwords) & Issues
│
├── package.json                  # Workspace Scripts
├── README.md
└── .gitignore
```

---

## 🔒 3. Authentication & Security Architecture

CivicVoice implements real server-side authentication and authorization. No mock authentication or frontend-only role switches are used.

```text
[Frontend Client] 
       │
       │  POST /api/auth/login { email, password }
       ▼
[Express Auth Controller]
       │
       │  Validate inputs & lookup user in PostgreSQL
       ▼
[PostgreSQL Database] ───► Return user record + bcrypt password_hash
       │
       │  bcrypt.compare(plainPassword, password_hash)
       ▼
[JWT Token Signer] ──────► Issues signed token { id, email, role } (7d expiry)
       │
       ▼
[Client State] ──────────► Stores token in localStorage (`cv_token`),
                           sends Bearer token in subsequent requests
```

### Password Security
- Passwords are never stored in plaintext.
- Passwords are automatically hashed using **bcrypt** with cost factor 10.
- `password_hash` is stripped and never returned in API responses.

### Public Registration Integrity
- Public registration (`POST /api/auth/register`) **always assigns the `CITIZEN` role**.
- Any role parameter sent by the frontend during registration is ignored by the backend.
- `MUNICIPAL` and `ADMIN` accounts are created strictly through controlled seeding or administrative assignment.

### Session Persistence & Browser Refresh
- On page refresh, the frontend calls `GET /api/auth/me` with the stored JWT token.
- The backend verifies the token and fetches the current user from PostgreSQL.
- If valid, the session is restored; if expired or tampered, the session is cleared.

---

## 🛡️ 4. Role-Based Access Control (RBAC) Matrix

CivicVoice enforces three distinct roles at both the backend API layer and the UI layer:

| Feature / Action | Citizen (CITIZEN) | Municipal Officer (MUNICIPAL) | System Admin (ADMIN) | Enforcing Backend Route |
|---|:---:|:---:|:---:|---|
| **View public issues & map** | ✓ | ✓ | ✓ | `GET /api/issues` |
| **View issue timeline & proof** | ✓ | ✓ | ✓ | `GET /api/issues/:id` |
| **Dispatch / Report new issue** | ✓ | ✗ | ✓ (test/admin) | `POST /api/issues` |
| **Co-sign / Upvote dispatches** | ✓ | ✗ | ✓ | `POST /api/issues/:id/upvote` |
| **Citizen verify / reopen fix** | ✓ | ✗ | ✓ | `POST /api/issues/:id/verify` |
| **Update lifecycle status** | ✗ | ✓ | ✓ | `PATCH /api/issues/:id/status` |
| **Municipal triage dashboard** | ✗ | ✓ | ✓ | `GET /api/municipal/overview` |
| **View system user registry** | ✗ | ✗ | ✓ | `GET /api/admin/users` |
| **Change user roles** | ✗ | ✗ | ✓ | `PATCH /api/admin/users/:id/role` |
| **Administrative overview** | ✗ | ✗ | ✓ | `GET /api/admin/overview` |
| **Delete / Moderate issues** | ✗ | ✗ | ✓ | `DELETE /api/issues/:id` |

> **Civic Workflow Enforcement**: Issue dispatching is strictly a Citizen action (`CITIZEN`). Municipal officers (`MUNICIPAL`) are dispatch managers and field squad supervisors whose responsibility is reviewing and advancing resolution, so direct dispatching is blocked with **403 Forbidden**. System Administrators (`ADMIN`) retain dispatch access for emergency and testing purposes.
>
> **Backend RBAC Enforcement**: Frontend checks only adapt the visual presentation (e.g. hiding administrative buttons). Authorization is strictly enforced by the backend middleware (`authorizeRoles`). Even if a user alters their role in browser memory, any unauthorized API request returns **403 Forbidden**.

---

## 🐘 5. PostgreSQL Database Setup & Installation

CivicVoice uses **PostgreSQL** as its persistent relational database.

### 5.1 Local PostgreSQL Installation
If PostgreSQL is not already installed on your machine:

- **Windows**: Download and run the official installer from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/). Keep the default port `5432` and set a password for the `postgres` superuser (e.g., `postgres`).
- **macOS**: `brew install postgresql@16 && brew services start postgresql@16`
- **Linux (Ubuntu/Debian)**: `sudo apt update && sudo apt install -y postgresql postgresql-contrib && sudo systemctl start postgresql`

### 5.2 Create the Database
Open PostgreSQL shell (`psql`) or your terminal:

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create the application database
CREATE DATABASE civicvoice;

# Exit psql
\q
```

### 5.3 Run Schema and Seed Files
You can initialize the database using either the built-in npm commands or native `psql`:

**Option A — Using Built-in Node Scripts (Recommended, works cross-platform):**
```bash
# In the repository root:
npm run db:init
npm run db:seed
```

**Option B — Using native `psql` command:**
```bash
psql -U postgres -d civicvoice -f database/schema.sql
psql -U postgres -d civicvoice -f database/seed.sql
```

---

## 🔑 6. Development Test Accounts

The seed script creates three pre-configured accounts for development and grading:

| Role | Email Identifier | Password | Department / Description |
|---|---|---|---|
| **Citizen** | `citizen@civicvoice.org` | `Citizen@123` | Maya Lin — Civic Steward (Level 3) |
| **Municipal** | `municipal@civicvoice.org` | `Municipal@123` | Supervisor R. Vance — Dept of Public Works Field Squad |
| **Admin** | `admin@civicvoice.org` | `Admin@123` | Commissioner Elena Rostova — Executive Municipal Oversight Board |

> In the frontend UI, clicking **Sign In** in the top navigation reveals a **Quick-Fill Credentials** drawer to populate any of these test credentials with one click.

---

## ⚙️ 7. Environment Variables Configuration

The backend reads configuration from `backend/.env`. A template is provided in `backend/.env.example`:

```bash
# Server Port
PORT=5000

# Node Environment
NODE_ENV=development

# PostgreSQL Connection String (RECOMMENDED)
# Replace YOUR_PASSWORD with your local PostgreSQL password:
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/civicvoice

# Alternative discrete PostgreSQL parameters (used if DATABASE_URL is not set):
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=civicvoice

# JWT Secret Key
JWT_SECRET=civicvoice_jwt_secret_dev_key_change_in_production_2026
JWT_EXPIRES_IN=7d
```

> **Strict PostgreSQL Connection Policy**: The real backend connects directly to PostgreSQL via `DATABASE_URL` (or discrete credentials). There is **no in-memory emulator or mock data** in the application runtime. If PostgreSQL is offline or credentials are misconfigured, the backend reports a clear error (`Database connection failed: ...`) and rejects queries instead of using fake data.
>
> **Testing Strategy**: The automated test suite (`npm run backend:test`) connects to your live PostgreSQL database if configured, or uses an isolated test adapter strictly within the test harness to validate all 18 authentication & RBAC logic rules.

---

## 🚀 8. Running the Application

### 8.1 Start the Backend
```bash
# From repository root:
npm run backend:dev

# Or directly in the backend folder:
cd backend
npm run dev
```
The API server starts on `http://localhost:5000`.

### 8.2 Start the Frontend
```bash
# From repository root in a separate terminal:
npm run frontend:dev

# Or directly in the frontend folder:
cd frontend
npm run dev
```
The Vite development server starts on `http://localhost:5173`.

---

## 🧪 9. Automated Testing & Verification

CivicVoice includes an automated test suite verifying all 14 authentication and RBAC scenarios:

```bash
npm run backend:test
```

### Test Results Summary:
- ✅ **Test 1**: Register citizen creates account in database with `CITIZEN` role.
- ✅ **Test 2**: Registering with duplicate email is rejected (400).
- ✅ **Test 3**: Login with correct password succeeds and issues signed JWT.
- ✅ **Test 4**: Login with incorrect password is rejected (401).
- ✅ **Test 5**: Citizen accesses citizen functionality (creates issue).
- ✅ **Test 6**: Citizen accessing municipal API returns **403 Forbidden**.
- ✅ **Test 7**: Citizen accessing admin API returns **403 Forbidden**.
- ✅ **Test 8**: Municipal officer accesses municipal functionality (200).
- ✅ **Test 8b**: Municipal officer updates issue lifecycle status (200).
- ✅ **Test 9**: Municipal officer accessing admin API returns **403 Forbidden**.
- ✅ **Test 10**: Admin accesses admin functionality (user registry, 200).
- ✅ **Test 11**: Unauthenticated request to protected API returns **401 Unauthorized**.
- ✅ **Test 12**: User logs out and session terminates.
- ✅ **Test 13**: Browser refresh (`GET /api/auth/me`) restores authenticated state.
- ✅ **Test 14**: Tampered frontend role is completely rejected by backend RBAC (**403 Forbidden**).

---

## 📡 10. API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new Citizen account
- `POST /api/auth/login` — Sign in and obtain JWT
- `GET /api/auth/me` — Retrieve current authenticated profile (Requires Bearer token)
- `POST /api/auth/logout` — Terminate session

### Issues (`/api/issues`)
- `GET /api/issues` — List all issues (optional query params: `category`, `status`, `search`)
- `GET /api/issues/stats` — Ledger and transparency statistics
- `GET /api/issues/:id` — Retrieve full issue details and timeline
- `POST /api/issues` — Dispatch / report new civic issue (Requires Authentication)
- `POST /api/issues/:id/upvote` — Co-sign / endorse an issue (Requires Authentication)
- `POST /api/issues/:id/verify` — Citizen verify or reopen completed issue (Requires Authentication)
- `PATCH /api/issues/:id/status` — Advance lifecycle status (Requires `MUNICIPAL` or `ADMIN`)
- `DELETE /api/issues/:id` — Delete / moderate issue (Requires `ADMIN`)

### Municipal Operations (`/api/municipal`)
- `GET /api/municipal/overview` — Officer triage statistics and queue (Requires `MUNICIPAL` or `ADMIN`)

### Administrative Operations (`/api/admin`)
- `GET /api/admin/users` — Full system user registry (Requires `ADMIN`)
- `PATCH /api/admin/users/:id/role` — Update user roles (Requires `ADMIN`)
- `GET /api/admin/overview` — Administrative system overview (Requires `ADMIN`)
