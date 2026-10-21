# Module 7: Three-Tier Fit and Recommendation Engine

## 1. Overview
Module 7 introduces the **Three-Tier Fit and Recommendation Engine** to the SUPERCONSCIOUSNESS platform. It reads validated student profiles (academics, target destinations, preferred department and specializations, entrance exams, and financial alignment) and matches them against published college catalogue offerings, admission thresholds, and historical cohort statistics.

The engine organizes institutions into a balanced application portfolio divided into three clear likelihood categories:
- **Safe (>95% admission likelihood)**: Academic aggregate comfortably exceeds baseline benchmarks; highly favorable selectivity.
- **Best-Fit (50% – 95% likelihood)**: Strong academic alignment within normal admit ranges.
- **Aspirational (<50% likelihood)**: Reach targets, highly selective institutions, or competitive academic thresholds.

---

## 2. Core Principles & Anti-Hallucination Rules
In strict compliance with architectural rules:
1. **Never Invent Data**: If historical cohort distribution data or official acceptance rates are absent, the engine explicitly sets `isDataIndicative = true` and generates a transparent `dataLimitationNote` informing students and counsellors that the estimate is derived from baseline published criteria.
2. **Verified Profile Gate**: Students with `PENDING` or `REJECTED` profiles cannot generate official recommendations. A certified counsellor must authenticate the student's academic record in Module 1 before recommendation processing is permitted.
3. **Counsellor Review & Guidance**: Counsellors can review generated batches, add advisory notes, and adjust item tiers (e.g. adjust an item to Aspirational or Best-Fit based on holistic context).
4. **Shortlist Synchronization**: Shortlisting a recommended college seamlessly synchronizes with the student's saved institutions in Module 6 (`StudentSavedInstitution`).

---

## 3. Classification Algorithm & Fit Scoring

### Weighted Evaluation Factors (100-Point Score)
1. **Academic Alignment (45%)**:
   - Compares student's aggregate percentage against `minPercentageRequirement` and `acceptanceRate`.
   - Calculates percentage margin: `studentPercentage - benchmarkPercentage`.
2. **Preference Match (30%)**:
   - Destination country alignment (+15 pts for primary country match, +10 pts for secondary).
   - Department and specialization availability (+15 pts).
3. **Financial Feasibility (15%)**:
   - Evaluates tuition range alignment and scholarship availability.
4. **Standardized Exam Preparedness (10%)**:
   - Checks planned or achieved scores in required entrance exams (SAT, IELTS, TOEFL, etc.).

### Categorization Boundaries
- **SAFE**:
  - Admission probability: `95% - 99%`
  - Fit Score $\ge 82$
  - Academic aggregate exceeds benchmark by $\ge +8\%$ (or baseline $\ge 85\%$ when selectivity is open)
- **BEST-FIT**:
  - Admission probability: `50% - 94%`
  - Fit Score between $55$ and $81$
  - Academic aggregate meets benchmark within $[-3\%, +7\%]$
- **ASPIRATIONAL**:
  - Admission probability: `10% - 49%`
  - Fit Score $< 55$ or highly selective (acceptance rate $< 20\%$ or academic aggregate below target threshold)

---

## 4. Balanced Application Portfolio Recommendation
The engine recommends a balanced distribution:
- **2 Safe Options**: Ensure guaranteed admissions and security.
- **3–4 Best-Fit Options**: Core targets matching the student's profile.
- **2 Aspirational Options**: Ambitious reach colleges to unlock maximum potential.

---

## 5. Database Architecture (`backend/prisma/schema.prisma`)

```prisma
model RecommendationBatch {
  id               String                   @id @default(uuid())
  studentProfileId String
  studentProfile   StudentProfile           @relation(fields: [studentProfileId], references: [id], onDelete: Cascade)
  status           RecommendationBatchStatus @default(GENERATED)
  strategySummary  String
  counsellorNotes  String?
  reviewedBy       String?
  reviewedAt       DateTime?
  items            RecommendationItem[]
  createdAt        DateTime                 @default(now())
  updatedAt        DateTime                 @updatedAt
}

model RecommendationItem {
  id                 String             @id @default(uuid())
  batchId            String
  batch              RecommendationBatch @relation(fields: [batchId], references: [id], onDelete: Cascade)
  institutionId      String
  institution        Institution        @relation(fields: [institutionId], references: [id], onDelete: Cascade)
  courseId           String?
  course             Course?            @relation(fields: [courseId], references: [id], onDelete: SetNull)
  tier               RecommendationTier // SAFE, BEST_FIT, ASPIRATIONAL
  counsellorTier     RecommendationTier?
  admissionChanceMin Float              // e.g. 0.95
  admissionChanceMax Float              // e.g. 0.99
  fitScore           Float              // 0 to 100
  reasonSummary      String
  academicEvidence   String             // JSON payload
  preferenceEvidence String             // JSON payload
  financialEvidence  String?            // JSON payload
  examEvidence       String?            // JSON payload
  isDataIndicative   Boolean            @default(true)
  dataLimitationNote String?
  isShortlisted      Boolean            @default(false)
  shortlistedAt      DateTime?
  counsellorNotes    String?
  sortOrder          Int                @default(0)
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt
}
```

---

## 6. API Reference (`/api/v1/recommendations`)

| Method | Endpoint | Auth Roles | Description |
|---|---|---|---|
| `GET` | `/api/v1/recommendations/my` | `STUDENT` | Get student's active recommendation batch |
| `POST` | `/api/v1/recommendations/generate` | `STUDENT` | Generate or refresh 3-tier recommendation batch |
| `POST` | `/api/v1/recommendations/items/:id/shortlist` | `STUDENT` | Shortlist recommendation & sync to Module 6 saved list |
| `GET` | `/api/v1/recommendations/items/:id/cohort-analytics` | `STUDENT`, `COUNSELLOR`, `ADMIN` | Retrieve scatter-plot percentiles & student coordinates |
| `GET` | `/api/v1/recommendations/student/:studentProfileId` | `COUNSELLOR`, `ADMIN` | Fetch student recommendations for staff review |
| `POST` | `/api/v1/recommendations/student/:studentProfileId/generate` | `COUNSELLOR`, `ADMIN` | Staff-triggered batch generation for student |
| `PATCH` | `/api/v1/recommendations/batches/:batchId/review` | `COUNSELLOR`, `ADMIN` | Record counsellor review status & advisory notes |
| `PATCH` | `/api/v1/recommendations/items/:id/counsellor-tier` | `COUNSELLOR`, `ADMIN` | Override recommendation tier category with notes |

---

## 7. Security & Anti-IDOR Protections
- **Student Isolation**: Students can only view, generate, or shortlist recommendations associated with their own `StudentProfile`. Cross-student operations are blocked with HTTP 403 Forbidden.
- **Verification Rule**: Unverified profiles receive a clear requirement status (`verificationRequired: true`) without throwing server errors or fabricating data.
- **Audit Logging**: All generation, review, and override events are recorded in `AuditLog` for transparency.
