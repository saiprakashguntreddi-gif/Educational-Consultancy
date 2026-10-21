# Module Extension Guide for Engineering Teams

This guide explains how future team members can build separate modules (e.g., Module 2: Assessments, Module 3: College Discovery, etc.) concurrently without causing merge conflicts or breaking existing features.

---

## 1. Anatomy of a Domain Module

Each module in Superconsciousness must be self-contained within its own folder under `src/modules/<module_name>/`.

```
backend/src/modules/<new_module>/
├── <new_module>.routes.ts       # Router definitions & route-level middleware
├── <new_module>.controller.ts   # Express request handlers & status codes
├── <new_module>.service.ts      # Pure domain logic & Prisma database calls
├── <new_module>.validation.ts   # Zod input validation schemas
└── <new_module>.types.ts        # TypeScript interfaces and DTOs
```

Correspondingly on the frontend:
```
frontend/src/modules/<new_module>/
├── components/                  # Domain-specific UI components
├── pages/                       # Route screen components
├── services/                    # Module API service calling backend
└── <new_module>.types.ts        # Shared TypeScript interfaces
```

---

## 2. Step-by-Step Module Creation Protocol

### Step 1: Define Database Models (if required)
In `backend/prisma/schema.prisma`, create your new model with a foreign key pointing to `StudentProfile`:
```prisma
model AssessmentResult {
  id               String         @id @default(uuid())
  studentProfileId String
  studentProfile   StudentProfile @relation(fields: [studentProfileId], references: [id], onDelete: Cascade)
  score            Float
  createdAt        DateTime       @default(now())
}
```
*Never edit or remove existing columns in `StudentProfile` or `User`.*

### Step 2: Implement Input Validation
In `backend/src/modules/<new_module>/<new_module>.validation.ts`, create strict Zod schemas for all client ingress data.

### Step 3: Implement Business Logic
In `backend/src/modules/<new_module>/<new_module>.service.ts`, implement business methods that accept typed arguments and return typed results.

### Step 4: Implement Controller & Router
In `backend/src/modules/<new_module>/<new_module>.controller.ts` and `*.routes.ts`, wire up endpoints using standard middleware:
```typescript
router.post(
  '/submit',
  authenticateJwt,
  requireRoles(Role.STUDENT),
  validateRequest(assessmentSubmitSchema),
  AssessmentController.submit
);
```

### Step 5: Mount Router in `backend/src/app.ts`
Mount your router using a dedicated path prefix (e.g., `/api/v1/assessments`):
```typescript
app.use('/api/v1/assessments', assessmentRouter);
```
*Because each module uses its own prefix and files, multiple developers working on different modules touch completely disjoint files!*

---

## 3. Conflict Prevention Rules

1. **No Cross-Module Domain Contamination**: Module A should not import service classes directly from Module B unless through a documented shared facade or by querying data through the database.
2. **Do Not Touch Core Middlewares**: Modify `src/shared/middleware/` only after team consensus.
3. **Use Standard Response Envelopes**: Always return data via `ApiResponse.success(res, data)` and `ApiResponse.error(res, error)`.
