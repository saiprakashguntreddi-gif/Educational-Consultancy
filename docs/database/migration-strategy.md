# Database Migration & Schema Evolution Strategy

As the Superconsciousness platform expands to include subsequent modules, the database schema will evolve. This guide outlines how engineers manage schema changes safely without downtime or conflicts.

---

## 1. Migration Tooling

The platform uses **Prisma Migrate** to maintain version-controlled SQL migrations in `backend/prisma/migrations/`.

### Development Workflow
1. Modify `backend/prisma/schema.prisma` to add new models, relations, or fields.
2. Run migration generator:
   ```bash
   cd backend
   npm run db:migrate -- --name descriptive_migration_name
   ```
3. Prisma generates SQL files and automatically regenerates `@prisma/client`.

---

## 2. Rules for Multi-Developer Schema Changes

1. **Never alter existing Module 1 columns**: When building future modules, add new models (e.g. `AssessmentRecord`, `CollegeDiscoveryPreference`) that reference `StudentProfile.id` as a foreign key rather than mutating existing columns.
2. **Add Non-Destructive Fields Only**: If adding a new column to `StudentProfile`, it must be nullable (`?`) or have a default value (`@default(...)`).
3. **Check for Migration Collisions**: Before opening a Pull Request, rebase against `main` and verify that no conflicting migration folders exist.
4. **No Direct Production Edits**: Never alter database schemas manually in production; all production updates are applied strictly via CI/CD `prisma migrate deploy`.
