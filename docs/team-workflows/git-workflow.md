# Team Git Workflow & Branch Isolation Strategy

This document details the Git branching model, pull request protocol, and merge guidelines for the Superconsciousness engineering team.

---

## 1. Branch Strategy

The team adopts **Feature-Branch Gitflow** with trunk stabilization:

- **`main`**: Production-ready branch. Code here is deployable at any time.
- **`develop`**: Integration branch for completed module features.
- **`feat/module-<number>-<feature-name>`**: Dedicated feature branches created from `develop`.

### Branch Naming Conventions
- `feat/module-1-intake-validation`
- `feat/module-1-verification-queue`
- `fix/auth-jwt-expiration`
- `docs/api-contracts-update`

---

## 2. Preventing Merge Conflicts

1. **One Module per Branch**: Developers working on different modules should never edit the same module directory.
2. **Rebase Frequently**: Pull and rebase against `develop` regularly:
   ```bash
   git checkout feat/my-feature
   git pull --rebase origin develop
   ```
3. **Keep `app.ts` Mounts Alphabetical / Ordered**: Router registrations in `backend/src/app.ts` should be added in a single distinct line to minimize merge collisions.

---

## 3. Pull Request (PR) Checklist

Before submitting a PR, verify:
- [ ] `npm run build` passes in both `backend` and `frontend`.
- [ ] No fake or mock student records are committed as production seeds.
- [ ] New endpoints have corresponding Zod validation schemas.
- [ ] New Prisma schema changes include migration files in `backend/prisma/migrations/`.
- [ ] At least one peer review approval is obtained before merging.
