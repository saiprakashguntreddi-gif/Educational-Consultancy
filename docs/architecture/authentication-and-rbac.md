# Authentication & Role-Based Access Control (RBAC)

Superconsciousness enforces strict, role-aware security policies across all endpoints and UI screens.

---

## 1. Authentication Lifecycle

1. **Registration**:
   - Students register with their email, password (hashed using bcrypt with 12 salt rounds), and strictly enforced role `STUDENT`.
   - Public registration ignores any client-supplied role to prevent privilege escalation.
   - Audit log records account registration.
2. **Token Issuance**:
   - Upon successful credential verification, an **Access Token** (short-lived, 1 day) and a **Refresh Token** (long-lived, 7 days) are generated using HMAC-SHA256 (`jsonwebtoken`).
   - The token payload carries `{ userId, email, role }`.
3. **Protected Ingress**:
   - `authenticateJwt` middleware extracts the Bearer token from the `Authorization` header, verifies validity and expiration, and attaches the `AuthenticatedUser` payload to `req.user`.

---

## 2. Platform Role Structure

| Role | Definition | Permissions |
| :--- | :--- | :--- |
| **`STUDENT`** | Individual seeking educational guidance and consultancy. | Can submit/update own Profile Intake (Module 1); can view own verified record status. Cannot verify profiles or view other students' records. |
| **`COUNSELLOR`** | Certified educational advisor. | Can view student profile verification queue; can authenticate/verify or reject student records with advisory notes. Cannot modify platform governance settings. |
| **`ADMIN`** | System administrator. | Full access across all domains, verification actions, audit logs, and user roles. |

---

## 3. RBAC Middleware Implementation

Routes are protected declaratively using `requireRoles(...)`:

```typescript
// Example: Route restricted only to Counsellors and Admins
router.patch(
  '/:id/verify',
  authenticateJwt,
  requireRoles(Role.COUNSELLOR, Role.ADMIN),
  validateRequest(verifyProfileSchema),
  ProfileController.verifyProfile
);
```
