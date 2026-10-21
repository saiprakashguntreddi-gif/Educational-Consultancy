# Superconsciousness — Engineering Documentation Hub

Welcome to the central technical documentation for **Superconsciousness**, an integrated educational consultancy and student guidance platform.

This documentation serves as the single source of truth for architecture, domain boundaries, database designs, module contracts, and team development standards.

---

## Documentation Directory Map

| Directory | Topic | Description |
| :--- | :--- | :--- |
| [`architecture/`](file:///c:/Users/guntr/OneDrive/Desktop/suntechwebs/Superconsciousness/docs/architecture/system-overview.md) | **System Architecture** | High-level system design, modular architecture, and service boundaries |
| [`architecture/domain-boundaries.md`](file:///c:/Users/guntr/OneDrive/Desktop/suntechwebs/Superconsciousness/docs/architecture/domain-boundaries.md) | **Domain Boundaries** | Separation of Student, Counsellor, Admin, and Shared services |
| [`architecture/authentication-and-rbac.md`](file:///c:/Users/guntr/OneDrive/Desktop/suntechwebs/Superconsciousness/docs/architecture/authentication-and-rbac.md) | **Auth & Roles** | JWT authentication, role definitions, and access control matrix |
| [`database/`](file:///c:/Users/guntr/OneDrive/Desktop/suntechwebs/Superconsciousness/docs/database/schema-design.md) | **Database & Models** | PostgreSQL relational schema, field specifications, and indexes |
| [`modules/module-1-profile-intake.md`](file:///c:/Users/guntr/OneDrive/Desktop/suntechwebs/Superconsciousness/docs/modules/module-1-profile-intake.md) | **Module 1 Specification** | Student Account and Profile Intake architecture and verification |
| [`modules/module-extension-guide.md`](file:///c:/Users/guntr/OneDrive/Desktop/suntechwebs/Superconsciousness/docs/modules/module-extension-guide.md) | **Module Extension Guide** | Step-by-step instructions for team members to build subsequent modules |
| [`team-workflows/git-workflow.md`](file:///c:/Users/guntr/OneDrive/Desktop/suntechwebs/Superconsciousness/docs/team-workflows/git-workflow.md) | **Team Git Strategy** | Branching model, merge etiquette, and conflict prevention |
| [`team-workflows/code-standards.md`](file:///c:/Users/guntr/OneDrive/Desktop/suntechwebs/Superconsciousness/docs/team-workflows/code-standards.md) | **Code Standards** | TypeScript conventions, error handling, and lint rules |
| [`api/api-contracts.md`](file:///c:/Users/guntr/OneDrive/Desktop/suntechwebs/Superconsciousness/docs/api/api-contracts.md) | **API Contracts** | Endpoints, payloads, and response envelopes for all services |

---

## Core Tenets

1. **Strict Modularity**: Each business domain lives in an isolated module with its own controller, service, validation, and route boundaries.
2. **Conflict-Free Team Collaboration**: Independent module namespaces enable multiple engineers to work on separate modules simultaneously without merge conflicts.
3. **Data Integrity First**: Rigorous schema validation on ingress (via Zod) and strong relational integrity on storage (via PostgreSQL & Prisma).
4. **No Premature Optimization or Hallucinated Data**: Modules only build against validated product specifications. No mock student data as production records.
