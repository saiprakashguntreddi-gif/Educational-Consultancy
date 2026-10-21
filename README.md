# Superconsciousness — Integrated Educational Consultancy & Student Guidance Platform

**Superconsciousness** is a modular educational consultancy and student guidance platform built to empower students with verified profile intakes, structured guidance, and role-based advisory.

---

## 📌 Development Status & Scope

> **Phase**: Module 1 (Profile Intake) & Module 2 (Preferences)  
> **Status**: Module 1 & Module 2 Operational  
> **Active Modules**:
> - **Module 1**: Account and Profile Intake (9 mandatory fields, verification workflow)
> - **Module 2**: Preferences (Priority countries/destinations, academic departments & specializations)  
> **Subsequent Modules**: Modules 3+ (Assessments, Discovery, Scholarships) are strictly deferred until scheduled.

---

## 🏗️ Project Structure

The codebase is organized as a modular workspace cleanly partitioned into `backend`, `frontend`, and an extensive `docs/` technical hub:

```
Superconsciousness/
├── backend/                             # Backend API service (Node.js, Express, TypeScript, Prisma)
│   ├── prisma/
│   │   └── schema.prisma                # Relational PostgreSQL schema (User, StudentProfile, AuditLog)
│   ├── src/
│   │   ├── config/                      # Environment variables, constants, and RBAC matrix
│   │   │   ├── env.ts
│   │   │   ├── roles.ts                 # STUDENT, COUNSELLOR, ADMIN role permissions
│   │   │   └── constants.ts             # Gender options, boards, grades
│   │   ├── modules/                     # Domain modules (isolated business verticals)
│   │   │   ├── auth/                    # Authentication domain (Register, Login, JWT tokens)
│   │   │   ├── profile/                 # MODULE 1: Student Account and Profile Intake
│   │   │   ├── counsellor/              # Counsellor verification gateway boundary
│   │   │   └── admin/                   # Admin governance boundary
│   │   ├── shared/                      # Shared infrastructure (agnostic to domain rules)
│   │   │   ├── database/                # Singleton Prisma client pool
│   │   │   ├── middleware/              # JWT auth, RBAC guards, Zod validation, Error handlers
│   │   │   ├── utils/                   # Standard ApiResponse envelope, structured logger, bcrypt
│   │   │   └── types/                   # Express request extensions
│   │   ├── app.ts                       # Express application assembly
│   │   └── server.ts                    # Server startup and graceful termination
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                            # Modern responsive web client (React 18, Vite, TypeScript)
│   ├── src/
│   │   ├── config/                      # API endpoint registry
│   │   ├── modules/                     # Feature modules corresponding to backend domains
│   │   │   ├── auth/                    # Sign In and Registration pages
│   │   │   ├── profile/                 # MODULE 1: Profile Intake form & verified record view
│   │   │   ├── counsellor/              # Verification queue & inspection panel
│   │   │   └── home/                    # Platform overview & architecture status
│   │   ├── shared/                      # Global UI components, AuthContext, design tokens
│   │   │   ├── components/              # Navbar, Footer, UI elements
│   │   │   ├── context/                 # AuthContext (user, token, session)
│   │   │   ├── services/                # Unified API client fetch wrapper
│   │   │   └── styles/                  # Midnight Slate design system (CSS variables, glassmorphism)
│   │   ├── App.tsx                      # View router
│   │   └── main.tsx                     # React DOM entry
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
│
├── docs/                                # Dedicated Documentation Hub
│   ├── architecture/
│   │   ├── system-overview.md           # System design & modular monolith pattern
│   │   ├── domain-boundaries.md         # Separation of concerns & prohibited cross-domain imports
│   │   └── authentication-and-rbac.md   # JWT token lifecycle & role permission matrix
│   ├── database/
│   │   ├── schema-design.md             # Data dictionary, relationships, & indexes
│   │   └── migration-strategy.md        # Safe Prisma migration guidelines
│   ├── modules/
│   │   ├── module-1-profile-intake.md   # Complete specification of the 9 required fields
│   │   └── module-extension-guide.md    # Instructions for building subsequent modules without conflicts
│   ├── team-workflows/
│   │   ├── git-workflow.md              # Branch naming, PR protocols, & collision prevention
│   │   └── code-standards.md            # TypeScript standards, naming rules, & error envelopes
│   ├── api/
│   │   └── api-contracts.md             # Request payloads, endpoints, & response envelopes
│   └── README.md                        # Documentation Hub index
│
├── .gitignore                           # Git ignore rules for node, dist, and secrets
├── package.json                         # Workspace orchestrator
└── README.md                            # Project overview & quickstart
```

---

## 🎯 Module 1: Account and Profile Intake

Module 1 captures the 9 required profile fields to create an authoritative, verified student record:

1. **Name (`fullName`)**: Full legal student name
2. **Gender (`gender`)**: `MALE`, `FEMALE`, `NON_BINARY`, `OTHER`, `PREFER_NOT_TO_SAY`
3. **Class / Grade (`grade`)**: Current grade level (Grade 9–12, Undergraduate, etc.)
4. **Email (`contactEmail`)**: Contact communication email
5. **Phone (`phone`)**: Contact phone number with country code
6. **Address (`address`)**: Street, City, State, Postal Code / PIN, Country
7. **Board / Curriculum (`board`)**: CBSE, ICSE, IB, Cambridge, State Board, etc.
8. **Citizenship (`citizenship`)**: Nationality / Citizenship country
9. **Passing-out Year (`passingOutYear`)**: Secondary / Higher-secondary completion year

### Verification Lifecycle
Every submitted intake begins with `verificationStatus: PENDING`. Certified counsellors or platform administrators review the record in the verification queue and designate it as `VERIFIED` (timestamped and logged) or `REJECTED` (with corrective guidance notes).

---

## 🌍 Module 2: Preferences

Module 2 captures the student's academic direction and country destinations as mandated by Section 5 (Page 7) of the Superconsciousness requirements:

1. **Priority Countries & Study Destinations**:
   - Interactive selection from top destinations (United States, United Kingdom, Canada, Australia, Germany, Ireland, Singapore, etc.).
   - Support for custom destination country additions.
   - Designated Primary Destination ranking (#1 choice).
   - Validation: 1 to 15 destination countries.
2. **Department and Sub-Department / Specialization**:
   - Categorized academic disciplines (Engineering & Technology, Computer Science & IT, Business & Management, Health Sciences, etc.).
   - Dynamic sub-departments and specializations with custom track input support.
3. **Counsellor Integration**:
   - Student preferences are integrated into the Counsellor Verification Queue inspection panel alongside the Module 1 profile record.

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **PostgreSQL**: Local or hosted database instance

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Configure your DATABASE_URL in .env
npm install
npm run db:generate
npm run dev
```
Backend API will start on `http://localhost:5000` with health check available at `/api/health`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend development server will start on `http://localhost:3000` with automatic `/api` proxy to the backend.

---

## 👥 Multi-Developer Team Workflow

To prevent merge conflicts across developers:
1. **Module Isolation**: Each engineer works inside their own module folder (`backend/src/modules/<module-name>/` and `frontend/src/modules/<module-name>/`).
2. **Independent Routes**: Each module mounts its routes on a dedicated URL prefix in `app.ts`.
3. **Non-Destructive Database Expansion**: Future modules create new models linked by foreign key to `StudentProfile.id` rather than altering Module 1 tables.
4. **Standard Contracts**: All modules use the shared `ApiResponse` envelope and Zod validation middleware.

For full developer onboarding and guidelines, consult the [`docs/`](docs/README.md) hub.
