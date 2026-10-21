# Module 2 — Preferences Specification

## 1. Module Objective

As defined on Page 7 (Section 5) of the original Superconsciousness platform requirements document (`SUPERCONSCIOUSNES1 (1).pdf`):

> **"Module 2 - Preferences: Capture the academic direction and personal evidence needed for accurate matching."**
> 
> **Steps:**
> 1. Select priority countries and study destinations.
> 2. Select department and sub-department or specialization.

Module 2 builds upon the verified student profile established in Module 1 to record the student's desired geographic and academic destinations, enabling downstream matching, university shortlisting, and personalized educational counselling.

---

## 2. Core Functional Requirements

### 1. Priority Countries & Study Destinations
- Allows students to select multiple priority destination countries (e.g., United States, United Kingdom, Canada, Australia, Germany, Ireland, Singapore, etc.).
- Allows adding custom or niche destination countries (e.g., Switzerland, Japan, South Korea, UAE).
- Explicitly designates a **Primary Destination Country** (`primaryCountry`) ranked as the student's #1 destination choice.
- Validation: Requires at least 1 destination country and enforces a maximum of 15 destinations.

### 2. Department & Sub-Department / Specialization
- Allows students to select an authoritative academic **Department / Discipline** (e.g., *Engineering & Technology*, *Computer Science & IT*, *Business & Management*, *Health & Medicine*, etc.).
- Dynamically populates corresponding **Sub-Department / Specialization** options based on the chosen department.
- Supports **Custom Specialization** text input for interdisciplinary programs or emerging fields.
- Validation: Requires both department and sub-department/specialization (minimum 2 characters, trimmed).

---

## 3. Database Architecture

The preferences data is persisted in the `StudentPreference` table in a strict 1:1 relation with `StudentProfile`:

```prisma
model StudentPreference {
  id                 String          @id @default(uuid())
  studentProfileId   String          @unique
  studentProfile     StudentProfile  @relation(fields: [studentProfileId], references: [id], onDelete: Cascade)

  // Module 2 Core Fields
  // 1. Priority Countries and Study Destinations
  countries          String          // JSON array string of selected countries, e.g. ["United States", "United Kingdom"]
  primaryCountry     String?         // Priority #1 destination country

  // 2. Department and Sub-Department / Specialization
  department         String          // Department (e.g., "Engineering & Technology")
  subDepartment      String          // Sub-department or Specialization (e.g., "Artificial Intelligence & Machine Learning")

  createdAt          DateTime        @default(now())
  updatedAt          DateTime        @updatedAt

  @@index([studentProfileId])
  @@index([department])
}
```

### Migration History:
- Added non-destructive `StudentPreference` model to `backend/prisma/schema.prisma` and `backend/prisma/schema.postgresql.prisma`.
- Applied via `prisma db push` cleanly without data loss or dropping tables.

---

## 4. API Contracts

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `POST` | `/api/v1/preferences/me` | `STUDENT` | Save student preferences for authenticated user |
| `PUT` | `/api/v1/preferences/me` | `STUDENT` | Update student preferences for authenticated user |
| `GET` | `/api/v1/preferences/me` | `STUDENT` | Retrieve current student's saved preferences |
| `GET` | `/api/v1/preferences/profile/:studentProfileId` | `COUNSELLOR`, `ADMIN` | Inspect preferences for a specific student profile |

### Audit Logging
Every creation and update of student preferences automatically logs an immutable event in the `AuditLog` table with action `PREFERENCES_SAVED` containing the preference ID, student profile ID, country list, primary country, department, and specialization.

---

## 5. Frontend Integration & Components

- **`StudentPreferencesPage.tsx`**: Located in `frontend/src/modules/preferences/pages/`. Uses the Midnight Slate design system (`glass-panel`, `btn-primary`, `form-input`, `badge-verified`).
  - Interactive multi-select country chips.
  - Custom destination country adder.
  - Star toggle to designate Primary Target.
  - Linked academic department and specialization dropdowns.
  - Dynamic custom track text input.
  - Real-time saved summary card.
  - Prerequisite guard: Guides uninitialized students to complete Module 1 profile first.
- **`Navbar.tsx`**: Adds "Module 2: Preferences" navigation button for authenticated students.
- **`StudentProfilePage.tsx`**: Displays a banner after profile submission guiding students to proceed to Module 2.
- **`CounsellorQueuePage.tsx`**: Renders student's Module 2 Preferences inside the Counsellor Record Verification inspection panel.
