# Engineering Code Standards & Conventions

---

## 1. Naming Conventions

| Item | Convention | Example |
| :--- | :--- | :--- |
| **Files & Directories** | Kebab-case with domain extension | `profile.service.ts`, `auth.routes.ts`, `api-client.ts` |
| **Classes & Components**| PascalCase | `ProfileService`, `ProfileIntakeForm`, `AuthController` |
| **Methods & Functions** | camelCase | `saveIntake()`, `generateTokens()`, `verifyProfile()` |
| **Constants & Enums**   | UPPER_SNAKE_CASE | `COMMON_BOARDS`, `Role.STUDENT`, `VerificationStatus.VERIFIED` |
| **Database Models**     | PascalCase (singular) | `User`, `StudentProfile`, `AuditLog` |
| **Database Fields**     | camelCase | `fullName`, `passingOutYear`, `contactEmail` |

---

## 2. API Response Standard

All endpoints must return responses following the `ApiResponsePayload` interface:

```typescript
// Success format (200, 201)
{
  "success": true,
  "message": "Profile intake submitted successfully",
  "data": { ... },
  "timestamp": "2026-10-17T10:45:00.000Z"
}

// Failure format (400, 401, 403, 404, 422, 500)
{
  "success": false,
  "message": "Validation failed",
  "error": { ... },
  "timestamp": "2026-10-17T10:45:00.000Z"
}
```

---

## 3. Error Handling

- Never swallow errors with empty `catch` blocks.
- In Express controllers, always forward unexpected errors to `next(error)`.
- Use descriptive domain error messages rather than raw database or SQL error outputs.
