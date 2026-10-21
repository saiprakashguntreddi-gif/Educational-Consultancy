# Domain Boundaries & Responsibility Matrix

To prevent code entanglement and maintain high developer velocity, Superconsciousness strictly separates concerns between Authentication, Student Profiles, Counsellor/Admin Functionality, and Shared Services.

---

## 1. Authentication Domain (`src/modules/auth/`)
- **Primary Responsibility**: Identity management, user onboarding, session token issuance, and password security.
- **Entities Owned**: `User` table (credentials, email, role, active status).
- **Prohibited Responsibilities**:
  - Does NOT handle educational background or address details.
  - Does NOT store counselling notes or profile verification statuses.
- **Public Interface**:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `GET /api/v1/auth/me`

---

## 2. Student Profile Domain (`src/modules/profile/` — Module 1)
- **Primary Responsibility**: Account and Profile Intake; establishing and maintaining the verified student record.
- **Entities Owned**: `StudentProfile` table (the 9 required intake fields + verification state).
- **Required Fields Captured**:
  1. Full Name
  2. Gender
  3. Class / Grade
  4. Contact Email
  5. Phone Number
  6. Address (Street, City, State, Postal Code, Country)
  7. Board / Curriculum
  8. Citizenship
  9. Passing-out Year
- **Prohibited Responsibilities**:
  - Does NOT issue JWT tokens (delegated to Auth).
  - Does NOT calculate recommendation scores (deferred to future modules).
  - Does NOT schedule appointments or webinars.
- **Public Interface**:
  - `POST /api/v1/profile/intake` (Student submission)
  - `GET /api/v1/profile/me` (Student view)
  - `GET /api/v1/profile/review` (Counsellor/Admin queue)
  - `GET /api/v1/profile/:id` (Counsellor/Admin detail)
  - `PATCH /api/v1/profile/:id/verify` (Counsellor/Admin action)

---

## 3. Counsellor & Admin Domain (`src/modules/counsellor/`, `src/modules/admin/`)
- **Primary Responsibility**: Educational consultancy operations, profile verification reviews, and platform governance.
- **Entities Owned**: Scaffolding for counsellor allocations and administrative audit reviews.
- **Prohibited Responsibilities**:
  - Cannot alter student profile intake fields directly (students submit; counsellors verify or request updates).

---

## 4. Shared Services (`src/shared/`)
- **Primary Responsibility**: Database pooling (`prisma.service.ts`), response wrappers (`api-response.ts`), error interception, authentication middleware, and RBAC guards.
- **Rule**: Shared services must remain completely agnostic of specific domain rules.
