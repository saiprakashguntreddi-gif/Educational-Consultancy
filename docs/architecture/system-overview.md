# System Architecture Overview

## 1. System Vision

**Superconsciousness** is an integrated educational consultancy and student guidance platform designed to guide students through academic decision-making, profile verification, and structured counselling.

To ensure long-term scalability and allow multiple engineering teams to develop future modules independently, the system is architected as a **modular monolith** with clear domain isolation, strict interface contracts, and independent database models.

```
+-------------------------------------------------------------------------+
|                           Client Layer (React / Vite)                   |
|   +-------------------+  +---------------------+  +-----------------+   |
|   |   Auth UI Module  |  |  Profile UI Module  |  | Counsellor /    |   |
|   |                   |  |      (Module 1)     |  | Admin UI Module |   |
|   +-------------------+  +---------------------+  +-----------------+   |
+-------------------------------------------------------------------------+
                                    |
                            HTTP / REST / JSON
                                    |
+-------------------------------------------------------------------------+
|                      API Gateway & Middleware Layer                     |
|      [Helmet Security] [CORS] [JWT Authentication] [RBAC Guard]         |
+-------------------------------------------------------------------------+
                                    |
+-------------------------------------------------------------------------+
|                          Domain Modules Layer                           |
|  +--------------------+  +--------------------+  +--------------------+ |
|  |    Auth Domain     |  |   Profile Domain   |  | Counsellor / Admin | |
|  |  (Identity/Tokens) |  |     (Module 1)     |  |  Domain Boundaries | |
|  +--------------------+  +--------------------+  +--------------------+ |
|                                   |                                     |
|  +--------------------------------------------------------------------+ |
|  |                       Future Modules Gateway                       | |
|  | (Module 2: Assessments, Module 3: Discovery, Module 4: Guidance)   | |
|  +--------------------------------------------------------------------+ |
+-------------------------------------------------------------------------+
                                    |
+-------------------------------------------------------------------------+
|                      Data & Persistence Layer                           |
|       Prisma ORM | PostgreSQL Database | Immutable Audit Logs           |
+-------------------------------------------------------------------------+
```

## 2. Core Architectural Principles

### 2.1 Domain-Driven Isolation
Each functional unit (Auth, Profile, Counsellor, Admin) resides in its own isolated module with four internal layers:
- **Routes (`*.routes.ts`)**: HTTP method bindings, authentication guards, and schema validation middleware.
- **Controller (`*.controller.ts`)**: Request parsing, response formatting via unified envelope, and status codes.
- **Service (`*.service.ts`)**: Pure business logic, persistence operations, and transaction management.
- **Validation (`*.validation.ts`)**: Type-safe input validation using Zod schemas.

### 2.2 Strict Shared Services
Cross-cutting infrastructure concerns (database connection, token signing, password hashing, centralized error handling, and structured logging) are kept strictly in `src/shared/`. Domain modules import from `shared`, but `shared` never depends on domain modules.

### 2.3 Forward Compatibility for Future Modules
Module 1 creates the verified student record. Future modules (such as Assessments, College Discovery, Scholarship Matching, and Recommendation Logic) will consume this verified record by referencing `studentProfileId` without modifying Module 1 internals.
